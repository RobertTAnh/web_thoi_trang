import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { pushOrderToSapo } from "@/lib/sapo/sync";
import type { PaymentMethod } from "@prisma/client";

export type CheckoutInput = {
  email: string;
  phone: string;
  customerName: string;
  address: string;
  city?: string;
  note?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  userId?: string;
  items: { variantId: string; quantity: number }[];
};

export async function createOrderFromCheckout(input: CheckoutInput) {
  if (!input.items.length) throw new Error("Giỏ hàng trống");

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: input.items.map((i) => i.variantId) } },
    include: { product: true },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));
  let subtotal = 0;
  const lineData = input.items.map((item) => {
    const variant = variantMap.get(item.variantId);
    if (!variant) throw new Error("Sản phẩm không tồn tại");
    if (variant.stock < item.quantity) {
      throw new Error(`Không đủ tồn kho: ${variant.product.name}`);
    }
    subtotal += variant.price * item.quantity;
    return {
      variantId: variant.id,
      name: variant.product.name,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      price: variant.price,
      quantity: item.quantity,
      image: variant.image || variant.product.images[0] || null,
    };
  });

  let discount = 0;
  let shippingFee = subtotal >= 300000 ? 0 : 25000;
  let couponId: string | undefined;

  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode.toUpperCase() },
    });
    if (!coupon || !coupon.active) throw new Error("Mã giảm giá không hợp lệ");
    if (subtotal < coupon.minOrder) {
      throw new Error(`Đơn tối thiểu ${coupon.minOrder.toLocaleString("vi-VN")}₫`);
    }
    if (coupon.freeShip) shippingFee = 0;
    if (coupon.percentOff) {
      discount = Math.round((subtotal * coupon.percentOff) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.amountOff) {
      discount = coupon.amountOff;
    }
    couponId = coupon.id;
  }

  const total = Math.max(0, subtotal + shippingFee - discount);

  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error("Tồn kho vừa thay đổi, vui lòng thử lại");
      }
    }

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: input.userId,
        email: input.email,
        phone: input.phone,
        customerName: input.customerName,
        address: input.address,
        city: input.city,
        note: input.note,
        paymentMethod: input.paymentMethod,
        paymentStatus: "UNPAID",
        status: "PENDING",
        subtotal,
        shippingFee,
        discount,
        total,
        couponId,
        syncStatus: "PENDING_SYNC",
        items: { create: lineData },
      },
      include: { items: true },
    });
  });

  // Push to Sapo asynchronously-ish (await but don't fail checkout)
  try {
    await pushOrderToSapo(order.id);
  } catch {
    // Order remains SYNC_FAILED for admin retry
  }

  return prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { items: true },
  });
}
