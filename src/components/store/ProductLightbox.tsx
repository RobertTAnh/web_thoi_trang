"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function ProductLightbox({
  open,
  images,
  index,
  alt,
  onClose,
  onChangeIndex,
}: {
  open: boolean;
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [slideshow, setSlideshow] = useState(false);

  const total = images.length;
  const src = images[index] || images[0];
  const prev = () => onChangeIndex((index - 1 + total) % total);
  const next = () => onChangeIndex((index + 1) % total);

  useEffect(() => {
    if (!open) {
      setZoomed(false);
      setSlideshow(false);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChangeIndex((index - 1 + total) % total);
      if (e.key === "ArrowRight") onChangeIndex((index + 1) % total);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, total, onClose, onChangeIndex]);

  useEffect(() => {
    if (!open || !slideshow || total < 2) return;
    const id = window.setInterval(() => {
      onChangeIndex((index + 1) % total);
    }, 3000);
    return () => window.clearInterval(id);
  }, [open, slideshow, index, total, onChangeIndex]);

  if (!open || !src) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 text-white">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <p className="text-sm tabular-nums">
          {index + 1} / {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center text-lg ${zoomed ? "text-accent" : ""}`}
            aria-label="Zoom"
            title="Phóng to"
            onClick={() => setZoomed((z) => !z)}
          >
            🔍
          </button>
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center text-lg ${slideshow ? "text-accent" : ""}`}
            aria-label="Slideshow"
            title="Tự chạy"
            onClick={() => setSlideshow((s) => !s)}
          >
            ▶
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-xl"
            aria-label="Đóng"
            title="Đóng"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 md:px-16">
        {/* Left vertical thumbs (desktop) */}
        {total > 1 && (
          <div className="absolute top-1/2 left-3 z-10 hidden max-h-[70vh] -translate-y-1/2 flex-col gap-2 overflow-y-auto md:flex">
            {images.map((thumb, i) => (
              <button
                key={thumb + i}
                type="button"
                onClick={() => onChangeIndex(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden border-2 ${
                  i === index ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={thumb}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized={thumb.startsWith("/api/media/")}
                />
              </button>
            ))}
          </div>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              className="absolute top-1/2 left-2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl text-white/90 hover:text-white md:left-20"
              onClick={prev}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Ảnh sau"
              className="absolute top-1/2 right-2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl text-white/90 hover:text-white"
              onClick={next}
            >
              ›
            </button>
          </>
        )}

        <button
          type="button"
          className="relative flex h-full max-h-full w-full max-w-3xl items-center justify-center"
          onClick={() => setZoomed((z) => !z)}
          aria-label="Phóng to ảnh"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={`max-h-[min(78vh,900px)] max-w-full object-contain transition-transform duration-200 ${
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
          />
        </button>
      </div>

      {/* Bottom thumbs */}
      {total > 1 && (
        <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 py-4">
          {images.map((thumb, i) => (
            <button
              key={`b-${thumb}-${i}`}
              type="button"
              onClick={() => onChangeIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden border-2 sm:h-20 sm:w-20 ${
                i === index ? "border-accent" : "border-white/20 opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={thumb}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={thumb.startsWith("/api/media/")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
