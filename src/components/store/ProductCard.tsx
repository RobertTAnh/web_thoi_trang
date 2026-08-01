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
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
  const image = product.images[0] || "/placeholder-product.svg";

  return (
    <article className="product-card group">
      <div className="relative aspect-[3/4] overflow-hidden bg-line/40">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        </Link>
        {pct > 0 && (
          <span className="absolute top-3 left-3 bg-sale px-2 py-1 text-xs font-medium text-white">
            -{pct}%
          </span>
        )}
        <div className="product-actions absolute right-3 bottom-3 left-3 flex gap-2">
          <AddToCartButton
            variantId={variant.id}
            className="flex-1 bg-ink px-3 py-2 text-center text-xs tracking-wide text-white uppercase"
          />
          <Link
            href={`/products/${product.slug}`}
            className="bg-white px-3 py-2 text-xs tracking-wide text-ink uppercase"
          >
            Xem
          </Link>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {product.brand && (
          <p className="text-[11px] tracking-[0.16em] text-muted uppercase">
            {product.brand}
          </p>
        )}
        <Link href={`/products/${product.slug}`} className="block text-sm hover:text-accent">
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{formatVnd(variant.price)}</span>
          {variant.compareAt && variant.compareAt > variant.price && (
            <span className="text-xs text-muted line-through">
              {formatVnd(variant.compareAt)}
            </span>
          )}
        </div>
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {colors.slice(0, 3).map((c) => (
              <span
                key={c}
                className="border border-line px-1.5 py-0.5 text-[10px] text-muted"
              >
                {c}
              </span>
            ))}
            {colors.length > 3 && (
              <span className="text-[10px] text-muted">+{colors.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
