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
    }, 6500);
    return () => window.clearInterval(id);
  }, [safe.length]);

  if (!safe.length) return null;
  const slide = safe[index]!;

  return (
    <section className="relative w-full overflow-hidden bg-[#f3e8d8]">
      {/*
        Banner ratio LOCKED to 16:9 — khớp ảnh 2560×1440.
        Trước dùng 3/1 nên crop mạnh (cắt đầu) + ảnh bị kéo mờ.
      */}
      <div className="relative mx-auto w-full max-w-[1920px]">
        <div className="relative aspect-[16/9] w-full">
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
                quality={95}
                className="object-cover object-center"
                sizes="(max-width:1920px) 100vw, 1920px"
              />
            </div>
          ))}

          {/* Decorative warmth + vignette — richer than flat cream */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 90% at 18% 50%, rgba(255,248,238,0.96) 0%, rgba(255,248,238,0.78) 38%, rgba(255,248,238,0.15) 62%, transparent 78%), linear-gradient(105deg, rgba(243,210,180,0.55) 0%, transparent 42%)",
            }}
          />

          {/* Soft red promo rays (Bemine energy) */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-[55%] opacity-40 mix-blend-multiply"
            style={{
              background:
                "repeating-linear-gradient(115deg, transparent 0 18px, rgba(227,28,35,0.07) 18px 22px)",
            }}
          />

          {/* Floating accents */}
          <div className="pointer-events-none absolute top-[12%] left-[6%] hidden h-10 w-10 rounded-full bg-[#f5c542]/85 shadow-md sm:block" />
          <div className="pointer-events-none absolute top-[28%] left-[30%] hidden h-6 w-6 rounded-full bg-[#f5c542]/70 sm:block" />
          <div className="pointer-events-none absolute bottom-[16%] left-[26%] hidden h-8 w-8 rounded-full bg-[#e31c23]/30 sm:block" />
          <div className="pointer-events-none absolute bottom-[22%] left-[8%] hidden h-12 w-14 rotate-[-8deg] rounded-md bg-[#e31c23] shadow-md sm:block">
            <div className="mx-auto mt-1 h-2 w-8 rounded-sm bg-[#f5c542]" />
          </div>

          {/* Promo copy */}
          <div className="absolute inset-0 z-10">
            <div className="flex h-full items-center px-4 sm:px-8 md:px-12 lg:px-16">
              <div
                key={slide.src}
                className="max-w-[300px] animate-[heroIn_0.55s_ease-out] sm:max-w-[380px] md:max-w-[460px]"
              >
                <div className="inline-block -rotate-[3deg] bg-[#e31c23] px-3.5 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.15)] sm:px-5 sm:py-2.5">
                  <p className="text-[14px] leading-none font-black tracking-wide text-white uppercase sm:text-[20px] md:text-[26px]">
                    {slide.badge}
                  </p>
                </div>

                <p className="mt-3 text-[16px] font-extrabold tracking-wide text-[#222] uppercase sm:mt-4 sm:text-[22px] md:text-[28px]">
                  {slide.title}
                </p>
                <p className="mt-1.5 max-w-[34ch] text-[12px] leading-relaxed text-[#555] sm:text-[14px] md:text-[15px]">
                  {slide.subtitle}
                </p>

                <div className="mt-4 flex items-center gap-2.5 sm:mt-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-center text-[10px] leading-tight font-bold text-white uppercase ring-2 ring-[#f5c542] sm:h-12 sm:w-12 sm:text-[11px]">
                    Chỉ
                    <br />
                    từ
                  </span>
                  <span className="text-[42px] leading-none font-black tracking-tight text-[#e31c23] sm:text-[56px] md:text-[64px]">
                    {slide.priceLabel}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5">
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3 text-[12px] font-bold tracking-wide text-white uppercase shadow-lg transition hover:bg-[#e31c23] sm:text-[13px]"
                  >
                    {slide.cta || "Mua ngay"}
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/collections/all"
                    className="inline-flex items-center gap-1 rounded-full border-2 border-[#1a1a1a]/80 bg-white/80 px-4 py-2.5 text-[11px] font-bold text-[#1a1a1a] uppercase backdrop-blur-sm hover:border-[#e31c23] hover:text-[#e31c23] sm:text-[12px]"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {safe.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-5">
            {safe.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full border border-white/90 shadow transition-all ${
                  i === index ? "w-8 bg-[#e31c23]" : "w-2.5 bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
