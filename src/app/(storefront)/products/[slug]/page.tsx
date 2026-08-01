import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import { ProductCard } from "@/components/store/ProductCard";

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

  const [flashSale, related] = await Promise.all([
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
  ]);

  return (
    <div className="container-ega py-6 md:py-10">
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
        flashEndsAt={flashSale?.endsAt ?? null}
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
