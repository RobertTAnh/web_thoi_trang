"use client";

import { useState } from "react";

export function TopBar() {
  const [visible, setVisible] = useState(true);
  const text = "CHÀO HÈ SÔI NỔI - MỎI TAY SĂN QUÀ - ƯU ĐÃI X3";
  if (!visible) return null;
  return (
    <div className="relative overflow-hidden bg-topbar py-2 text-[12px] tracking-wide text-white uppercase">
      <p className="px-10 text-center text-[13px] font-medium lg:hidden">{text}</p>
      <button type="button" onClick={() => setVisible(false)} aria-label="Đóng thông báo" className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/45 text-base text-[#87451e] lg:hidden">×</button>
      <div className="animate-marquee hidden w-max whitespace-nowrap lg:flex">
        <span className="px-4">{`${text} - FREESHIP ĐƠN TỪ 300K - `.repeat(4)}</span>
        <span className="px-4">{`${text} - FREESHIP ĐƠN TỪ 300K - `.repeat(4)}</span>
      </div>
    </div>
  );
}
