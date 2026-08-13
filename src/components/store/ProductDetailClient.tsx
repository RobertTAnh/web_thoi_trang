"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatVnd, discountPercent } from "@/lib/utils";
import { looksLikeHtml, sanitizeHtml } from "@/lib/html";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { Countdown } from "@/components/store/Countdown";
import { ProductLightbox } from "@/components/store/ProductLightbox";

type Variant = {
  id: string;
  color: string | null;
  size: string | null;
  price: number;
  compareAt: number | null;
  stock: number;
  image: string | null;
  sku: string | null;
};

type CouponItem = {
  code: string;
  description: string | null;
  percentOff: number | null;
  amountOff: number | null;
  freeShip: boolean;
  minOrder: number;
};

type CategoryLink = { name: string; slug: string };

const COUPON_STORAGE_KEY = "tisora_coupon";

function couponLabel(c: CouponItem) {
  if (c.description) return c.description;
  const parts: string[] = [];
  if (c.percentOff) parts.push(`Giảm ${c.percentOff}%`);
  if (c.amountOff) parts.push(`Giảm ${formatVnd(c.amountOff)}`);
  if (c.freeShip) parts.push("Freeship");
  if (c.minOrder > 0) parts.push(`đơn từ ${formatVnd(c.minOrder)}`);
  return parts.join(" · ") || `Mã ${c.code}`;
}

export function ProductDetailClient({
  product,
  flashEndsAt,
  coupons = [],
  relatedCategories = [],
  initialCartCount = 0,
}: {
  product: {
    name: string;
    brand: string | null;
    description: string | null;
    images: string[];
    variants: Variant[];
  };
  flashEndsAt?: string | Date | null;
  coupons?: CouponItem[];
  relatedCategories?: CategoryLink[];
  initialCartCount?: number;
}) {
  const gallery = product.images.length
    ? product.images
    : ["/placeholder-product.svg"];
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ship" | "return">("desc");
  const [objectPos, setObjectPos] = useState<"top" | "bottom">("bottom");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [applyMsg, setApplyMsg] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cartCount, setCartCount] = useState(initialCartCount);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(COUPON_STORAGE_KEY);
      if (saved) setAppliedCode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const colors = useMemo(
    () => [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[],
    [product.variants],
  );
  const [color, setColor] = useState(colors[0] || null);
  const sizes = useMemo(
    () =>
      [
        ...new Set(
          product.variants
            .filter((v) => !color || v.color === color)
            .map((v) => v.size)
            .filter(Boolean),
        ),
      ] as string[],
    [product.variants, color],
  );
  const [size, setSize] = useState(sizes[0] || null);

  useEffect(() => {
    if (sizes.length && size && !sizes.includes(size)) {
      setSize(sizes[0] || null);
    }
  }, [sizes, size]);

  const variant =
    product.variants.find(
      (v) => (!color || v.color === color) && (!size || v.size === size),
    ) || product.variants[0];

  const pct = discountPercent(variant.price, variant.compareAt);
  const currentSrc = gallery[activeImg] || gallery[0];

  useEffect(() => {
    setObjectPos("bottom");
  }, [activeImg, currentSrc]);

  function applyCoupon(code: string) {
    try {
      sessionStorage.setItem(COUPON_STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
    setAppliedCode(code);
    setApplyMsg(`Đã chọn mã ${code} — dùng khi thanh toán`);
    navigator.clipboard?.writeText(code).catch(() => undefined);
  }

  function onMainImageLoad(img: HTMLImageElement) {
    const ratio = img.naturalWidth / Math.max(img.naturalHeight, 1);
    // Vuông / ngang → dính trên; ảnh dọc → sát đáy khung 3:4 (4:3 dọc)
    setObjectPos(ratio >= 0.92 ? "top" : "bottom");
  }

  return (
    <div>
      <div className="grid items-start gap-8 lg:grid-cols-2">
        {/* Gallery — khung 3:4 y đối thủ */}
        <div className="flex w-full gap-2 self-start md:gap-3">
          <div className="flex w-12 shrink-0 flex-col gap-2 sm:w-14 md:w-16">
            {gallery.slice(0, 8).map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`relative aspect-[3/4] w-full overflow-hidden border ${
                  activeImg === i ? "border-accent" : "border-line"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover object-top"
                  sizes="64px"
                  unoptimized={src.startsWith("/api/media/")}
                />
              </button>
            ))}
          </div>
          <div
            className="relative min-w-0 flex-1 cursor-zoom-in overflow-hidden bg-[#f5f5f5]"
            style={{ aspectRatio: "3 / 4" }}
            role="button"
            tabIndex={0}
            aria-label="Xem ảnh lớn"
            onClick={() => setLightboxOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxOpen(true);
              }
            }}
          >
            <Image
              src={currentSrc}
              alt={product.name}
              fill
              className={`pointer-events-none object-cover ${objectPos === "top" ? "object-top" : "object-bottom"}`}
              sizes="(max-width:1024px) 60vw, 40vw"
              priority
              unoptimized={currentSrc.startsWith("/api/media/")}
              onLoadingComplete={(img) => onMainImageLoad(img)}
            />
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Ảnh trước"
                  className="absolute top-1/2 left-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-lg shadow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Ảnh sau"
                  className="absolute top-1/2 right-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-lg shadow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImg((i) => (i + 1) % gallery.length);
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>

        <ProductLightbox
          open={lightboxOpen}
          images={gallery}
          index={activeImg}
          alt={product.name}
          onClose={() => setLightboxOpen(false)}
          onChangeIndex={setActiveImg}
        />

        {/* Info — layout kiểu đối thủ */}
        <div>
          <h1 className="text-[22px] leading-snug font-bold text-ink md:text-[28px]">
            {product.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <p>
              Mã sản phẩm:{" "}
              <span className="font-medium text-ink">{variant.sku || "—"}</span>
            </p>
            {product.brand && (
              <p>
                | Thương hiệu:{" "}
                <span className="font-medium text-ink">{product.brand}</span>
              </p>
            )}
          </div>

          {flashEndsAt && (
            <div className="mt-4 border border-accent/30 bg-accent-soft p-3">
              <p className="text-[13px] font-bold text-accent uppercase">
                Giảm sốc {pct || 50}%
              </p>
              <div className="mt-2 origin-left scale-90">
                <Countdown endsAt={flashEndsAt} />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="price-sale text-[28px] md:text-[32px]">
                {formatVnd(variant.price)}
              </span>
              {variant.compareAt && variant.compareAt > variant.price && (
                <>
                  <span className="text-[15px] text-muted line-through">
                    {formatVnd(variant.compareAt)}
                  </span>
                  <span className="badge-sale">-{pct}%</span>
                </>
              )}
            </div>
            <p className="text-[13px] text-muted">
              {variant.stock > 0 ? `${variant.stock} sản phẩm` : "Hết hàng"}
            </p>
          </div>

          {colors.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-[13px]">
                Màu sắc: <b>{color}</b>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      const nextSizes = product.variants
                        .filter((v) => v.color === c)
                        .map((v) => v.size)
                        .filter(Boolean) as string[];
                      setSize(nextSizes[0] || null);
                    }}
                    className={`border px-3 py-2 text-[13px] ${
                      color === c
                        ? "border-accent text-accent"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <p>
                  Kích thước: <b>{size}</b>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-11 rounded-full border px-3 py-2 text-[13px] ${
                      size === s
                        ? "border-accent text-accent"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <span className="text-[13px]">Số lượng</span>
            <div className="flex border border-line">
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="min-w-10 px-2 py-2 text-center text-[13px]">{qty}</span>
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQty((q) => Math.min(variant.stock || 99, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          {coupons.length > 0 && (
            <div className="mt-5 overflow-hidden rounded border border-accent bg-accent">
              <p className="px-3 py-2 text-[13px] font-bold tracking-wide text-white uppercase">
                Mã giảm giá
              </p>
              <div className="space-y-0 bg-accent">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center gap-3 border-t border-white/20 px-3 py-2.5"
                  >
                    <p className="min-w-0 flex-1 text-[12px] leading-snug text-white">
                      <span className="font-semibold">{c.code}</span>
                      {" — "}
                      {couponLabel(c)}
                    </p>
                    <button
                      type="button"
                      onClick={() => applyCoupon(c.code)}
                      className="shrink-0 bg-white px-3 py-1.5 text-[12px] font-semibold text-accent uppercase"
                    >
                      {appliedCode === c.code ? "Đã chọn" : "Áp dụng"}
                    </button>
                  </div>
                ))}
              </div>
              {applyMsg && (
                <p className="bg-white/10 px-3 py-2 text-[12px] text-white">{applyMsg}</p>
              )}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <AddToCartButton
              variantId={variant.id}
              quantity={qty}
              className="w-full border-2 border-accent bg-white py-3.5 text-[13px] font-semibold tracking-wide text-accent uppercase disabled:opacity-50"
              label="Thêm vào giỏ hàng"
            />
            <Link
              href="/gio-hang"
              className="btn-primary flex items-center justify-center py-3.5 text-[13px]"
            >
              Thông tin giỏ hàng
            </Link>
          </div>

          {relatedCategories.length > 0 && (
            <p className="mt-5 text-[13px] leading-6 text-muted">
              <span className="font-medium text-ink">Có thể bạn sẽ thích: </span>
              {relatedCategories.map((cat, i) => (
                <span key={cat.slug}>
                  <Link
                    href={`/collections/${cat.slug}`}
                    className="text-ink underline-offset-2 hover:text-accent hover:underline"
                  >
                    {cat.name}
                  </Link>
                  {i < relatedCategories.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}

          <p className="mt-4 text-center text-[13px] text-muted">
            Gọi đặt mua{" "}
            <a href="tel:19006750" className="font-semibold text-accent">
              1900.6750
            </a>{" "}
            (7:30 - 22:00)
          </p>
        </div>
      </div>

      <div className="mt-12 border border-line">
        <div className="flex flex-wrap border-b border-line">
          {(
            [
              ["desc", "Mô tả sản phẩm"],
              ["ship", "Chính sách giao hàng"],
              ["return", "Chính sách đổi trả"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-5 py-3 text-[13px] font-semibold uppercase ${
                tab === key
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="product-html p-5 text-[14px] leading-7 text-[#444]">
          {tab === "desc" &&
            (product.description ? (
              looksLikeHtml(product.description) ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(product.description),
                  }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{product.description}</p>
              )
            ) : (
              <p>
                Đầm thiết kế tinh tế, chất liệu cao cấp, phù hợp dự tiệc và sự kiện.
              </p>
            ))}
          {tab === "ship" && (
            <p>
              Giao hàng toàn quốc. Đồng giá ship 25.000đ. Miễn phí ship đơn từ
              300.000đ. Thời gian nhận hàng dự kiến 2–4 ngày làm việc.
            </p>
          )}
          {tab === "return" && (
            <p>
              Đổi trả trong 30 ngày nếu sản phẩm lỗi từ nhà sản xuất. Sản phẩm còn
              nguyên tem mác, chưa qua sử dụng.
            </p>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.16)] lg:hidden">
        <div className="mx-auto flex h-[72px] max-w-screen-sm items-stretch">
          <a
            href="https://zalo.me/"
            target="_blank"
            rel="noreferrer"
            className="flex w-[72px] shrink-0 flex-col items-center justify-center gap-1 text-[11px] text-accent"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
              <path d="M5 5.5h14v10H9l-4 3v-13Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 9h8M8 12h5" strokeLinecap="round" />
            </svg>
            <span>Nhắn tin</span>
          </a>
          <a
            href="tel:19006750"
            className="flex w-[72px] shrink-0 flex-col items-center justify-center gap-1 text-[11px] text-accent"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
              <path d="M7.2 3.5 10 7.8 8.3 9.5c1.2 2.5 3.2 4.5 5.7 5.7l1.7-1.7 4.3 2.8v3c0 .7-.6 1.2-1.2 1.2C10.3 20.2 3.8 13.7 3.5 5.2 3.5 4.6 4 4 4.7 4l2.5-.5Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Gọi điện</span>
          </a>
          <Link
            href="/gio-hang"
            className="relative flex w-[78px] shrink-0 flex-col items-center justify-center gap-1 text-[11px] text-accent"
          >
            <span className="relative" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
                <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9.5" cy="19" r="1" fill="currentColor" stroke="none" />
                <circle cx="17" cy="19" r="1" fill="currentColor" stroke="none" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e51f2a] px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            <span>Giỏ hàng</span>
          </Link>
          <AddToCartButton
            variantId={variant.id}
            quantity={qty}
            onAdded={(amount) => setCartCount((count) => count + amount)}
            className="min-w-0 flex-1 bg-accent px-3 text-[16px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            label="Thêm vào giỏ"
          />
        </div>
      </div>
    </div>
  );
}
