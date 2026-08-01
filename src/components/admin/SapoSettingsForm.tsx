"use client";

import { useState, useTransition } from "react";
import {
  saveSapoSettingsAction,
  syncProductsAction,
  testSapoConnectionAction,
} from "@/app/admin/actions";

export function SapoSettingsForm({
  storeUrl,
}: {
  storeUrl: string;
  hasToken: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4 border border-line bg-white p-5 text-sm">
      <form
        action={saveSapoSettingsAction}
        className="space-y-3"
      >
        <input
          name="storeUrl"
          defaultValue={storeUrl}
          placeholder="https://your-store.mysapo.net"
          className="w-full border border-line px-3 py-2"
        />
        <input
          name="token"
          type="password"
          placeholder="Access token (để trống nếu giữ nguyên)"
          className="w-full border border-line px-3 py-2"
        />
        <button type="submit" className="bg-ink px-4 py-2 text-white">
          Lưu cấu hình
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="border border-ink px-4 py-2"
          onClick={() =>
            start(async () => {
              const res = await testSapoConnectionAction();
              setMessage(res.message);
            })
          }
        >
          Test kết nối
        </button>
        <button
          type="button"
          disabled={pending}
          className="border border-ink px-4 py-2"
          onClick={() =>
            start(async () => {
              try {
                await syncProductsAction();
                setMessage("Sync sản phẩm thành công");
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Sync thất bại");
              }
            })
          }
        >
          Sync sản phẩm ngay
        </button>
      </div>
      {message && <p className="text-muted">{message}</p>}
      <div className="border-t border-line pt-4 text-xs text-muted">
        <p>Webhook URL (đăng ký trên Sapo):</p>
        <code className="mt-1 block break-all">
          {typeof window !== "undefined"
            ? `${window.location.origin}/api/webhooks/sapo`
            : "/api/webhooks/sapo"}
        </code>
        <p className="mt-2">
          Topics gợi ý: products/create, products/update, orders/cancelled
        </p>
      </div>
    </div>
  );
}
