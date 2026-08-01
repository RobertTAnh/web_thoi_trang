import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { Countdown } from "@/components/store/Countdown";
import { formatVnd } from "@/lib/utils";

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "LUNARA";

export default async function HomePage() {
  const [banners, categories, coupons, flashSale, products, lookbooks, reviews, posts] =
    await Promise.all([
      prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" }, take: 6 }),
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
        take: 3,
      }),
    ]);

  const hero = banners[0];

  return (
    <div>
      {/* Hero — full bleed */}
      <section className="relative min-h-[88vh] w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 md:px-6 md:pb-24">
          <p className="animate-fade-up font-display text-5xl tracking-[0.22em] text-white md:text-7xl">
            {brand}
          </p>
          <h1 className="animate-fade-up-delay mt-4 max-w-xl font-display text-3xl text-white md:text-5xl">
            {hero?.title || "Bộ sưu tập xuân hè"}
          </h1>
          <p className="animate-fade-up-delay mt-3 max-w-md text-sm text-white/85 md:text-base">
            Form dáng tinh tế, chất liệu chọn lọc — dành cho ngày thường và sự kiện.
          </p>
          <div className="animate-fade-up-delay mt-8 flex gap-3">
            <Link
              href="/collections"
              className="bg-white px-6 py-3 text-sm tracking-wide text-ink uppercase"
            >
              Mua ngay
            </Link>
            <Link
              href="/#flash-sale"
              className="border border-white px-6 py-3 text-sm tracking-wide text-white uppercase"
            >
              Flash sale
            </Link>
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-4 md:px-6">
        {[
          ["Miễn phí vận chuyển", "Nhận hàng trong vòng 3 ngày"],
          ["Quà tặng hấp dẫn", "Nhiều ưu đãi khuyến mãi hot"],
          ["Bảo đảm chất lượng", "Sản phẩm đã được kiểm định"],
          [`Hotline: ${process.env.NEXT_PUBLIC_HOTLINE || "19006750"}`, "Hỗ trợ 24/7"],
        ].map(([title, desc]) => (
          <div key={title} className="border-t border-line pt-4">
            <h3 className="font-display text-xl">{title}</h3>
            <p className="mt-1 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <h2 className="font-display text-4xl">Thời trang {brand}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/collections/${cat.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-line/30">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="200px"
                  />
                )}
              </div>
              <p className="mt-2 text-sm">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Coupons */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {coupons.map((c) => (
            <div key={c.id} className="border border-dashed border-accent/40 bg-accent-soft/30 p-5">
              <p className="text-xs tracking-[0.18em] text-accent uppercase">Nhập mã</p>
              <p className="mt-1 font-display text-3xl">{c.code}</p>
              <p className="mt-2 text-sm text-muted">{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flash sale */}
      <section id="flash-sale" className="bg-ink py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-4xl md:text-5xl">
                {flashSale?.title || "GIẢM SỐC 50%"}
              </h2>
              {flashSale && (
                <div className="mt-4">
                  <Countdown endsAt={flashSale.endsAt} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-white/70">
              {(flashSale?.tabLabels || ["Hàng hiệu -50%"]).map((tab) => (
                <span key={tab} className="border border-white/20 px-3 py-1">
                  {tab}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => (
              <div key={p.id} className="bg-white p-2 text-ink">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/collections"
              className="inline-block border border-white px-6 py-2 text-sm tracking-wide uppercase"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="font-display text-4xl">Set đồ cho bạn</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {lookbooks.map((item) => (
            <Link key={item.id} href={item.href || "/collections"} className="group relative block aspect-[4/5] overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute right-4 bottom-4 left-4">
                <h3 className="font-display text-2xl text-white">{item.title}</h3>
                <span className="mt-2 inline-block text-xs tracking-wide text-white/80 uppercase">
                  Xem chi tiết
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="border-y border-line bg-surface/60 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-4xl">Khách hàng đã nói gì</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <blockquote key={r.id} className="border-t border-line pt-4">
                <p className="text-sm leading-relaxed text-muted">&ldquo;{r.content}&rdquo;</p>
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
                  <cite className="not-italic text-sm font-medium">{r.name}</cite>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-4xl">Tin tức</h2>
          <Link href="/tin-tuc" className="text-sm text-accent">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/tin-tuc/${post.slug}`} className="group">
              <div className="relative aspect-[16/10] overflow-hidden bg-line/30">
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="33vw"
                  />
                )}
              </div>
              <h3 className="mt-3 font-display text-2xl group-hover:text-accent">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 text-center md:px-6">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">@ Follow Instagram</p>
        <p className="mt-2 font-display text-3xl">{brand}</p>
        <p className="mt-2 text-sm text-muted">
          Giá từ {products[0] ? formatVnd(products[0].variants[0]?.price || 0) : "—"}
        </p>
      </section>
    </div>
  );
}
