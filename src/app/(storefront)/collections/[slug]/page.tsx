import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort = "newest" } = await searchParams;

  const category =
    slug === "all"
      ? null
      : await prisma.category.findUnique({ where: { slug } });

  if (slug !== "all" && !category) notFound();

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(category ? { categoryId: category.id } : {}),
    },
    include: { variants: true },
    orderBy:
      sort === "name_asc"
        ? { name: "asc" }
        : sort === "name_desc"
          ? { name: "desc" }
          : { createdAt: "desc" },
  });

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-5xl">
        {category?.name || "Tất cả sản phẩm"}
      </h1>
      <form className="mt-6 flex items-center gap-3 text-sm">
        <label htmlFor="sort">Sắp xếp</label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort}
          className="border border-line bg-surface px-3 py-2"
        >
          <option value="newest">Hàng mới</option>
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
        <button type="submit" className="bg-ink px-4 py-2 text-white">
          Áp dụng
        </button>
      </form>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {sorted.length === 0 && (
        <p className="mt-10 text-muted">Chưa có sản phẩm trong danh mục này.</p>
      )}
    </div>
  );
}
