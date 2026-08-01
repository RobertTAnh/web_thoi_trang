import Image from "next/image";
import { prisma } from "@/lib/db";
import { saveCategoryAction } from "@/app/admin/actions";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-4xl">Danh mục</h1>
        <div className="mt-6 space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-4 border border-line bg-white p-3">
              <div className="relative h-14 w-12 overflow-hidden bg-line/40">
                {c.image && (
                  <Image src={c.image} alt="" fill className="object-cover" sizes="48px" />
                )}
              </div>
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted">
                  /{c.slug} · {c._count.products} SP
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form action={saveCategoryAction} className="h-fit space-y-3 border border-line bg-white p-5 text-sm">
        <h2 className="font-display text-2xl">Thêm danh mục</h2>
        <input name="name" required placeholder="Tên" className="w-full border border-line px-3 py-2" />
        <input name="slug" placeholder="slug (tùy chọn)" className="w-full border border-line px-3 py-2" />
        <input name="image" placeholder="URL ảnh" className="w-full border border-line px-3 py-2" />
        <button type="submit" className="w-full bg-ink py-2 text-white">
          Lưu
        </button>
      </form>
    </div>
  );
}
