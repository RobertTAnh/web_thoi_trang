import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

const CART_COOKIE = "lunara_cart";

const cartInclude = {
  items: {
    include: {
      variant: { include: { product: true } },
    },
  },
} as const;

/** Read-only — an toàn gọi từ Server Component (Header, pages). Không set cookie. */
export async function getCart() {
  const session = await auth();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (session?.user?.id) {
    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: cartInclude,
    });
    if (cart) return cart;
  }

  if (sessionId) {
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: cartInclude,
    });
    if (cart) return cart;
  }

  return {
    id: "",
    userId: null,
    sessionId: sessionId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  };
}

/** Tạo / gắn cart — chỉ gọi từ Server Action hoặc Route Handler (được phép set cookie). */
export async function getOrCreateCart() {
  const session = await auth();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (session?.user?.id) {
    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: cartInclude,
    });

    if (!cart && sessionId) {
      const guest = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });
      if (guest) {
        cart = await prisma.cart.update({
          where: { id: guest.id },
          data: { userId: session.user.id, sessionId: null },
          include: cartInclude,
        });
      }
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: cartInclude,
      });
    }

    return cart;
  }

  if (!sessionId) {
    sessionId = nanoid();
    try {
      cookieStore.set(CART_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === "production",
      });
    } catch {
      // Fallback nếu vẫn bị gọi ngoài action — cart tạm theo sessionId chưa persist cookie
    }
  }

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: cartInclude,
    });
  }

  return cart;
}

export function cartTotals(
  items: { quantity: number; variant: { price: number } }[],
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0,
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, count };
}
