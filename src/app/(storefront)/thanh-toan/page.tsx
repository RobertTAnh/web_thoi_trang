import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart, cartTotals } from "@/lib/cart";
import { formatVnd } from "@/lib/utils";
import { checkoutAction } from "@/app/actions/checkout";
import { CouponCodeInput } from "@/components/store/CouponCodeInput";

export const metadata = { title: "Thanh toán" };

export default async function CheckoutPage() {
  const cart = await getCart();
  if (!cart.items.length) redirect("/gio-hang");

  const session = await auth();
  const { subtotal } = cartTotals(cart.items);
  const shipping = subtotal >= 300000 ? 0 : 25000;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-5xl">Thanh toán</h1>
      <form action={checkoutAction} className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Thông tin giao hàng</h2>
          <input
            name="customerName"
            required
            placeholder="Họ và tên"
            defaultValue={session?.user?.name || ""}
            className="w-full border border-line bg-surface px-3 py-3 text-sm outline-none focus:border-ink"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              defaultValue={session?.user?.email || ""}
              className="w-full border border-line bg-surface px-3 py-3 text-sm outline-none focus:border-ink"
            />
            <input
              name="phone"
              required
              placeholder="Số điện thoại"
              className="w-full border border-line bg-surface px-3 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <input
            name="address"
            required
            placeholder="Địa chỉ"
            className="w-full border border-line bg-surface px-3 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            name="city"
            placeholder="Tỉnh / Thành phố"
            className="w-full border border-line bg-surface px-3 py-3 text-sm outline-none focus:border-ink"
          />
          <textarea
            name="note"
            placeholder="Ghi chú đơn hàng"
            rows={3}
            className="w-full border border-line bg-surface px-3 py-3 text-sm outline-none focus:border-ink"
          />
          <CouponCodeInput />

          <fieldset className="space-y-3 pt-4">
            <legend className="font-display text-2xl">Phương thức thanh toán</legend>
            <label className="flex items-center gap-3 border border-line p-3 text-sm">
              <input type="radio" name="paymentMethod" value="COD" defaultChecked />
              Thanh toán khi nhận hàng (COD)
            </label>
            <label className="flex items-center gap-3 border border-line p-3 text-sm">
              <input type="radio" name="paymentMethod" value="BANK_TRANSFER" />
              Chuyển khoản ngân hàng
            </label>
          </fieldset>
        </div>

        <aside className="h-fit border border-line bg-surface p-6">
          <h2 className="font-display text-2xl">Đơn hàng</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.variant.product.name} × {item.quantity}
                </span>
                <span>{formatVnd(item.variant.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{formatVnd(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ship</span>
              <span>{shipping === 0 ? "Miễn phí" : formatVnd(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-medium">
              <span>Tổng</span>
              <span>{formatVnd(subtotal + shipping)}</span>
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 w-full bg-accent py-3 text-sm tracking-wide text-white uppercase"
          >
            Đặt hàng
          </button>
        </aside>
      </form>
    </div>
  );
}
