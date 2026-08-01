import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

export const metadata = { title: "Bộ sưu tập" };

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-5xl">Sản phẩm</h1>
      <p className="mt-2 text-muted">Khám phá các bộ sưu tập của LUNARA</p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/collections/${cat.slug}`} className="group">
            <div className="relative aspect-[4/5] overflow-hidden bg-line/30">
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="33vw"
                />
              )}
            </div>
            <p className="mt-3 text-lg">{cat.name}</p>
            <p className="text-sm text-muted">{cat._count.products} sản phẩm</p>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/collections/all" className="text-sm text-accent underline">
          Xem tất cả sản phẩm
        </Link>
      </div>
    </div>
  );
}
