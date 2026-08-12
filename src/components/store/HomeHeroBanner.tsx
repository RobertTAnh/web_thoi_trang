"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  src: string;
  alt: string;
  href: string;
  badge: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  cta: string;
};

type Props = {
  slides: HeroSlide[];
};

/**
 * Banner tỉ lệ Bemine 3:1 (ảnh 3600×1200).
 * Mobile hơi cao hơn để chữ/CTA không bị cắt.
 */
export function HomeHeroBanner({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const safe = slides.length > 0 ? slides : [];

  useEffect(() => {
    if (safe.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safe.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [safe.length]);

  if (!safe.length) return null;
  const slide = safe[index]!;

  return (
    <section className="relative w-full overflow-hidden bg-[#f6efe4]">
      <div className="relative mx-auto w-full max-w-[1800px]">
        {/* Mobile ~2.2:1 | Desktop 3:1 như bemine.vn */}
        <div className="relative aspect-[11/5] w-full sm:aspect-[5/2] md:aspect-[3/1]">
          {safe.map((s, i) => (
            <div
              key={s.src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                quality={92}
                className="object-cover object-center"
                sizes="(max-width:1800px) 100vw, 1800px"
              />
            </div>
          ))}

          {/* Promo copy — compact để vừa chiều cao 3:1 */}
          <div className="absolute inset-0 z-10">
            <div className="flex h-full items-center px-4 sm:px-8 md:px-12 lg:px-16">
              <div
                key={slide.src}
                className="max-w-[240px] animate-[heroIn_0.55s_ease-out] sm:max-w-[320px] md:max-w-[400px]"
              >
                <div className="inline-block -rotate-[3deg] bg-[#e31c23] px-3 py-1.5 shadow-[3px_3px_0_rgba(0,0,0,0.12)] sm:px-4 sm:py-2">
                  <p className="text-[13px] leading-none font-black tracking-wide text-white uppercase sm:text-[18px] md:text-[22px]">
                    {slide.badge}
                  </p>
                </div>

                <p className="mt-2 text-[15px] font-extrabold tracking-wide text-[#222] uppercase sm:mt-2.5 sm:text-[20px] md:text-[24px]">
                  {slide.title}
                </p>
                <p className="mt-1 hidden max-w-[36ch] text-[13px] leading-snug text-[#555] sm:block">
                  {slide.subtitle}
                </p>

                <div className="mt-2.5 flex items-center gap-2 sm:mt-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-center text-[9px] leading-tight font-bold text-white uppercase ring-2 ring-[#f5c542] sm:h-10 sm:w-10 sm:text-[10px]">
                    Chỉ
                    <br />
                    từ
                  </span>
                  <span className="text-[34px] leading-none font-black tracking-tight text-[#e31c23] sm:text-[44px] md:text-[52px]">
                    {slide.priceLabel}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:mt-3">
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1a1a] px-5 py-2 text-[11px] font-bold tracking-wide text-white uppercase shadow-md transition hover:bg-[#e31c23] sm:px-5 sm:py-2.5 sm:text-[12px]"
                  >
                    {slide.cta || "Mua ngay"}
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/collections/all"
                    className="inline-flex items-center rounded-full border border-[#1a1a1a]/70 bg-white/85 px-3.5 py-2 text-[11px] font-bold text-[#1a1a1a] uppercase backdrop-blur-sm hover:border-[#e31c23] hover:text-[#e31c23]"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {safe.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-3.5">
            {safe.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full border border-white/90 shadow transition-all ${
                  i === index ? "w-7 bg-[#e31c23]" : "w-2 bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
