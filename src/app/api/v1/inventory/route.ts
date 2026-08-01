import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiOrAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authz = await requireApiOrAdmin(req);
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lowStock = req.nextUrl.searchParams.get("lowStock") === "1";
  const threshold = Number(req.nextUrl.searchParams.get("threshold") || 5);

  const variants = await prisma.productVariant.findMany({
    where: lowStock ? { stock: { lte: threshold } } : undefined,
    include: {
      product: { select: { id: true, name: true, slug: true, sapoProductId: true } },
    },
    orderBy: { stock: "asc" },
    take: 200,
  });

  return NextResponse.json({ data: variants });
}
