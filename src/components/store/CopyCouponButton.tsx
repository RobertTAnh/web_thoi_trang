"use client";

import { useState } from "react";

export function CopyCouponButton({ code }: { code: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="mt-3 text-[12px] font-semibold text-ink underline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? "Đã sao chép!" : "Sao chép"}
    </button>
  );
}
