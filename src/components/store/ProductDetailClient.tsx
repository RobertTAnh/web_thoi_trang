"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatVnd, discountPercent } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/AddToCartButton";

type Variant = {
  id: string;
  color: string | null;
  size: string | null;
  price: number;
  compareAt: number | null;
  stock: number;
  image: string | null;
};

export function ProductDetailClient({
  product,
}: {
  product: {
    name: string;
    brand: string | null;
    description: string | null;
    images: string[];
    variants: Variant[];
  };
}) {
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
      (v) =>
        (!color || v.color === color) && (!size || v.size === size),
    ) || product.variants[0];

  const image = variant?.image || product.images[0] || "/placeholder-product.svg";
  const pct = discountPercent(variant.price, variant.compareAt);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="relative aspect-[3/4] overflow-hidden bg-line/30">
        <Image src={image} alt={product.name} fill className="object-cover" sizes="50vw" priority />
        {pct > 0 && (
          <span className="absolute top-4 left-4 bg-sale px-2 py-1 text-xs text-white">
            -{pct}%
          </span>
        )}
      </div>
      <div>
        {product.brand && (
          <p className="text-xs tracking-[0.18em] text-muted uppercase">{product.brand}</p>
        )}
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{product.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl">{formatVnd(variant.price)}</span>
          {variant.compareAt && variant.compareAt > variant.price && (
            <span className="text-muted line-through">
              {formatVnd(variant.compareAt)}
            </span>
          )}
        </div>
        {product.description && (
          <p className="mt-6 text-sm leading-relaxed text-muted">{product.description}</p>
        )}

        {colors.length > 0 && (
          <div className="mt-8">
            <p className="mb-2 text-sm">Màu: {color}</p>
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
                      .filter(Boolean);
                    setSize((nextSizes[0] as string) || null);
                  }}
                  className={`border px-3 py-1.5 text-sm ${
                    color === c ? "border-ink bg-ink text-white" : "border-line"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm">Size: {size}</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`border px-3 py-1.5 text-sm ${
                    size === s ? "border-ink bg-ink text-white" : "border-line"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-muted">
          Còn {variant.stock} sản phẩm
        </p>

        <AddToCartButton
          variantId={variant.id}
          className="mt-6 w-full bg-accent px-6 py-3 text-sm tracking-wide text-white uppercase disabled:opacity-50"
          label="Thêm vào giỏ"
        />

        <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-muted">
          <li>Nhập mã LUNARA10 giảm 10% đơn từ 2 triệu</li>
          <li>Đồng giá ship toàn quốc 25.000đ</li>
          <li>Miễn phí ship đơn từ 300.000đ</li>
          <li>Đổi trả trong 30 ngày nếu sản phẩm lỗi</li>
        </ul>
      </div>
    </div>
  );
}
