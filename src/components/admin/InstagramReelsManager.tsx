"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInstagramReelAction, saveInstagramReelAction } from "@/app/admin/actions";

type Reel = { id: string; title: string | null; url: string; sortOrder: number; active: boolean };

export function InstagramReelsManager({ reels }: { reels: Reel[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Reel | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function remove(reel: Reel) {
    if (!window.confirm(`Xóa Reel “${reel.title || reel.url}”?`)) return;
    startTransition(async () => {
      const result = await deleteInstagramReelAction(reel.id);
      setMessage(result.message);
      if (result.ok) {
        if (editing?.id === reel.id) setEditing(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="font-display text-4xl">Instagram Reels</h1>
        <p className="mt-2 text-sm text-muted">Quản lý các Reel hiển thị trên trang chủ.</p>
        {message && <p className="mt-3 text-sm text-accent" role="status">{message}</p>}
        <div className="mt-6 space-y-3">
          {reels.map((reel) => (
            <div key={reel.id} className="flex flex-wrap items-center gap-3 border border-line bg-white p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{reel.title || "Instagram Reel"}</p>
                  <span className={`px-2 py-0.5 text-[10px] ${reel.active ? "bg-green-100 text-green-700" : "bg-line text-muted"}`}>
                    {reel.active ? "Đang hiển thị" : "Đã ẩn"}
                  </span>
                </div>
                <a href={reel.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-accent">
                  {reel.url}
                </a>
                <p className="mt-1 text-xs text-muted">Thứ tự: {reel.sortOrder}</p>
              </div>
              <button type="button" onClick={() => setEditing(reel)} className="border border-ink px-3 py-1.5 text-xs hover:bg-ink hover:text-white">Sửa</button>
              <button type="button" onClick={() => remove(reel)} disabled={pending} className="border border-sale px-3 py-1.5 text-xs text-sale hover:bg-sale hover:text-white disabled:opacity-40">Xóa</button>
            </div>
          ))}
          {!reels.length && <div className="border border-dashed border-line bg-white p-8 text-center text-sm text-muted">Chưa có Reel nào.</div>}
        </div>
      </div>

      <form key={editing?.id || "new"} action={saveInstagramReelAction} className="h-fit space-y-3 border border-line bg-white p-5 text-sm lg:sticky lg:top-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{editing ? "Sửa Reel" : "Thêm Reel"}</h2>
          {editing && <button type="button" onClick={() => setEditing(null)} className="text-xs text-muted">Hủy</button>}
        </div>
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <label className="block space-y-1">
          <span className="text-xs text-muted">Tên ghi chú</span>
          <input name="title" defaultValue={editing?.title || ""} placeholder="Ví dụ: Váy dự tiệc trắng" className="w-full border border-line px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted">Link Instagram Reel</span>
          <input name="url" type="url" required defaultValue={editing?.url || ""} placeholder="https://www.instagram.com/reel/.../" className="w-full border border-line px-3 py-2" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted">Thứ tự</span>
          <input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? reels.length} className="w-full border border-line px-3 py-2" />
        </label>
        <label className="flex items-center gap-2">
          <input name="active" type="checkbox" defaultChecked={editing?.active ?? true} />
          Hiển thị trên trang chủ
        </label>
        <button type="submit" className="w-full bg-ink py-2 text-white hover:bg-accent">{editing ? "Lưu thay đổi" : "Thêm Reel"}</button>
      </form>
    </div>
  );
}
