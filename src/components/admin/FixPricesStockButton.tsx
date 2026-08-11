"use client";

import { useState, useTransition } from "react";
import { fixCompareAtAndStockAction } from "@/app/admin/actions";

export function FixPricesStockButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        className="border border-accent px-4 py-2 text-sm text-accent disabled:opacity-50"
        onClick={() => {
          if (
            !confirm(
              "Gán giá gốc = giá bán hiện tại, giữ giá bán = giá gốc, set tồn kho tất cả = 200?",
            )
          ) {
            return;
          }
          startTransition(async () => {
            const result = await fixCompareAtAndStockAction();
            setMessage(`Đã cập nhật ${result.updated} biến thể.`);
          });
        }}
      >
        {pending ? "Đang cập nhật…" : "Giá gốc + tồn 200"}
      </button>
      {message && <p className="text-xs text-muted">{message}</p>}
    </div>
  );
}
