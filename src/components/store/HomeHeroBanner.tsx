"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  src: string;
  alt: string;
  href: string;
  /** Khi true: ảnh đã có chữ sẵn — không overlay text HTML */
  bakedInText?: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  priceLabel?: string;
  cta?: string;
};

type Props = {
  slides: HeroSlide[];
};

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
  const showOverlay = !slide.bakedInText;

  return (
    <section className="relative w-full overflow-hidden bg-[#f4ebe0]">
      <div className="relative mx-auto w-full max-w-[1920px]">
        {/* Khớp ảnh custom 2:1 (2400×1200) */}
        <div className="relative aspect-[2/1] w-full">
          {safe.map((s, i) => {
            const active = i === index;
            return (
              <Link
                key={s.src}
                href={s.href}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  priority={i === 0}
                  quality={95}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </Link>
            );
          })}

          {showOverlay && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
              <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
                <div className="max-w-[230px] sm:max-w-[300px] md:max-w-[380px]">
                  {slide.badge && (
                    <div className="inline-block -rotate-2 bg-[#e31c23] px-3 py-1.5 shadow-md sm:px-4 sm:py-2">
                      <p className="text-[12px] leading-none font-black text-white uppercase sm:text-[16px] md:text-[20px]">
                        {slide.badge}
                      </p>
                    </div>
                  )}
                  {slide.title && (
                    <h2 className="mt-2 text-[16px] font-black tracking-wide text-[#1a1a1a] uppercase sm:mt-3 sm:text-[22px] md:text-[26px]">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="mt-1 hidden text-[13px] text-[#555] sm:block md:text-[14px]">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.priceLabel && (
                    <div className="mt-2 flex items-center gap-2 sm:mt-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a] text-[8px] leading-tight font-bold text-white uppercase sm:h-9 sm:w-9 sm:text-[9px]">
                        Chỉ
                        <br />
                        từ
                      </span>
                      <span className="text-[36px] leading-none font-black text-[#e31c23] sm:text-[48px] md:text-[56px]">
                        {slide.priceLabel}
                      </span>
                    </div>
                  )}
                  <Link
                    href={slide.href}
                    className="pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#e31c23] px-5 py-2.5 text-[12px] font-bold tracking-wide text-white uppercase shadow-md transition hover:bg-[#c4161c] sm:mt-4 sm:px-6 sm:text-[13px]"
                  >
                    {slide.cta || "Mua ngay"}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {safe.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 md:bottom-3">
            {safe.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-[#e31c23]"
                    : "w-2 bg-white/90 shadow ring-1 ring-black/10"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
