"use client";

import { useMemo, useState } from "react";
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

const coupons = [
  { code: "TISORA10", desc: "Giảm 10% đơn từ 2 triệu" },
  { code: "TISORA15", desc: "Giảm 15% đơn từ 5 triệu" },
  { code: "FREESHIP", desc: "Freeship đơn từ 1 triệu" },
];

export function ProductDetailClient({
  product,
  flashEndsAt,
}: {
  product: {
    name: string;
    brand: string | null;
    description: string | null;
    images: string[];
    variants: Variant[];
  };
  flashEndsAt?: string | Date | null;
}) {
  const gallery = product.images.length
    ? product.images
    : ["/placeholder-product.svg"];
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ship" | "return">("desc");

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

  const variant =
    product.variants.find(
      (v) => (!color || v.color === color) && (!size || v.size === size),
    ) || product.variants[0];

  const pct = discountPercent(variant.price, variant.compareAt);
  const save =
    variant.compareAt && variant.compareAt > variant.price
      ? variant.compareAt - variant.price
      : 0;

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery — thumbnail dọc bên trái như EGA Style */}
        <div className="flex gap-2 md:gap-3">
          <div className="flex w-14 shrink-0 flex-col gap-2 sm:w-16 md:w-[72px]">
            {gallery.slice(0, 6).map((src, i) => (
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
                  className="object-cover"
                  sizes="72px"
                  unoptimized={src.startsWith("/api/media/")}
                />
              </button>
            ))}
          </div>
          <div className="relative min-w-0 flex-1 aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
            <Image
              src={gallery[activeImg] || gallery[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 60vw, 40vw"
              priority
              unoptimized={(gallery[activeImg] || gallery[0]).startsWith("/api/media/")}
            />
            {pct > 0 && (
              <span className="badge-sale absolute top-3 left-3 text-sm">-{pct}%</span>
            )}
            <span className="absolute top-3 right-3 bg-white px-2 py-1 text-[11px] font-medium text-accent">
              {variant.stock > 0 ? "Còn hàng" : "Hết hàng"}
            </span>
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

        {/* Info — layout giống EGA PDP */}
        <div>
          <h1 className="text-[26px] leading-tight font-semibold md:text-[32px]">
            {product.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
            {product.brand && (
              <p>
                Thương hiệu:{" "}
                <span className="font-medium text-ink">{product.brand}</span>
              </p>
            )}
            <p>
              Mã sản phẩm:{" "}
              <span className="font-medium text-ink">
                {variant.sku || "DEMO001"}
              </span>
            </p>
          </div>

          {flashEndsAt && (
            <div className="mt-4 border border-accent/30 bg-accent-soft p-3">
              <p className="text-[13px] font-bold text-accent uppercase">
                Giảm sốc {pct || 50}%
              </p>
              <div className="mt-2 scale-90 origin-left">
                <Countdown endsAt={flashEndsAt} />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-3 border-b border-line pb-4">
            <span className="price-sale text-[28px]">{formatVnd(variant.price)}</span>
            {variant.compareAt && variant.compareAt > variant.price && (
              <>
                <span className="text-[16px] text-muted line-through">
                  {formatVnd(variant.compareAt)}
                </span>
                <span className="badge-sale">-{pct}%</span>
              </>
            )}
          </div>
          {save > 0 && (
            <p className="mt-2 text-[13px] text-muted">
              (Tiết kiệm: {formatVnd(save)})
            </p>
          )}

          <div className="mt-4 border border-line">
            <div className="bg-[#f8f9fa] px-3 py-2 text-[13px] font-semibold uppercase">
              Khuyến mãi - Ưu đãi
            </div>
            <ul className="space-y-1.5 px-3 py-3 text-[13px] text-muted">
              <li>• Nhập mã <b className="text-accent">TISORA</b> thêm 5% đơn hàng</li>
              <li>• Đồng giá Ship toàn quốc 25.000đ</li>
              <li>• Hỗ trợ 10.000 phí Ship đơn từ 200.000đ</li>
              <li>• Miễn phí Ship đơn từ 300.000đ</li>
              <li>• Đổi trả trong 30 ngày nếu sản phẩm lỗi</li>
            </ul>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[13px] font-semibold">Mã giảm giá</p>
            <div className="flex flex-wrap gap-2">
              {coupons.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  title={c.desc}
                  className="border border-dashed border-accent px-3 py-1.5 text-[12px] font-semibold text-accent"
                  onClick={() => navigator.clipboard?.writeText(c.code)}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          {sizes.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <p>
                  Kích thước: <b>{size}</b>
                </p>
                <button type="button" className="text-accent underline">
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-11 border px-3 py-2 text-[13px] ${
                      size === s
                        ? "border-ink bg-ink text-white"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                      const next = product.variants
                        .filter((v) => v.color === c)
                        .map((v) => v.size)
                        .filter(Boolean);
                      setSize((next[0] as string) || null);
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

          <div className="mt-5 flex items-center gap-3">
            <span className="text-[13px]">Số lượng:</span>
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
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <AddToCartButton
              variantId={variant.id}
              quantity={qty}
              className="btn-dark w-full py-3.5 text-[13px] disabled:opacity-50"
              label="Thêm vào giỏ"
            />
            <Link
              href="/thanh-toan"
              className="btn-primary flex items-center justify-center py-3.5 text-[13px]"
            >
              Mua ngay
            </Link>
          </div>

          <p className="mt-4 text-center text-[13px] text-muted">
            Gọi đặt mua{" "}
            <a href="tel:19006750" className="font-semibold text-accent">
              1900.6750
            </a>{" "}
            (7:30 - 22:00)
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center text-[11px] text-muted">
            <div>
              <p className="font-medium text-ink">Giao hàng</p>
              <p>Toàn quốc</p>
            </div>
            <div>
              <p className="font-medium text-ink">Tích điểm</p>
              <p>Mọi sản phẩm</p>
            </div>
            <div>
              <p className="font-medium text-ink">Giảm 5%</p>
              <p>Thanh toán online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs mô tả */}
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
