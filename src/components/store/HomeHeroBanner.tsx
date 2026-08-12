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

export function HomeHeroBanner({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const safe = slides.length > 0 ? slides : [];

  useEffect(() => {
    if (safe.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safe.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [safe.length]);

  if (!safe.length) return null;
  const slide = safe[index]!;

  return (
    <section className="relative w-full overflow-hidden bg-[#f6efe4]">
      {/* Wide banner — keep full figure via object-right + contain-ish cover */}
      <div className="relative mx-auto w-full max-w-[1600px]">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] md:aspect-[3/1]">
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
                className="object-cover object-[78%_28%] sm:object-[80%_30%] md:object-[82%_32%]"
                sizes="100vw"
              />
            </div>
          ))}

          {/* Soft left panel so text always readable */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f6efe4] via-[#f6efe4]/92 to-transparent sm:via-[#f6efe4]/75 md:w-[58%] md:via-[#f6efe4]/88" />

          {/* Promo copy — always on top (Bemine-style) */}
          <div className="absolute inset-0 z-10">
            <div className="container-ega flex h-full items-center py-6">
              <div
                key={slide.src}
                className="max-w-[280px] animate-[heroIn_0.55s_ease-out] sm:max-w-[360px] md:max-w-[440px]"
              >
                <div className="inline-block -rotate-2 bg-[#e31c23] px-3 py-2 shadow-md sm:px-5 sm:py-2.5">
                  <p className="text-[15px] leading-none font-black tracking-wide text-white uppercase sm:text-xl md:text-2xl">
                    {slide.badge}
                  </p>
                </div>

                <p className="mt-3 text-[15px] font-bold tracking-wide text-[#333] uppercase sm:text-lg md:text-xl">
                  {slide.title}
                </p>
                <p className="mt-1 hidden text-[13px] text-[#666] sm:block md:text-[14px]">
                  {slide.subtitle}
                </p>

                <div className="mt-4 flex items-center gap-2 sm:mt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white uppercase sm:h-12 sm:w-12 sm:text-[11px]">
                    Chỉ
                    <br />
                    từ
                  </span>
                  <span className="text-4xl leading-none font-black text-[#e31c23] sm:text-5xl md:text-6xl">
                    {slide.priceLabel}
                  </span>
                </div>

                <Link
                  href={slide.href}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12px] font-bold tracking-wide text-white uppercase transition hover:bg-[#e31c23] sm:mt-5 sm:px-6 sm:text-[13px]"
                >
                  {slide.cta}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {safe.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-4">
            {safe.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full border border-white/80 transition-all ${
                  i === index ? "w-7 bg-[#e31c23]" : "w-2.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
