import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { Countdown } from "@/components/store/Countdown";
import { HomeHeroBanner, type HeroSlide } from "@/components/store/HomeHeroBanner";
import { SectionBar } from "@/components/store/SectionBar";
import { CopyCouponButton } from "@/components/store/CopyCouponButton";
import { HomeCategoryTabs } from "@/components/store/HomeCategoryTabs";
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
    categoryProducts,
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
    }),
    prisma.product.findMany({
      where: { published: true },
      include: { variants: true },
      take: 40,
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.productVariant.aggregate({
      where: { price: { gte: 100_000 }, product: { published: true } },
      _min: { price: true },
    }),
  ]);

  const fromPrice = minPriceAgg._min.price ?? 249_000;
  const fromTag = priceTag(fromPrice);
  const hot = hotProducts.length ? hotProducts : newProducts;

  const slides: HeroSlide[] = [
    {
      src: "/banners/banner-dam-3600x1200.png",
      alt: `${brand} — Đầm hiệu giá tốt, chỉ từ 199K`,
      href: "/collections/dam",
      bakedInText: true,
    },
  ];

  return (
    <div className="bg-white">
      <HomeHeroBanner slides={slides} />

      {/* Voucher — giữ section cũ */}
      {coupons.length > 0 && (
        <section className="border-b border-line bg-[#fff8f3] py-6 md:py-8">
          <div className="container-ega">
            <SectionBar title="Mã giảm giá" href="/collections" moreLabel="Mua sắm" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="flex items-stretch overflow-hidden rounded-lg border border-dashed border-[#e31c23] bg-white"
                >
                  <div className="flex w-[88px] shrink-0 flex-col items-center justify-center bg-[#e31c23] px-2 text-center text-white">
                    <span className="text-[10px] uppercase opacity-90">Mã</span>
                    <span className="text-[13px] leading-tight font-black break-all">
                      {c.code}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-3">
                    <p className="text-[13px] text-ink">{c.description}</p>
                    <CopyCouponButton code={c.code} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sản phẩm hot */}
      <section className="container-ega py-8 md:py-10">
        <SectionBar title="Sản phẩm hot" href="/collections/all" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-5">
          {hot.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sản phẩm mới */}
      <section className="bg-[#faf7f2] py-8 md:py-10">
        <div className="container-ega">
          <SectionBar title="Sản phẩm mới" href="/collections/all" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-5">
            {newProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Flash sale */}
      <section id="flash-sale" className="container-ega py-8 md:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="rounded-full bg-[#e31c23] px-5 py-2 text-[13px] font-bold tracking-wide text-white uppercase md:text-[14px]">
              Flash sale
            </h2>
            {flashSale && <Countdown endsAt={flashSale.endsAt} />}
          </div>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 rounded-full border border-[#e31c23] bg-white px-4 py-1.5 text-[12px] font-bold text-[#e31c23] uppercase"
          >
            Xem thêm ›
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-5">
          {hot.slice(0, 10).map((p) => (
            <ProductCard key={`fs-${p.id}`} product={p} />
          ))}
        </div>
      </section>

      {/* Thời trang theo danh mục — tabs kiểu Bemine */}
      <section className="bg-[#fff8f3] py-8 md:py-10">
        <div className="container-ega">
          <SectionBar title="Thời trang" href="/collections" />
          <HomeCategoryTabs
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              image: c.image,
            }))}
            products={categoryProducts.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              brand: p.brand,
              images: p.images,
              categoryId: p.categoryId,
              variants: p.variants,
            }))}
          />
        </div>
      </section>

      {/* Tin tức */}
      {posts.length > 0 && (
        <section className="container-ega py-8 md:py-10">
          <SectionBar title="Tin tức mỗi ngày" href="/tin-tuc" />
          <p className="mb-5 -mt-2 text-[13px] text-muted">
            Chìm sâu vào thế giới thời trang và thể hiện phong cách mỗi ngày
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {posts.map((post) => (
              <Link key={post.id} href={`/tin-tuc/${post.slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f3eee6]">
                  {post.coverImage && (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="20vw"
                    />
                  )}
                </div>
                <h3 className="mt-2 line-clamp-2 text-[13px] font-semibold group-hover:text-[#e31c23]">
                  {post.title}
                </h3>
                <p className="mt-1 text-[11px] text-muted">
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust 4 cột kiểu Bemine */}
      <section className="border-t border-line bg-[#faf7f2] py-10">
        <div className="container-ega grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["/trust/thiet-ke.jpg", "Thiết kế riêng", "Sản phẩm thật — không ảnh mạng"],
            ["/trust/giao-hang.jpg", "Giao hàng toàn quốc", "Được kiểm tra trước khi nhận"],
            ["/trust/thanh-toan.jpg", "Thanh toán khi nhận", "Giao nhanh — uy tín — an toàn"],
            ["/trust/doi-tra.jpg", "Hỗ trợ đổi hàng", "Đổi trả trong vòng 15 ngày"],
          ].map(([img, title, desc]) => (
            <div key={title} className="text-center">
              <div className="relative mx-auto mb-3 aspect-square w-[120px] overflow-hidden rounded-full border-2 border-[#f07a2a]/40 bg-[#f3eee6] md:w-[140px]">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              <h3 className="text-[14px] font-bold uppercase">{title}</h3>
              <p className="mt-1 text-[13px] text-muted">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[13px] text-muted">
          Hotline{" "}
          <a href={`tel:${hotline}`} className="font-bold text-[#e31c23]">
            {hotline}
          </a>
          {" · "}
          Chỉ từ <span className="font-bold text-ink">{formatVnd(fromPrice)}</span>
        </p>
      </section>
    </div>
  );
}
