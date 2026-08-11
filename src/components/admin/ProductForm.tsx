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

type BulkFields = {
  compareAt: string;
  price: string;
  costPrice: string;
  wholesalePrice: string;
  stock: string;
};

function bulkFromVariant(v?: VariantFormRow): BulkFields {
  return {
    compareAt: v?.compareAt != null ? String(v.compareAt) : "",
    price: v?.price != null ? String(v.price) : "",
    costPrice: v?.costPrice != null ? String(v.costPrice) : "",
    wholesalePrice: v?.wholesalePrice != null ? String(v.wholesalePrice) : "",
    stock: v?.stock != null ? String(v.stock) : "",
  };
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
  const [bulk, setBulk] = useState<BulkFields>(() =>
    bulkFromVariant(product?.variants?.[0]),
  );
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

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

  function applyBulkToAll() {
    const patch: Partial<VariantFormRow> = {};
    if (bulk.compareAt !== "") patch.compareAt = Number(bulk.compareAt);
    if (bulk.price !== "") patch.price = Number(bulk.price);
    if (bulk.costPrice !== "") patch.costPrice = Number(bulk.costPrice);
    if (bulk.wholesalePrice !== "") patch.wholesalePrice = Number(bulk.wholesalePrice);
    if (bulk.stock !== "") patch.stock = Number(bulk.stock);

    if (!Object.keys(patch).length) {
      setBulkMsg("Điền ít nhất 1 ô rồi bấm Áp dụng.");
      return;
    }

    setVariants((prev) => prev.map((v) => ({ ...v, ...patch })));
    setBulkMsg(`Đã áp dụng cho ${variants.length} biến thể. Sửa lệch ở từng dòng bên dưới nếu cần.`);
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

      <div className="space-y-3 border-2 border-accent/40 bg-accent-soft/30 p-4">
        <div>
          <h3 className="font-medium">Giá &amp; tồn — áp dụng tất cả biến thể</h3>
          <p className="mt-1 text-xs text-muted">
            Sửa ở đây rồi bấm Áp dụng để cập nhật mọi biến thể. Ô trống = giữ nguyên.
            Biến thể lệch giá sửa riêng bên dưới.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <label className="block space-y-1">
            <span className="text-xs text-muted">Giá gốc</span>
            <input
              type="number"
              value={bulk.compareAt}
              onChange={(e) => setBulk((b) => ({ ...b, compareAt: e.target.value }))}
              className="w-full border border-line bg-white px-2 py-1.5"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Giá bán (web)</span>
            <input
              type="number"
              value={bulk.price}
              onChange={(e) => setBulk((b) => ({ ...b, price: e.target.value }))}
              className="w-full border border-line bg-white px-2 py-1.5"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Giá nhập</span>
            <input
              type="number"
              value={bulk.costPrice}
              onChange={(e) => setBulk((b) => ({ ...b, costPrice: e.target.value }))}
              className="w-full border border-line bg-white px-2 py-1.5"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Giá buôn</span>
            <input
              type="number"
              value={bulk.wholesalePrice}
              onChange={(e) => setBulk((b) => ({ ...b, wholesalePrice: e.target.value }))}
              className="w-full border border-line bg-white px-2 py-1.5"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Tồn kho</span>
            <input
              type="number"
              value={bulk.stock}
              onChange={(e) => setBulk((b) => ({ ...b, stock: e.target.value }))}
              className="w-full border border-line bg-white px-2 py-1.5"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={applyBulkToAll}
            className="bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
          >
            Áp dụng cho {variants.length} biến thể
          </button>
          {bulk.price && bulk.costPrice && (
            <p className="text-xs text-muted">
              Lãi ước tính:{" "}
              <strong>{marginLabel(Number(bulk.price), Number(bulk.costPrice))}</strong>
            </p>
          )}
          {bulkMsg && <p className="text-xs text-accent">{bulkMsg}</p>}
        </div>
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
        <p className="text-xs text-muted">
          Mỗi khối = 1 biến thể (màu + size). Sửa lệch sau khi áp dụng khối chính.
        </p>
        {variants.map((v, index) => (
          <div key={v.id || index} className="space-y-3 border-t border-line pt-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted">
                #{index + 1}
                {v.color || v.size
                  ? ` · ${[v.color, v.size].filter(Boolean).join(" / ")}`
                  : ""}
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

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-1">
                <span className="text-xs text-muted">SKU</span>
                <input
                  value={v.sku || ""}
                  onChange={(e) => updateVariant(index, { sku: e.target.value })}
                  className="w-full border border-line px-2 py-1.5"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted">Màu</span>
                <input
                  value={v.color || ""}
                  onChange={(e) => updateVariant(index, { color: e.target.value })}
                  className="w-full border border-line px-2 py-1.5"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted">Size</span>
                <input
                  value={v.size || ""}
                  onChange={(e) => updateVariant(index, { size: e.target.value })}
                  className="w-full border border-line px-2 py-1.5"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-1">
                <span className="text-xs text-muted">Giá gốc (gạch ngang trên web)</span>
                <input
                  type="number"
                  value={v.compareAt ?? ""}
                  onChange={(e) =>
                    updateVariant(index, {
                      compareAt: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="w-full border border-line px-2 py-1.5"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted">Giá bán (hiển thị web)</span>
                <input
                  type="number"
                  value={v.price ?? 0}
                  onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                  className="w-full border border-line px-2 py-1.5"
                  required
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted">Giá nhập</span>
                <input
                  type="number"
                  value={v.costPrice ?? ""}
                  onChange={(e) =>
                    updateVariant(index, {
                      costPrice: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="w-full border border-line px-2 py-1.5"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-1">
                <span className="text-xs text-muted">Giá buôn</span>
                <input
                  type="number"
                  value={v.wholesalePrice ?? ""}
                  onChange={(e) =>
                    updateVariant(index, {
                      wholesalePrice: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="w-full border border-line px-2 py-1.5"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-muted">Tồn kho</span>
                <input
                  type="number"
                  value={v.stock ?? 0}
                  onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                  className="w-full border border-line px-2 py-1.5"
                />
              </label>
              <div className="flex items-end">
                <p className="w-full border border-dashed border-line bg-[#faf7f5] px-2 py-1.5 text-xs">
                  Lãi / SP: <strong>{marginLabel(v.price || 0, v.costPrice)}</strong>
                </p>
              </div>
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
