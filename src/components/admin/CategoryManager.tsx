"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction, saveCategoryAction } from "@/app/admin/actions";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
  childCount: number;
};

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [message, setMessage] = useState("");
  const [isDeleting, startDelete] = useTransition();

  function remove(category: CategoryRow) {
    if (!window.confirm(`Xóa danh mục “${category.name}”?`)) return;
    setMessage("");
    startDelete(async () => {
      const result = await deleteCategoryAction(category.id);
      setMessage(result.message);
      if (result.ok) {
        if (editing?.id === category.id) setEditing(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-4xl">Danh mục</h1>
        {message && (
          <p className={`mt-4 text-sm ${message.startsWith("Đã xóa") ? "text-green-700" : "text-sale"}`} role="status">
            {message}
          </p>
        )}
        <div className="mt-6 space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-4 border border-line bg-white p-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-line/40">
                {category.image && (
                  <Image src={category.image} alt="" fill className="object-cover" sizes="48px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{category.name}</p>
                <p className="truncate text-xs text-muted">
                  /{category.slug} · {category.productCount} SP
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(category);
                    setMessage("");
                  }}
                  className="border border-ink px-3 py-1.5 text-xs hover:bg-ink hover:text-white"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => remove(category)}
                  disabled={isDeleting}
                  className="border border-sale px-3 py-1.5 text-xs text-sale hover:bg-sale hover:text-white disabled:opacity-40"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        key={editing?.id || "new"}
        action={saveCategoryAction}
        className="h-fit space-y-3 border border-line bg-white p-5 text-sm lg:sticky lg:top-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl">
            {editing ? "Sửa danh mục" : "Thêm danh mục"}
          </h2>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="text-xs text-muted hover:text-ink">
              Hủy
            </button>
          )}
        </div>
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <input
          name="name"
          required
          defaultValue={editing?.name || ""}
          placeholder="Tên"
          className="w-full border border-line px-3 py-2"
        />
        <input
          name="slug"
          defaultValue={editing?.slug || ""}
          placeholder="slug (tùy chọn)"
          className="w-full border border-line px-3 py-2"
        />
        <input
          name="image"
          defaultValue={editing?.image || ""}
          placeholder="URL ảnh"
          className="w-full border border-line px-3 py-2"
        />
        <button type="submit" className="w-full bg-ink py-2 text-white hover:bg-accent">
          {editing ? "Lưu thay đổi" : "Thêm danh mục"}
        </button>
      </form>
    </div>
  );
}
