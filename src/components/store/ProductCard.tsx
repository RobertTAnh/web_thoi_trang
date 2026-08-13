import Link from "next/link";
import Image from "next/image";
import { discountPercent, formatVnd } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/AddToCartButton";

type Variant = {
  id: string;
  color: string | null;
  size: string | null;
  price: number;
  compareAt: number | null;
  stock: number;
  image?: string | null;
};

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string | null;
    images: string[];
    variants: Variant[];
  };
  showFlashProgress?: boolean;
};

function soldCount(productId: string) {
  let hash = 0;
  for (const character of productId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return 5 + (hash % 196);
}

export function ProductCard({ product, showFlashProgress = false }: ProductCardProps) {
  const variant = product.variants[0];
  if (!variant) return null;
  const pct = discountPercent(variant.price, variant.compareAt);
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];
  const image = product.images[0] || "/placeholder-product.svg";
  const colorOptions = colors.map((color) => {
    const colorVariant = product.variants.find((item) => item.color === color);
    return {
      color,
      image: colorVariant?.image || image,
    };
  });
  const sold = soldCount(product.id);
  const totalStock = product.variants.reduce((sum, item) => sum + item.stock, 0);
  const flashProgress = totalStock <= 0 ? 100 : 12 + ((sold * 7) % 84);
  const flashLabel =
    totalStock <= 0
      ? "Hết hàng"
      : flashProgress >= 78
        ? "Sắp cháy hàng"
        : flashProgress >= 45
          ? `Đã bán ${sold} sản phẩm`
          : "Vừa mở bán";

  return (
    <article className="product-card group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 50vw, 20vw"
            unoptimized={image.startsWith("/api/media/")}
          />
        </Link>
        {pct > 0 && (
          <span className="absolute top-2 left-2 rounded bg-[#e31c23] px-2 py-0.5 text-[12px] font-bold text-white">
            -{pct}%
          </span>
        )}
        <div className="product-actions absolute inset-x-0 bottom-0 p-2">
          <AddToCartButton
            variantId={variant.id}
            className="btn-primary w-full py-2.5 text-center text-[11px] tracking-wide"
            label="Thêm vào giỏ hàng"
          />
        </div>
      </div>

      <div className="mt-2.5 flex flex-1 flex-col gap-1.5">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-[2.5em] text-[13px] leading-snug font-semibold text-ink hover:text-[#e31c23]"
        >
          {product.name}
        </Link>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#e31c23]">
            {formatVnd(variant.price)}
          </span>
          {variant.compareAt && variant.compareAt > variant.price && (
            <span className="text-[13px] text-muted line-through">
              {formatVnd(variant.compareAt)}
            </span>
          )}
        </div>

        <p className="text-[12px] text-[#555]">
          Đã bán: <span className="font-medium text-[#f15a24]">{sold}</span>
        </p>

        {(colorOptions.length > 0 || sizes.length > 0) && (
          <div className="mt-0.5 space-y-2">
            {colorOptions.length > 0 && (
              <div className="flex min-h-8 flex-wrap items-center gap-2">
                {colorOptions.slice(0, 5).map((option) => (
                  <div key={option.color} className="group/swatch relative">
                    <span
                      className="relative block size-8 overflow-hidden rounded-full border border-[#c9c9c9] bg-white p-[2px] transition hover:border-[#f15a24]"
                      title={option.color}
                      aria-label={`Màu ${option.color}`}
                    >
                      <Image
                        src={option.image}
                        alt=""
                        fill
                        className="rounded-full object-cover object-top p-[3px]"
                        sizes="32px"
                        unoptimized={option.image.startsWith("/api/media/")}
                      />
                    </span>
                    <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-30 hidden w-28 -translate-x-1/2 overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10 group-hover/swatch:block md:w-32">
                      <span className="relative block aspect-[3/4] w-full bg-[#f5f5f5]">
                        <Image
                          src={option.image}
                          alt={`Xem trước màu ${option.color}`}
                          fill
                          className="object-cover object-top"
                          sizes="128px"
                          unoptimized={option.image.startsWith("/api/media/")}
                        />
                      </span>
                      <span className="block bg-[#f15a24] px-2 py-1.5 text-center text-[11px] font-semibold text-white">
                        {option.color}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2" aria-label="Kích thước có sẵn">
                {sizes.slice(0, 6).map((size) => (
                  <span
                    key={size}
                    className="inline-flex min-w-8 items-center justify-center rounded-full border border-[#c9c9c9] bg-white px-2 py-1 text-[11px] font-medium text-[#555] transition hover:border-[#f15a24] hover:text-[#f15a24]"
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {showFlashProgress && (
          <div className="mt-auto pt-2">
            <div className="rounded-md border border-[#f3d8d8] bg-white px-2.5 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <div className="mb-1.5 flex min-h-5 items-center gap-1.5 text-[11px] font-medium text-[#444] sm:text-[12px]">
                {flashProgress >= 78 && totalStock > 0 && (
                  <span className="text-[17px] leading-none" aria-hidden>
                    🔥
                  </span>
                )}
                <span>{flashLabel}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#f7cccc]">
                <div
                  className="h-full rounded-full bg-[#e31c23]"
                  style={{ width: `${flashProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
