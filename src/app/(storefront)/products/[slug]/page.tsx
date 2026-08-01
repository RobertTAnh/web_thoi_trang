import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <p className="mb-6 text-sm text-muted">
        {product.category?.name || "Sản phẩm"} / {product.name}
      </p>
      <ProductDetailClient product={product} />
    </div>
  );
}
