"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatVnd, discountPercent } from "@/lib/utils";
import { looksLikeHtml, sanitizeHtml } from "@/lib/html";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { Countdown } from "@/components/store/Countdown";

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
    // Vuông / ngang → dính trên; ảnh dọc → sát đáy khung 4:3
    setObjectPos(ratio >= 0.92 ? "top" : "bottom");
  }

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex gap-2 md:gap-3">
          <div className="flex w-14 shrink-0 flex-col gap-2 sm:w-16 md:w-[72px]">
            {gallery.slice(0, 8).map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`relative aspect-square w-full overflow-hidden border ${
                  activeImg === i ? "border-accent" : "border-line"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover object-top"
                  sizes="72px"
                  unoptimized={src.startsWith("/api/media/")}
                />
              </button>
            ))}
          </div>
          <div className="relative min-w-0 flex-1 aspect-[4/3] overflow-hidden bg-[#f5f5f5]">
            <Image
              src={currentSrc}
              alt={product.name}
              fill
              className={`object-cover ${objectPos === "top" ? "object-top" : "object-bottom"}`}
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
                  className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-lg shadow"
                  onClick={() =>
                    setActiveImg((i) => (i - 1 + gallery.length) % gallery.length)
                  }
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Ảnh sau"
                  className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-lg shadow"
                  onClick={() => setActiveImg((i) => (i + 1) % gallery.length)}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info — layout kiểu đối thủ */}
        <div>
          <h1 className="text-[22px] leading-snug font-semibold md:text-[28px]">
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
    </div>
  );
}
