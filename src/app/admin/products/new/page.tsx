import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="font-display text-4xl">Thêm sản phẩm</h1>
      <div className="mt-6 max-w-3xl border border-line bg-white p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
