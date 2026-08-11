"use client";

import { useMemo, useState } from "react";
import { saveProductAction } from "@/app/admin/actions";
import { formatVnd } from "@/lib/utils";

type Category = { id: string; name: string };

export type VariantFormRow = {
  id?: string;
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  compareAt?: number | null;
  costPrice?: number | null;
  wholesalePrice?: number | null;
  stock?: number;
  image?: string | null;
};

type ProductValues = {
  id?: string;
  name?: string;
  brand?: string | null;
  description?: string | null;
  categoryId?: string | null;
  images?: string[];
  published?: boolean;
  featured?: boolean;
  sapoProductId?: string | null;
  variants?: VariantFormRow[];
};

function emptyVariant(): VariantFormRow {
  return {
    sku: "",
    color: "",
    size: "",
    price: 0,
    compareAt: null,
    costPrice: null,
    wholesalePrice: null,
    stock: 0,
    image: "",
  };
}

function marginLabel(price: number, cost: number | null | undefined) {
  if (!cost || price <= 0) return "—";
  const profit = price - cost;
  const pct = Math.round((profit / price) * 1000) / 10;
  return `${formatVnd(profit)} (${pct}%)`;
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ProductValues;
}) {
  const [variants, setVariants] = useState<VariantFormRow[]>(
    product?.variants?.length ? product.variants : [emptyVariant()],
  );
  const [imagesText, setImagesText] = useState(
    (product?.images || []).join("\n"),
  );

  const galleryPreview = useMemo(
    () =>
      imagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [imagesText],
  );

  function updateVariant(index: number, patch: Partial<VariantFormRow>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  return (
    <form action={saveProductAction} className="space-y-4 text-sm">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
      <input type="hidden" name="imagesJson" value={JSON.stringify(galleryPreview)} />

      <input
        name="name"
        required
        defaultValue={product?.name || ""}
        placeholder="Tên sản phẩm"
        className="w-full border border-line px-3 py-2"
      />
      <input
        name="brand"
        defaultValue={product?.brand || ""}
        placeholder="Thương hiệu"
        className="w-full border border-line px-3 py-2"
      />
      <textarea
        name="description"
        defaultValue={product?.description || ""}
        placeholder="Mô tả"
        rows={4}
        className="w-full border border-line px-3 py-2"
      />
      <select
        name="categoryId"
        defaultValue={product?.categoryId || ""}
        className="w-full border border-line px-3 py-2"
      >
        <option value="">— Danh mục —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div>
        <label className="mb-1 block text-xs text-muted">
          URL ảnh (mỗi dòng một ảnh, hỗ trợ /api/media/... hoặc CDN)
        </label>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={3}
          className="w-full border border-line px-3 py-2 font-mono text-xs"
          placeholder="/api/media/...&#10;https://..."
        />
        {galleryPreview[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={galleryPreview[0]}
            alt=""
            className="mt-2 h-28 w-20 object-cover border border-line"
          />
        )}
      </div>

      <div className="space-y-3 border border-line p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Biến thể</h3>
          <button
            type="button"
            className="text-accent"
            onClick={() => setVariants((v) => [...v, emptyVariant()])}
          >
            + Thêm biến thể
          </button>
        </div>
        {variants.map((v, index) => (
          <div key={v.id || index} className="grid gap-2 border-t border-line pt-3 sm:grid-cols-3">
            <input
              value={v.sku || ""}
              onChange={(e) => updateVariant(index, { sku: e.target.value })}
              placeholder="SKU"
              className="border border-line px-2 py-1.5"
            />
            <input
              value={v.color || ""}
              onChange={(e) => updateVariant(index, { color: e.target.value })}
              placeholder="Màu"
              className="border border-line px-2 py-1.5"
            />
            <input
              value={v.size || ""}
              onChange={(e) => updateVariant(index, { size: e.target.value })}
              placeholder="Size"
              className="border border-line px-2 py-1.5"
            />
            <input
              type="number"
              value={v.price ?? 0}
              onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
              placeholder="Giá bán"
              className="border border-line px-2 py-1.5"
              required
            />
            <input
              type="number"
              value={v.costPrice ?? ""}
              onChange={(e) =>
                updateVariant(index, {
                  costPrice: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="Giá nhập"
              className="border border-line px-2 py-1.5"
            />
            <input
              type="number"
              value={v.wholesalePrice ?? ""}
              onChange={(e) =>
                updateVariant(index, {
                  wholesalePrice: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="Giá buôn"
              className="border border-line px-2 py-1.5"
            />
            <input
              type="number"
              value={v.compareAt ?? ""}
              onChange={(e) =>
                updateVariant(index, {
                  compareAt: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="Giá gốc"
              className="border border-line px-2 py-1.5"
            />
            <input
              type="number"
              value={v.stock ?? 0}
              onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
              placeholder="Tồn"
              className="border border-line px-2 py-1.5"
            />
            <div className="flex items-center justify-between gap-2 sm:col-span-1">
              <p className="text-xs text-muted">
                Lãi: {marginLabel(v.price || 0, v.costPrice)}
              </p>
              {variants.length > 1 && (
                <button
                  type="button"
                  className="text-xs text-sale"
                  onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2">
        <input name="published" type="checkbox" defaultChecked={product?.published ?? true} />
        Hiển thị
      </label>
      <label className="flex items-center gap-2">
        <input name="featured" type="checkbox" defaultChecked={product?.featured ?? false} />
        Nổi bật / Flash sale
      </label>
      {product?.sapoProductId && (
        <p className="text-xs text-muted">Sapo ID: {product.sapoProductId}</p>
      )}
      <button type="submit" className="bg-ink px-5 py-2 text-white">
        Lưu
      </button>
    </form>
  );
}
