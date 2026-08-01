import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { deleteProductAction } from "@/app/admin/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  const variant = product.variants[0];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Sửa sản phẩm</h1>
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <button type="submit" className="text-sm text-sale">
            Xóa
          </button>
        </form>
      </div>
      <div className="mt-6 max-w-2xl border border-line bg-white p-6">
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            name: product.name,
            brand: product.brand,
            description: product.description,
            categoryId: product.categoryId,
            image: product.images[0] || "",
            published: product.published,
            featured: product.featured,
            price: variant?.price || 0,
            compareAt: variant?.compareAt || 0,
            stock: variant?.stock || 0,
            color: variant?.color || "",
            size: variant?.size || "",
            sapoProductId: product.sapoProductId,
          }}
        />
      </div>
    </div>
  );
}
