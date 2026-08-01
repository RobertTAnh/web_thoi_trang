import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { Countdown } from "@/components/store/Countdown";

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Tisora";
const hotline = process.env.NEXT_PUBLIC_HOTLINE || "19006750";

export default async function HomePage() {
  const [banners, categories, coupons, flashSale, products, lookbooks, reviews, posts] =
    await Promise.all([
      prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        take: 6,
        include: { _count: { select: { products: true } } },
      }),
      prisma.coupon.findMany({ where: { active: true }, take: 4 }),
      prisma.flashSale.findFirst({
        where: { active: true, endsAt: { gt: new Date() } },
        orderBy: { endsAt: "asc" },
      }),
      prisma.product.findMany({
        where: { published: true, featured: true },
        include: { variants: true },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.lookbook.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        take: 3,
      }),
      prisma.review.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        take: 4,
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  const hero = banners[0];

  return (
    <div>
      {/* Hero slider full-bleed */}
      <section className="relative min-h-[52vh] w-full overflow-hidden md:min-h-[70vh]">
        {hero && (
          <Image
            src={hero.image}
            alt={hero.title || brand}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative container-ega flex min-h-[52vh] flex-col items-center justify-center text-center text-white md:min-h-[70vh]">
          <p className="text-sm tracking-[0.25em] uppercase">{brand}</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            {hero?.title || "Bộ sưu tập xuân hè"}
          </h1>
          <div className="mt-6 flex gap-3">
            <Link href="/collections" className="btn-primary px-8 py-3 text-[13px]">
              Mua ngay
            </Link>
            <Link
              href="/#flash-sale"
              className="border border-white px-8 py-3 text-[13px] font-semibold uppercase"
            >
              Flash sale
            </Link>
          </div>
        </div>
      </section>

      {/* Policies 4 cột — như EGA */}
      <section className="border-b border-line py-8">
        <div className="container-ega grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Miễn phí vận chuyển", "Nhận hàng trong vòng 3 ngày"],
            ["Quà tặng hấp dẫn", "Nhiều ưu đãi khuyến mãi hot"],
            ["Bảo đảm chất lượng", "Sản phẩm đã được kiểm định"],
            [`Hotline: ${hotline}`, "Dịch vụ hỗ trợ bạn 24/7"],
          ].map(([title, desc]) => (
            <div key={title} className="text-center">
              <h3 className="text-[15px] font-semibold">{title}</h3>
              <p className="mt-1 text-[13px] text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section className="container-ega py-12">
        <h2 className="section-title">Thời trang {brand}</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/collections/${cat.slug}`} className="group text-center">
              <div className="relative aspect-square overflow-hidden rounded-full bg-[#f5f5f5] md:aspect-[3/4] md:rounded-none">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="180px"
                  />
                )}
              </div>
              <p className="mt-2 text-[14px] font-medium">{cat.name}</p>
              <p className="text-[12px] text-muted">{cat._count.products} sản phẩm</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Coupons */}
      <section className="bg-[#f8f9fa] py-10">
        <div className="container-ega grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="border border-dashed border-accent bg-white p-4"
            >
              <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">
                Nhập mã
              </p>
              <p className="mt-1 text-xl font-bold text-accent">{c.code}</p>
              <p className="mt-2 text-[13px] text-muted">{c.description}</p>
              <button
                type="button"
                className="mt-3 text-[12px] font-semibold text-ink underline"
              >
                Sao chép
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Flash sale */}
      <section id="flash-sale" className="py-12">
        <div className="container-ega">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="section-title mb-0">
              {flashSale?.title || "GIẢM SỐC 50%"}
            </h2>
            {flashSale && (
              <div className="mt-2">
                <Countdown endsAt={flashSale.endsAt} />
              </div>
            )}
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-[13px]">
              {(flashSale?.tabLabels || ["Hàng hiệu -50%", "Năng động ngày hè"]).map(
                (tab) => (
                  <span
                    key={tab}
                    className="border border-line px-3 py-1.5 hover:border-accent hover:text-accent"
                  >
                    {tab}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/collections/all"
              className="inline-block border border-ink px-8 py-2.5 text-[13px] font-semibold uppercase hover:bg-ink hover:text-white"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="bg-[#f8f9fa] py-12">
        <div className="container-ega">
          <h2 className="section-title">Set đồ cho bạn</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {lookbooks.map((item) => (
              <Link
                key={item.id}
                href={item.href || "/collections"}
                className="group relative block aspect-[4/5] overflow-hidden"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute right-4 bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span className="mt-2 inline-block text-[12px] uppercase underline">
                    Xem chi tiết
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-ega py-12">
        <h2 className="section-title">Khách hàng đã nói gì</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r) => (
            <blockquote key={r.id} className="border border-line p-4">
              <p className="text-[13px] leading-6 text-muted">&ldquo;{r.content}&rdquo;</p>
              <footer className="mt-4 flex items-center gap-3">
                {r.avatar && (
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <cite className="text-[13px] font-semibold not-italic">{r.name}</cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Instagram strip */}
      <section className="border-y border-line py-10 text-center">
        <p className="text-[12px] tracking-[0.2em] text-muted uppercase">
          @ Follow Instagram
        </p>
        <p className="mt-2 text-2xl font-bold tracking-wide uppercase">{brand}</p>
      </section>

      {/* Blog */}
      <section className="container-ega py-12">
        <div className="flex items-end justify-between">
          <h2 className="section-title mb-0 text-left after:mx-0">Tin tức</h2>
          <Link href="/tin-tuc" className="text-[13px] text-accent">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/tin-tuc/${post.slug}`} className="group">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#f5f5f5]">
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="25vw"
                  />
                )}
              </div>
              <h3 className="mt-3 text-[15px] font-semibold group-hover:text-accent">
                {post.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[13px] text-muted">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
