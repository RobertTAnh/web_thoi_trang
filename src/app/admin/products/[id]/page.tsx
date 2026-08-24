import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { deleteProductAction } from "@/app/admin/actions";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [product, categories, media] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200, select: { id: true, filename: true } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      {saved === "1" && (
        <p className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Đã cập nhật sản phẩm.
        </p>
      )}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Sửa sản phẩm</h1>
        <div className="flex items-center gap-4">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
          >
            Xem trang
          </Link>
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <button type="submit" className="text-sm text-sale">
              Xóa
            </button>
          </form>
        </div>
      </div>
      <div className="mt-6 max-w-6xl">
        <ProductForm
          categories={categories}
          media={media}
          product={{
            id: product.id,
            name: product.name,
            brand: product.brand,
            description: product.description,
            categoryId: product.categoryId,
            images: product.images,
            published: product.published,
            featured: product.featured,
            sapoProductId: product.sapoProductId,
            variants: product.variants.map((v) => ({
              id: v.id,
              sku: v.sku || "",
              color: v.color || "",
              size: v.size || "",
              price: v.price,
              compareAt: v.compareAt,
              costPrice: v.costPrice,
              wholesalePrice: v.wholesalePrice,
              stock: v.stock,
              image: v.image,
            })),
          }}
        />
      </div>
    </div>
  );
}
