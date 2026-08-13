"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string };

export function MobileNav({
  categories,
  accountHref,
  accountLabel,
}: {
  categories: Category[];
  accountHref: string;
  accountLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="relative z-[70] flex h-11 w-11 flex-col items-center justify-center gap-[6px] lg:hidden"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <span className="text-2xl">✕</span>
        ) : (
          <><span className="h-[3px] w-7 rounded bg-ink" /><span className="h-[3px] w-7 rounded bg-ink" /><span className="h-[3px] w-7 rounded bg-ink" /></>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute top-0 left-0 flex h-full w-[min(86vw,320px)] flex-col bg-white shadow-xl">
            <div className="flex h-[70px] items-center justify-between border-b border-line px-4">
              <p className="text-sm font-semibold tracking-wide uppercase">Menu</p>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-lg"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 text-[14px]">
              <div className="space-y-1">
                <Link
                  href="/"
                  className="block border-b border-line py-3 font-medium uppercase"
                  onClick={() => setOpen(false)}
                >
                  Trang chủ
                </Link>
                <p className="pt-3 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase">
                  Sản phẩm
                </p>
                <Link
                  href="/collections"
                  className="block py-2.5 pl-1"
                  onClick={() => setOpen(false)}
                >
                  Tất cả sản phẩm
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/collections/${c.slug}`}
                    className="block py-2.5 pl-1 text-[#444]"
                    onClick={() => setOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
                <Link
                  href="/#flash-sale"
                  className="block border-b border-line py-3 font-medium uppercase"
                  onClick={() => setOpen(false)}
                >
                  Khuyến mãi
                </Link>
                <Link
                  href="/tin-tuc"
                  className="block border-b border-line py-3 font-medium uppercase"
                  onClick={() => setOpen(false)}
                >
                  Tin tức
                </Link>
                <Link
                  href="/lien-he"
                  className="block border-b border-line py-3 font-medium uppercase"
                  onClick={() => setOpen(false)}
                >
                  Liên hệ
                </Link>
                <Link
                  href={accountHref}
                  className="block border-b border-line py-3 font-medium uppercase"
                  onClick={() => setOpen(false)}
                >
                  {accountLabel}
                </Link>
                <Link
                  href="/gio-hang"
                  className="block py-3 font-medium uppercase text-accent"
                  onClick={() => setOpen(false)}
                >
                  Giỏ hàng
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
