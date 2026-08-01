import Image from "next/image";
import Link from "next/link";
import { getCart, cartTotals } from "@/lib/cart";
import { formatVnd } from "@/lib/utils";
import { CartControls } from "@/components/store/CartControls";

export const metadata = { title: "Giỏ hàng" };

export default async function CartPage() {
  const cart = await getCart();
  const { subtotal, count } = cartTotals(cart.items);
  const shipping = subtotal >= 300000 || subtotal === 0 ? 0 : 25000;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-5xl">Giỏ hàng</h1>
      <p className="mt-2 text-muted">Bạn có {count} sản phẩm</p>

      {cart.items.length === 0 ? (
        <div className="mt-10">
          <p className="text-muted">Giỏ hàng trống.</p>
          <Link href="/collections" className="mt-4 inline-block text-accent underline">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-line pb-6">
                <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-line/30">
                  <Image
                    src={
                      item.variant.image ||
                      item.variant.product.images[0] ||
                      "/placeholder-product.svg"
                    }
                    alt={item.variant.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.variant.product.slug}`}
                    className="font-medium hover:text-accent"
                  >
                    {item.variant.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {[item.variant.color, item.variant.size].filter(Boolean).join(" / ")}
                  </p>
                  <p className="mt-2 text-sm">{formatVnd(item.variant.price)}</p>
                  <CartControls itemId={item.id} quantity={item.quantity} />
                </div>
                <p className="text-sm font-medium">
                  {formatVnd(item.variant.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <aside className="h-fit border border-line bg-surface p-6">
            <h2 className="font-display text-2xl">Tóm tắt</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatVnd(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí ship</span>
                <span>{shipping === 0 ? "Miễn phí" : formatVnd(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                <span>Tổng</span>
                <span>{formatVnd(subtotal + shipping)}</span>
              </div>
            </div>
            <Link
              href="/thanh-toan"
              className="mt-6 block bg-accent py-3 text-center text-sm tracking-wide text-white uppercase"
            >
              Thanh toán
            </Link>
            <Link
              href="/collections"
              className="mt-3 block text-center text-sm text-muted"
            >
              Tiếp tục mua hàng
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
