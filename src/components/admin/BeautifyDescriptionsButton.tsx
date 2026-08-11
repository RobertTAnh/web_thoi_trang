"use client";

import { useState, useTransition } from "react";
import { beautifyAllDescriptionsAction } from "@/app/admin/actions";

export function BeautifyDescriptionsButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        className="border border-ink px-4 py-2 text-sm disabled:opacity-50"
        onClick={() => {
          startTransition(async () => {
            const result = await beautifyAllDescriptionsAction();
            setMessage(
              `Đã chuẩn hóa ${result.updated}/${result.total} mô tả sản phẩm.`,
            );
          });
        }}
      >
        {pending ? "Đang xử lý…" : "Làm đẹp mô tả HTML"}
      </button>
      {message && <p className="text-xs text-muted">{message}</p>}
    </div>
  );
}
