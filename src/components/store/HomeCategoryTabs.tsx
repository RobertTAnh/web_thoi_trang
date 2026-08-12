"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/store/ProductCard";

type Variant = {
  id: string;
  color: string | null;
  size: string | null;
  price: number;
  compareAt: number | null;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  images: string[];
  categoryId: string | null;
  variants: Variant[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

type Props = {
  categories: Category[];
  products: Product[];
};

export function HomeCategoryTabs({ categories, products }: Props) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const filtered = products.filter((p) => p.categoryId === active).slice(0, 10);
  const shown = filtered.length ? filtered : products.slice(0, 10);
  const activeCat = categories.find((c) => c.id === active);

  return (
    <div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const on = cat.id === active;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActive(cat.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold uppercase transition ${
                on
                  ? "border-[#f07a2a] bg-[#f07a2a] text-white"
                  : "border-line bg-white text-ink hover:border-[#f07a2a] hover:text-[#f07a2a]"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {activeCat && (
        <div className="mt-6 text-center">
          <Link
            href={`/collections/${activeCat.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#f07a2a] px-6 py-2 text-[13px] font-bold text-[#f07a2a] uppercase hover:bg-[#fff7f0]"
          >
            Xem thêm {activeCat.name}
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}

      {/* Category image strip like Bemine */}
      <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={`img-${cat.id}`}
            href={`/collections/${cat.slug}`}
            className="group text-center"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-full bg-[#f3eee6]">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="140px"
                />
              ) : null}
            </div>
            <p className="mt-2 text-[12px] font-semibold group-hover:text-[#f07a2a]">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
