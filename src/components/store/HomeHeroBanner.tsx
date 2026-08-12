"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  src: string;
  alt: string;
  href: string;
  /** When true, show text overlay on left (for clean photo banners) */
  overlay?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    priceLabel: string;
    cta: string;
  };
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
    }, 5500);
    return () => window.clearInterval(id);
  }, [safe.length]);

  if (!safe.length) return null;

  return (
    <section className="relative w-full overflow-hidden bg-[#f7f1e8]">
      <div className="relative aspect-[16/7] min-h-[220px] w-full md:aspect-[3/1] md:min-h-[320px]">
        {safe.map((slide, i) => {
          const active = i === index;
          return (
            <Link
              key={slide.src}
              href={slide.href}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                className={`object-cover object-center transition-transform duration-[6500ms] ease-out ${
                  active ? "scale-105" : "scale-100"
                }`}
                sizes="100vw"
              />
              {slide.overlay && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#f7f1e8]/95 via-[#f7f1e8]/55 to-transparent md:from-[#f7f1e8]/90 md:via-[#f7f1e8]/35">
                  <div className="container-ega flex h-full items-center">
                    <div className="max-w-[340px] animate-[heroIn_0.7s_ease-out] md:max-w-[420px]">
                      <span className="inline-block rounded-full bg-[#ee495a] px-4 py-1.5 text-[12px] font-bold tracking-wide text-white uppercase shadow-sm md:text-[13px]">
                        {slide.overlay.eyebrow}
                      </span>
                      <h2 className="mt-3 font-display text-2xl leading-tight font-extrabold tracking-tight text-[#2b2b2b] uppercase md:text-4xl">
                        {slide.overlay.title}
                      </h2>
                      <p className="mt-2 text-[14px] font-medium text-[#555] md:text-[16px]">
                        {slide.overlay.subtitle}
                      </p>
                      <div className="mt-4 flex items-end gap-2">
                        <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white uppercase">
                          Chỉ từ
                        </span>
                        <span className="text-4xl leading-none font-black text-[#ee495a] md:text-5xl">
                          {slide.overlay.priceLabel}
                        </span>
                      </div>
                      <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[12px] font-bold tracking-wide text-white uppercase transition hover:bg-[#ee495a]">
                        {slide.overlay.cta}
                        <span aria-hidden>→</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {safe.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-5">
          {safe.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-[#ee495a]" : "w-2 bg-white/80 shadow"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
