"use client";

import { useState, useTransition } from "react";
import { createApiKeyAction } from "@/app/admin/actions";

export function ApiKeyForm() {
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-3 border border-line bg-white p-5 text-sm">
      <h2 className="font-display text-2xl">Tạo API key</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const key = await createApiKeyAction(fd);
            setRawKey(key);
            e.currentTarget.reset();
          });
        }}
        className="space-y-3"
      >
        <input
          name="name"
          required
          placeholder="Tên key (vd: Mobile app)"
          className="w-full border border-line px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink py-2 text-white disabled:opacity-50"
        >
          {pending ? "Đang tạo..." : "Tạo key"}
        </button>
      </form>
      {rawKey && (
        <div className="border border-accent/30 bg-accent-soft/40 p-3">
          <p className="text-xs text-muted">Copy ngay — chỉ hiện một lần:</p>
          <code className="mt-1 block break-all text-xs">{rawKey}</code>
        </div>
      )}
    </div>
  );
}
