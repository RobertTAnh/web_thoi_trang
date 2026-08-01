import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";

export const metadata = { title: "Đặt hàng thành công" };

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
      <p className="text-xs tracking-[0.2em] text-accent uppercase">Cảm ơn bạn</p>
      <h1 className="mt-3 font-display text-5xl">Đặt hàng thành công</h1>
      {order ? (
        <div className="mt-8 border border-line bg-surface p-6 text-left text-sm">
          <p>
            Mã đơn: <strong>{order.orderNumber}</strong>
          </p>
          <p className="mt-2">Tổng thanh toán: {formatVnd(order.total)}</p>
          <p className="mt-2 text-muted">
            Trạng thái đồng bộ Sapo: {order.syncStatus}
            {order.sapoOrderId ? ` (#${order.sapoOrderId})` : ""}
          </p>
          <ul className="mt-4 space-y-2 border-t border-line pt-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatVnd(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 text-muted">Không tìm thấy đơn hàng.</p>
      )}
      <Link
        href="/collections"
        className="mt-8 inline-block bg-ink px-6 py-3 text-sm text-white uppercase"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
