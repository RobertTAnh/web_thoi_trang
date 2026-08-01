import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

const CART_COOKIE = "lunara_cart";

export async function getOrCreateCart() {
  const session = await auth();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (session?.user?.id) {
    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
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
          include: {
            items: {
              include: {
                variant: { include: { product: true } },
              },
            },
          },
        });
      }
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
      });
    }

    return cart;
  }

  if (!sessionId) {
    sessionId = nanoid();
    cookieStore.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
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
