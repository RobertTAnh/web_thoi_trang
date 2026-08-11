import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";

type CustomerAgg = {
  key: string;
  phone: string;
  email: string;
  customerName: string;
  address: string;
  city: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date;
  lastOrderNumber: string;
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const orders = await prisma.order.findMany({
    where: query
      ? {
          OR: [
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { customerName: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      phone: true,
      email: true,
      customerName: true,
      address: true,
      city: true,
      total: true,
      createdAt: true,
      status: true,
    },
  });

  const map = new Map<string, CustomerAgg>();
  for (const o of orders) {
    const key = (o.phone || o.email || o.customerName).trim().toLowerCase();
    if (!key) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        phone: o.phone,
        email: o.email,
        customerName: o.customerName,
        address: o.address,
        city: o.city,
        orderCount: 1,
        totalSpent: o.status === "CANCELLED" ? 0 : o.total,
        lastOrderAt: o.createdAt,
        lastOrderNumber: o.orderNumber,
      });
    } else {
      existing.orderCount += 1;
      if (o.status !== "CANCELLED") existing.totalSpent += o.total;
      if (o.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = o.createdAt;
        existing.lastOrderNumber = o.orderNumber;
        existing.customerName = o.customerName;
        existing.address = o.address;
        existing.city = o.city;
        existing.email = o.email;
        existing.phone = o.phone;
      }
    }
  }

  const customers = [...map.values()].sort(
    (a, b) => b.lastOrderAt.getTime() - a.lastOrderAt.getTime(),
  );

  return (
    <div>
      <h1 className="font-display text-4xl">Khách hàng</h1>
      <p className="mt-2 text-sm text-muted">
        Tổng hợp từ đơn đặt trên web (theo SĐT).
      </p>

      <form className="mt-4 flex gap-2" method="get">
        <input
          name="q"
          defaultValue={query}
          placeholder="Tìm tên / SĐT / email"
          className="border border-line px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-ink px-4 py-2 text-sm text-white">
          Tìm
        </button>
      </form>

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-[#faf7f5]">
            <tr>
              <th className="px-4 py-3">Khách</th>
              <th className="px-4 py-3">Liên hệ</th>
              <th className="px-4 py-3">Địa chỉ</th>
              <th className="px-4 py-3">Số đơn</th>
              <th className="px-4 py-3">Tổng chi</th>
              <th className="px-4 py-3">Đơn gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.key} className="border-b border-line">
                <td className="px-4 py-3 font-medium">{c.customerName}</td>
                <td className="px-4 py-3">
                  <div>{c.phone}</div>
                  <div className="text-xs text-muted">{c.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{c.address}</div>
                  {c.city && <div className="text-xs text-muted">{c.city}</div>}
                </td>
                <td className="px-4 py-3">{c.orderCount}</td>
                <td className="px-4 py-3">{formatVnd(c.totalSpent)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders?q=${encodeURIComponent(c.phone || c.email)}`}
                    className="text-accent"
                  >
                    {c.lastOrderNumber}
                  </Link>
                  <div className="text-xs text-muted">
                    {c.lastOrderAt.toLocaleDateString("vi-VN")}
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-muted">
                  Chưa có khách hàng từ đơn web.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
