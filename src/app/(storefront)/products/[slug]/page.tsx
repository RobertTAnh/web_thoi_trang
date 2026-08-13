import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import { ProductCard } from "@/components/store/ProductCard";
import { getCart } from "@/lib/cart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true, category: true },
  });

  if (!product || !product.published) notFound();

  const [flashSale, related, coupons, categories, cart] = await Promise.all([
    prisma.flashSale.findFirst({
      where: { active: true, endsAt: { gt: new Date() } },
      orderBy: { endsAt: "asc" },
    }),
    prisma.product.findMany({
      where: {
        published: true,
        id: { not: product.id },
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
      },
      include: { variants: true },
      take: 4,
    }),
    prisma.coupon.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      take: 12,
    }),
    getCart(),
  ]);

  const likeCategories = categories.slice(0, 10);

  return (
    <div className="container-ega pt-6 pb-28 md:pt-10 md:pb-28 lg:pb-10">
      <nav className="mb-5 text-[13px] text-muted">
        <Link href="/" className="hover:text-accent">
          Trang chủ
        </Link>
        <span className="mx-1.5">/</span>
        {product.category && (
          <>
            <Link
              href={`/collections/${product.category.slug}`}
              className="hover:text-accent"
            >
              {product.category.name}
            </Link>
            <span className="mx-1.5">/</span>
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </nav>

      <ProductDetailClient
        product={product}
        initialCartCount={cart.items.reduce((sum, item) => sum + item.quantity, 0)}
        flashEndsAt={flashSale?.endsAt ?? null}
        coupons={coupons.map((c) => ({
          code: c.code,
          description: c.description,
          percentOff: c.percentOff,
          amountOff: c.amountOff,
          freeShip: c.freeShip,
          minOrder: c.minOrder,
        }))}
        relatedCategories={likeCategories.map((c) => ({
          name: c.name,
          slug: c.slug,
        }))}
      />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title">Sản phẩm cùng loại</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
