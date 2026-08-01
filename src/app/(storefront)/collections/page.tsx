import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

export const metadata = { title: "Sản phẩm" };

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="container-ega py-10">
      <h1 className="section-title">Sản phẩm</h1>
      <p className="mt-2 text-center text-[13px] text-muted">
        Khám phá các bộ sưu tập của Tisora
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/collections/${cat.slug}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
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
            <p className="mt-3 text-center text-[15px] font-semibold">{cat.name}</p>
            <p className="text-center text-[12px] text-muted">
              {cat._count.products} sản phẩm
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/collections/all"
          className="text-[13px] font-semibold text-accent underline"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>
    </div>
  );
}
