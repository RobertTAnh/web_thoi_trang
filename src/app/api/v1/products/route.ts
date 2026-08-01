import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const sort = searchParams.get("sort") || "newest";

  const where = {
    published: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { brand: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "price_asc"
      ? { variants: { _count: "asc" as const } }
      : sort === "name_asc"
        ? { name: "asc" as const }
        : sort === "name_desc"
          ? { name: "desc" as const }
          : { createdAt: "desc" as const };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: { orderBy: { price: "asc" } },
      },
      orderBy: sort.startsWith("price")
        ? { createdAt: "desc" }
        : orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  let sorted = products;
  if (sort === "price_asc") {
    sorted = [...products].sort(
      (a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0),
    );
  } else if (sort === "price_desc") {
    sorted = [...products].sort(
      (a, b) => (b.variants[0]?.price || 0) - (a.variants[0]?.price || 0),
    );
  }

  return NextResponse.json({
    data: sorted,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
