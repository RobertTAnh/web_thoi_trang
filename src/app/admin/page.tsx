import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";

export default async function AdminDashboard() {
  const [
    orderCount,
    productCount,
    pendingSync,
    lowStock,
    recentOrders,
    recentLogs,
    completedAgg,
    completedItems,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { syncStatus: { in: ["PENDING_SYNC", "SYNC_FAILED"] } } }),
    prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.syncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { total: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: "COMPLETED" }, costPrice: { not: null } },
      select: { price: true, costPrice: true, quantity: true },
    }),
  ]);

  const completedRevenue = completedAgg._sum.total || 0;
  const completedProfit = completedItems.reduce((sum, item) => {
    return sum + (item.price - (item.costPrice || 0)) * item.quantity;
  }, 0);

  const cards = [
    { label: "Đơn hàng", value: String(orderCount), href: "/admin/orders" },
    { label: "Sản phẩm", value: String(productCount), href: "/admin/products" },
    { label: "Cần sync Sapo", value: String(pendingSync), href: "/admin/orders" },
    { label: "Tồn thấp (≤5)", value: String(lowStock), href: "/admin/products" },
    {
      label: "DT đơn hoàn thành",
      value: formatVnd(completedRevenue),
      href: "/admin/crm",
    },
    {
      label: "Lãi đơn hoàn thành",
      value: formatVnd(completedProfit),
      href: "/admin/crm",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border border-line bg-white p-5 hover:border-accent"
          >
            <p className="text-xs tracking-wide text-muted uppercase">{card.label}</p>
            <p className="mt-2 font-display text-3xl">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-white p-5">
          <h2 className="font-display text-2xl">Đơn mới</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex justify-between border-b border-line pb-2">
                <span>
                  {o.orderNumber} · {o.syncStatus}
                </span>
                <span>{formatVnd(o.total)}</span>
              </li>
            ))}
            {recentOrders.length === 0 && <li className="text-muted">Chưa có đơn.</li>}
          </ul>
        </section>
        <section className="border border-line bg-white p-5">
          <h2 className="font-display text-2xl">Sync log</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recentLogs.map((log) => (
              <li key={log.id} className="border-b border-line pb-2">
                <p className="font-medium">
                  {log.type} · {log.status}
                </p>
                <p className="text-muted">{log.message}</p>
              </li>
            ))}
            {recentLogs.length === 0 && <li className="text-muted">Chưa có log.</li>}
          </ul>
          <Link href="/admin/settings/sapo" className="mt-4 inline-block text-sm text-accent">
            Cấu hình Sapo →
          </Link>
        </section>
      </div>
    </div>
  );
}
