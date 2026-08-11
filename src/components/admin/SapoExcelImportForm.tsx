"use client";

import { useState, useTransition } from "react";
import { importSapoExcelAction } from "@/app/admin/actions";

export function SapoExcelImportForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        startTransition(async () => {
          setMessage(null);
          const result = await importSapoExcelAction(fd);
          if (result.ok) {
            setMessage(
              `OK: ${result.products} SP, ${result.variants} biến thể, ${result.images} ảnh mới` +
                (result.errors ? ` (${result.errors} lỗi)` : ""),
            );
            form.reset();
          } else {
            setMessage(result.message);
          }
        });
      }}
    >
      <input
        type="file"
        name="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        required
        className="max-w-[220px] text-xs"
      />
      <button
        type="submit"
        disabled={pending}
        className="border border-ink px-4 py-2 text-sm disabled:opacity-50"
      >
        {pending ? "Đang import…" : "Import Excel Sapo"}
      </button>
      {message && <p className="w-full text-xs text-muted">{message}</p>}
    </form>
  );
}
