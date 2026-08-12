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
};

export function ProductCard({ product }: ProductCardProps) {
  const variant = product.variants[0];
  if (!variant) return null;
  const pct = discountPercent(variant.price, variant.compareAt);
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];
  const image = product.images[0] || "/placeholder-product.svg";

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

        {(colors.length > 0 || sizes.length > 0) && (
          <div className="mt-0.5 space-y-1 text-[11px] text-muted">
            {colors.length > 0 && (
              <p className="line-clamp-1">
                <span className="text-[#999]">Màu: </span>
                {colors.slice(0, 4).join(", ")}
                {colors.length > 4 ? "…" : ""}
              </p>
            )}
            {sizes.length > 0 && (
              <p className="line-clamp-1">
                <span className="text-[#999]">Size: </span>
                {sizes.slice(0, 6).join(" ")}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
