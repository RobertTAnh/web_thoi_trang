"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function IconZoom({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {active ? (
        <path d="M8 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <>
          <path d="M10.5 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function IconPlay({ playing }: { playing?: boolean }) {
  if (playing) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5z" />
    </svg>
  );
}

function IconFullscreen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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
  const [zoom, setZoom] = useState(1);
  const [slideshow, setSlideshow] = useState(false);
  const [gridView, setGridView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = images.length;
  const src = images[index] || images[0];

  const prev = () => {
    setZoom(1);
    onChangeIndex((index - 1 + total) % total);
  };
  const next = () => {
    setZoom(1);
    onChangeIndex((index + 1) % total);
  };

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setSlideshow(false);
      setGridView(false);
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
      if (e.key === "Escape") {
        if (gridView) setGridView(false);
        else if (zoom > 1) setZoom(1);
        else onClose();
      }
      if (e.key === "ArrowLeft" && !gridView) prev();
      if (e.key === "ArrowRight" && !gridView) next();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))));
      if (e.key === "-") setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, total, zoom, gridView, onClose]);

  useEffect(() => {
    if (!open || !slideshow || total < 2 || gridView) return;
    const id = window.setInterval(() => next(), 3000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slideshow, index, total, gridView]);

  async function toggleFullscreen() {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }

  function cycleZoom() {
    setZoom((z) => {
      if (z < 1.5) return 1.5;
      if (z < 2.5) return 2.5;
      return 1;
    });
  }

  if (!open || !src) return null;

  const toolBtn =
    "flex h-11 w-11 items-center justify-center text-white/90 transition hover:bg-white/10 hover:text-white";

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col bg-black/85 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh sản phẩm"
    >
      {/* Top toolbar — giống đối thủ */}
      <div className="relative z-30 flex h-14 shrink-0 items-center justify-between bg-black/60 px-3 backdrop-blur-sm">
        <p className="pl-1 text-[15px] tabular-nums tracking-wide">
          {index + 1} / {total}
        </p>
        <div className="flex items-center">
          <button
            type="button"
            className={`${toolBtn} ${zoom > 1 ? "text-accent" : ""}`}
            aria-label={zoom > 1 ? "Thu nhỏ" : "Phóng to"}
            title={zoom > 1 ? "Thu nhỏ" : "Zoom"}
            onClick={cycleZoom}
          >
            <IconZoom active={zoom > 1} />
          </button>
          <button
            type="button"
            className={`${toolBtn} ${slideshow ? "text-accent" : ""}`}
            aria-label="Slideshow"
            title="Tự chạy ảnh"
            onClick={() => setSlideshow((s) => !s)}
          >
            <IconPlay playing={slideshow} />
          </button>
          <button
            type="button"
            className={toolBtn}
            aria-label="Toàn màn hình"
            title="Toàn màn hình"
            onClick={toggleFullscreen}
          >
            <IconFullscreen />
          </button>
          <button
            type="button"
            className={`${toolBtn} ${gridView ? "text-accent" : ""}`}
            aria-label="Lưới ảnh"
            title="Xem tất cả ảnh"
            onClick={() => setGridView((g) => !g)}
          >
            <IconGrid />
          </button>
          <button
            type="button"
            className={toolBtn}
            aria-label="Đóng"
            title="Đóng"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>
      </div>

      {gridView ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((thumb, i) => (
              <button
                key={`g-${thumb}-${i}`}
                type="button"
                onClick={() => {
                  onChangeIndex(i);
                  setGridView(false);
                  setZoom(1);
                }}
                className={`relative aspect-[3/4] overflow-hidden border-2 ${
                  i === index ? "border-accent" : "border-transparent"
                }`}
              >
                <Image
                  src={thumb}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="240px"
                  unoptimized={thumb.startsWith("/api/media/")}
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Main stage */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Ảnh trước"
                  className="absolute top-1/2 left-1 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-5xl text-white/80 hover:text-white md:left-3"
                  onClick={prev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Ảnh sau"
                  className="absolute top-1/2 right-1 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center text-5xl text-white/80 hover:text-white md:right-3"
                  onClick={next}
                >
                  ›
                </button>
              </>
            )}

            <div
              className={`flex h-full max-h-full w-full items-center justify-center overflow-auto px-10 py-2 md:px-20 ${
                zoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onClick={(e) => {
                if (e.target === e.currentTarget) return;
                cycleZoom();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="max-h-[calc(100vh-180px)] w-auto max-w-[min(92vw,720px)] origin-center object-contain transition-transform duration-200 select-none"
                style={{ transform: `scale(${zoom})` }}
                draggable={false}
              />
            </div>
          </div>

          {/* Bottom thumbnails — giống đối thủ */}
          {total > 1 && (
            <div className="z-30 flex shrink-0 justify-center gap-2 overflow-x-auto bg-black/50 px-4 py-3 backdrop-blur-sm">
              {images.map((thumb, i) => (
                <button
                  key={`b-${thumb}-${i}`}
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    onChangeIndex(i);
                  }}
                  className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden border ${
                    i === index
                      ? "border-accent"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="72px"
                    unoptimized={thumb.startsWith("/api/media/")}
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
