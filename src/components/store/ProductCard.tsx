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
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        </Link>
        {pct > 0 && (
          <span className="badge-sale absolute top-2 left-2">-{pct}%</span>
        )}
        <div className="product-actions absolute right-2 bottom-2 left-2 flex gap-1">
          <AddToCartButton
            variantId={variant.id}
            className="btn-dark flex-1 px-2 py-2 text-center text-[11px]"
            label="Tùy chọn"
          />
          <Link
            href={`/products/${product.slug}`}
            className="btn-primary px-3 py-2 text-[11px]"
          >
            Xem nhanh
          </Link>
        </div>
      </div>
      <div className="mt-2.5 space-y-1 text-center">
        {product.brand && (
          <p className="text-[11px] text-muted">{product.brand}</p>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="block text-[13px] font-medium hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-center gap-2">
          <span className="price-sale text-[15px]">{formatVnd(variant.price)}</span>
          {variant.compareAt && variant.compareAt > variant.price && (
            <span className="text-[13px] text-muted line-through">
              {formatVnd(variant.compareAt)}
            </span>
          )}
        </div>
        {colors.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 pt-1">
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
