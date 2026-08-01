"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

export function Countdown({ endsAt }: { endsAt: string | Date }) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = parts(end - now);
  const box =
    "min-w-12 bg-[#212529] px-2 py-1.5 text-center text-white md:min-w-14";

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted">Kết thúc sau</span>
      <div className={box}>
        <div className="font-medium">{String(days).padStart(2, "0")}</div>
        <div className="text-[10px] opacity-70">ngày</div>
      </div>
      <div className={box}>
        <div className="font-medium">{String(hours).padStart(2, "0")}</div>
        <div className="text-[10px] opacity-70">giờ</div>
      </div>
      <div className={box}>
        <div className="font-medium">{String(minutes).padStart(2, "0")}</div>
        <div className="text-[10px] opacity-70">phút</div>
      </div>
      <div className={box}>
        <div className="font-medium animate-pulse-soft">
          {String(seconds).padStart(2, "0")}
        </div>
        <div className="text-[10px] opacity-70">giây</div>
      </div>
    </div>
  );
}
