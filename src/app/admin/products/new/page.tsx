import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, media] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200, select: { id: true, filename: true } }),
  ]);
  return (
    <div>
      <h1 className="font-display text-4xl">Thêm sản phẩm</h1>
      <div className="mt-6 max-w-6xl">
        <ProductForm categories={categories} media={media} />
      </div>
    </div>
  );
}
