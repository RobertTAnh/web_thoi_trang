import { prisma } from "@/lib/db";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true, children: true } } },
  });

  return (
    <CategoryManager
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        productCount: category._count.products,
        childCount: category._count.children,
      }))}
    />
  );
}
