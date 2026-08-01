import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";
import { pushOrderAction, updateOrderStatusAction } from "@/app/admin/actions";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Đơn hàng</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-muted">
                  {order.customerName} · {order.phone} · {order.email}
                </p>
                <p className="mt-1 text-sm">{order.address}</p>
                <p className="mt-2 text-sm">
                  {formatVnd(order.total)} · {order.paymentMethod} · {order.paymentStatus}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Sapo: {order.syncStatus}
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
                    {["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ),
                    )}
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
                  {item.name} × {item.quantity} — {formatVnd(item.price * item.quantity)}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted">Chưa có đơn hàng.</p>}
      </div>
    </div>
  );
}
