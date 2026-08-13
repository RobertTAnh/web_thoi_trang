import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="font-display text-4xl">Thêm sản phẩm</h1>
      <div className="mt-6 max-w-6xl">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
