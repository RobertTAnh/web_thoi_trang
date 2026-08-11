"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type PopupProduct = {
  name: string;
  slug: string;
  image: string | null;
};

const FIRST_NAMES = [
  "Bích Ngọc",
  "Thu Hà",
  "Minh Anh",
  "Lan Anh",
  "Hồng Nhung",
  "Thảo My",
  "Khánh Linh",
  "Phương Thảo",
  "Quỳnh Anh",
  "Ngọc Trâm",
  "Mai Phương",
  "Thanh Tú",
  "Hải Yến",
  "Kim Ngân",
  "Bảo Châu",
  "Như Quỳnh",
  "Diễm My",
  "Hoài Anh",
  "Tuấn Anh",
  "Minh Đức",
  "Hoàng Nam",
  "Đức Huy",
  "Quốc Bảo",
  "Thành Đạt",
];

const LAST_NAMES = [
  "Nguyễn",
  "Trần",
  "Lê",
  "Phạm",
  "Hoàng",
  "Huỳnh",
  "Phan",
  "Vũ",
  "Võ",
  "Đặng",
  "Bùi",
  "Đỗ",
  "Hồ",
  "Ngô",
  "Dương",
  "Đinh",
];

const PLACES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Huế",
  "Nha Trang",
  "Đà Lạt",
  "Vũng Tàu",
  "Quy Nhơn",
  "Buôn Ma Thuột",
  "Thanh Hóa",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Ninh",
  "Bắc Ninh",
  "Hưng Yên",
  "Nam Định",
  "Thái Bình",
  "Bình Dương",
  "Đồng Nai",
  "Long An",
  "An Giang",
  "Kiên Giang",
  "Tuyên Quang",
  "Lào Cai",
  "Sơn La",
  "Thái Nguyên",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomName() {
  // Họ + tên đệm/tên — giống thật (VD: Ngô Bích Ngọc → "Bích Ngọc Ngô" như đối thủ)
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  return `${first} ${last}`;
}

type Toast = {
  id: number;
  name: string;
  place: string;
  minutes: number;
  product: PopupProduct;
};

export function RecentPurchasePopup({ products }: { products: PopupProduct[] }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!products.length) return;
    let cancelled = false;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let id = 0;

    function scheduleNext(delayMs: number) {
      showTimer = setTimeout(() => {
        if (cancelled) return;
        const product = pick(products);
        id += 1;
        setToast({
          id,
          name: randomName(),
          place: pick(PLACES),
          minutes: randomInt(5, 30),
          product,
        });
        setVisible(true);

        // Hiện ~6–8s rồi ẩn
        hideTimer = setTimeout(() => {
          if (cancelled) return;
          setVisible(false);
          // Đợi ẩn xong rồi schedule lần sau 10–30s
          showTimer = setTimeout(() => {
            if (cancelled) return;
            scheduleNext(0);
          }, randomInt(10_000, 30_000));
        }, randomInt(6000, 8000));
      }, delayMs);
    }

    // Lần đầu sau 8–15s
    scheduleNext(randomInt(8000, 15_000));

    return () => {
      cancelled = true;
      if (hideTimer) clearTimeout(hideTimer);
      if (showTimer) clearTimeout(showTimer);
    };
  }, [products]);

  if (!toast) return null;

  const image = toast.product.image || "/placeholder-product.svg";

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-[min(92vw,340px)] transition-all duration-500 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-live="polite"
    >
      <Link
        href={`/products/${toast.product.slug}`}
        className="flex gap-3 rounded-lg border border-line bg-white p-2.5 shadow-lg hover:border-accent"
      >
        <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-[#f5f5f5]">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover object-top"
            sizes="56px"
            unoptimized={image.startsWith("/api/media/")}
          />
        </div>
        <div className="min-w-0 flex-1 py-0.5 pr-1">
          <p className="line-clamp-2 text-[13px] font-bold leading-snug text-ink">
            {toast.product.name}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted">
            <span className="font-medium text-ink">{toast.name}</span> tại{" "}
            {toast.place} vừa mua sản phẩm này cách đây {toast.minutes} phút
          </p>
        </div>
        <button
          type="button"
          aria-label="Đóng"
          className="shrink-0 self-start px-1 text-sm text-muted hover:text-ink"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setVisible(false);
          }}
        >
          ×
        </button>
      </Link>
    </div>
  );
}
