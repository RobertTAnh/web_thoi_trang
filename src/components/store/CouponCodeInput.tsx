"use client";

import { useEffect, useState } from "react";

const COUPON_STORAGE_KEY = "tisora_coupon";

export function CouponCodeInput() {
  const [code, setCode] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(COUPON_STORAGE_KEY);
      if (saved) setCode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <input
      name="couponCode"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      placeholder="Mã giảm giá (vd: TISORA10)"
      className="w-full border border-line bg-surface px-3 py-3 text-sm outline-none focus:border-ink"
    />
  );
}
