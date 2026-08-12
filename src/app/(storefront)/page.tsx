import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { Countdown } from "@/components/store/Countdown";
import { HomeHeroBanner, type HeroSlide } from "@/components/store/HomeHeroBanner";
import { SectionBar } from "@/components/store/SectionBar";
import { CopyCouponButton } from "@/components/store/CopyCouponButton";
import { formatVnd } from "@/lib/utils";

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Tisora";
const hotline = process.env.NEXT_PUBLIC_HOTLINE || "19006750";

function priceTag(amount: number) {
  if (amount >= 1_000_000) return `${Math.round(amount / 100_000) / 10}TR`;
  return `${Math.round(amount / 1000)}K`;
}

export default async function HomePage() {
  const [
    coupons,
    flashSale,
    hotProducts,
    newProducts,
    categories,
    reviews,
    posts,
    minPriceAgg,
  ] = await Promise.all([
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
    prisma.product.findMany({
      where: { published: true },
      include: { variants: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      take: 8,
      include: { _count: { select: { products: true } } },
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
    prisma.productVariant.aggregate({
      where: { price: { gte: 100_000 }, product: { published: true } },
      _min: { price: true },
    }),
  ]);

  const fromPrice = minPriceAgg._min.price ?? 249_000;
  const fromTag = priceTag(fromPrice);

  const slides: HeroSlide[] = [
    {
      src: "/banners/hero-dam-gia-tot.jpg",
      alt: `${brand} — Đầm hiệu giá tốt`,
      href: "/collections/dam",
    },
    {
      src: "/banners/hero-du-tiec.jpg",
      alt: `${brand} — Đầm dự tiệc sang chảnh`,
      href: "/collections/dam",
      overlay: {
        eyebrow: "Bộ sưu tập mới",
        title: "Dự tiệc sang chảnh",
        subtitle: "Đầm thiết kế Tisora — tôn dáng, nổi bật mọi ánh nhìn",
        priceLabel: fromTag,
        cta: "Mua ngay",
      },
    },
  ];

  const flashProducts = hotProducts.length ? hotProducts : newProducts;

  return (
    <div>
      <HomeHeroBanner slides={slides} />

      {/* Coupons — giữ section voucher web cũ */}
      {coupons.length > 0 && (
        <section className="bg-[#fff8f5] py-8 md:py-10">
          <div className="container-ega">
            <SectionBar title="Mã giảm giá" href="/collections" moreLabel="Mua sắm" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="relative overflow-hidden border border-dashed border-accent bg-white p-4 shadow-sm"
                >
                  <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-accent/10" />
                  <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">
                    Nhập mã
                  </p>
                  <p className="mt-1 text-xl font-bold text-accent">{c.code}</p>
                  <p className="mt-2 text-[13px] text-muted">{c.description}</p>
                  <CopyCouponButton code={c.code} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sản phẩm hot */}
      <section className="container-ega py-10">
        <SectionBar title="Sản phẩm hot" href="/collections/all" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {(hotProducts.length ? hotProducts : newProducts).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sản phẩm mới */}
      <section className="bg-[#fafafa] py-10">
        <div className="container-ega">
          <SectionBar title="Sản phẩm mới" href="/collections/all" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Flash sale */}
      <section id="flash-sale" className="container-ega py-10">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="rounded-full bg-[#ee495a] px-5 py-2 text-[14px] font-bold tracking-wide text-white uppercase md:text-[15px]">
              {flashSale?.title || "Flash sale"}
            </h2>
            {flashSale && <Countdown endsAt={flashSale.endsAt} />}
          </div>
          <Link
            href="/collections/all"
            className="text-[13px] font-semibold text-[#ee495a] uppercase"
          >
            Xem thêm →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {flashProducts.map((p) => (
            <ProductCard key={`flash-${p.id}`} product={p} />
          ))}
        </div>
      </section>

      {/* Danh mục — kiểu Bemine chips/grid */}
      <section className="bg-[#fff8f5] py-10">
        <div className="container-ega">
          <SectionBar title="Thời trang" href="/collections" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f0ebe3]"
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="25vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute right-3 bottom-3 left-3 text-white">
                  <p className="text-[15px] font-bold">{cat.name}</p>
                  <p className="text-[12px] text-white/85">
                    {cat._count.products} sản phẩm
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust — giống Bemine */}
      <section className="border-y border-line py-10">
        <div className="container-ega grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Thiết kế riêng", "Sản phẩm thật — không ảnh mạng"],
            ["Giao hàng toàn quốc", "Được kiểm tra trước khi nhận"],
            ["Thanh toán khi nhận", "Giao nhanh — uy tín — an toàn"],
            ["Hỗ trợ đổi hàng", "Đổi trả trong vòng 15 ngày"],
          ].map(([title, desc]) => (
            <div key={title} className="text-center">
              <h3 className="text-[15px] font-bold uppercase">{title}</h3>
              <p className="mt-1 text-[13px] text-muted">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[12px] text-muted">
          Hotline{" "}
          <a href={`tel:${hotline}`} className="font-semibold text-accent">
            {hotline}
          </a>{" "}
          · Chỉ từ{" "}
          <span className="font-semibold text-ink">{formatVnd(fromPrice)}</span>
        </p>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="container-ega py-10">
          <SectionBar title="Khách hàng nói gì" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <blockquote key={r.id} className="rounded-xl border border-line bg-white p-4">
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
      )}

      {/* Blog */}
      {posts.length > 0 && (
        <section className="bg-[#fafafa] py-10">
          <div className="container-ega">
            <SectionBar title="Tin tức mỗi ngày" href="/tin-tuc" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/tin-tuc/${post.slug}`} className="group">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#f0ebe3]">
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
          </div>
        </section>
      )}
    </div>
  );
}
