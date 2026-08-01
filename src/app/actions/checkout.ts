"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { createOrderFromCheckout } from "@/lib/orders";
import { clearCart } from "@/app/actions/cart";
import type { PaymentMethod } from "@prisma/client";

export async function checkoutAction(formData: FormData) {
  const session = await auth();
  const cart = await getOrCreateCart();
  if (!cart.items.length) {
    throw new Error("Giỏ hàng trống");
  }

  const paymentMethod = (formData.get("paymentMethod") as PaymentMethod) || "COD";

  const order = await createOrderFromCheckout({
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    customerName: String(formData.get("customerName") || ""),
    address: String(formData.get("address") || ""),
    city: String(formData.get("city") || "") || undefined,
    note: String(formData.get("note") || "") || undefined,
    paymentMethod,
    couponCode: String(formData.get("couponCode") || "") || undefined,
    userId: session?.user?.id,
    items: cart.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  });

  await clearCart();
  redirect(`/dat-hang-thanh-cong?order=${order.orderNumber}`);
}
