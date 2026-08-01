import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiOrAdmin } from "@/lib/api-auth";
import { createOrderFromCheckout } from "@/lib/orders";

export async function GET(req: NextRequest) {
  const authz = await requireApiOrAdmin(req);
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
  const status = searchParams.get("status") || undefined;

  const where = status ? { status: status as never } : {};

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

const createSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(8),
  customerName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().optional(),
  note: z.string().optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
  couponCode: z.string().optional(),
  userId: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const authz = await requireApiOrAdmin(req);
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const order = await createOrderFromCheckout(body);
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
