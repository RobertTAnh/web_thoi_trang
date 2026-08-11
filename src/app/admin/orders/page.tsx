import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";
import { pushOrderAction, updateOrderStatusAction } from "@/app/admin/actions";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const query = (q || "").trim();
  const statusFilter =
    status && STATUSES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : undefined;

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        statusFilter ? { status: statusFilter } : {},
        query
          ? {
              OR: [
                { orderNumber: { contains: query, mode: "insensitive" } },
                { phone: { contains: query, mode: "insensitive" } },
                { customerName: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Đơn hàng</h1>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={query}
          placeholder="Mã đơn / SĐT / tên / email"
          className="border border-line px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={statusFilter || ""}
          className="border border-line px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-ink px-4 py-2 text-sm text-white">
          Lọc
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {orders.map((order) => {
          const profit = order.items.reduce((sum, item) => {
            if (item.costPrice == null) return sum;
            return sum + (item.price - item.costPrice) * item.quantity;
          }, 0);
          const hasCost = order.items.some((i) => i.costPrice != null);

          return (
            <div key={order.id} className="border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted">
                    {order.customerName} · {order.phone} · {order.email}
                  </p>
                  <p className="mt-1 text-sm">{order.address}</p>
                  {order.city && <p className="text-xs text-muted">{order.city}</p>}
                  {order.note && (
                    <p className="mt-1 text-xs text-muted">Ghi chú: {order.note}</p>
                  )}
                  <p className="mt-2 text-sm">
                    {formatVnd(order.total)} · {order.paymentMethod} · {order.paymentStatus}
                    {hasCost && (
                      <span className="ml-2 text-accent">
                        · Lãi tạm {formatVnd(profit)}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {order.createdAt.toLocaleString("vi-VN")} · Sapo: {order.syncStatus}
                    {order.sapoOrderId ? ` #${order.sapoOrderId}` : ""}
                    {order.syncError ? ` — ${order.syncError}` : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <form action={updateOrderStatusAction} className="flex gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="border border-line px-2 py-1 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="bg-ink px-3 py-1 text-sm text-white">
                      Cập nhật
                    </button>
                  </form>
                  {(order.syncStatus === "SYNC_FAILED" ||
                    order.syncStatus === "PENDING_SYNC" ||
                    order.syncStatus === "SKIPPED") && (
                    <form action={pushOrderAction}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <button type="submit" className="border border-ink px-3 py-1 text-sm">
                        Push lại Sapo
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm text-muted">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name}
                    {item.sku ? ` (${item.sku})` : ""} × {item.quantity} —{" "}
                    {formatVnd(item.price * item.quantity)}
                    {item.costPrice != null && (
                      <span className="ml-2">
                        · nhập {formatVnd(item.costPrice)} · lãi{" "}
                        {formatVnd((item.price - item.costPrice) * item.quantity)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {orders.length === 0 && <p className="text-muted">Chưa có đơn hàng.</p>}
      </div>
    </div>
  );
}
