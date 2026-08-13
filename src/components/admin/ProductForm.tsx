"use client";

import { useMemo, useState, useTransition } from "react";
import { saveProductAction, uploadProductImagesAction } from "@/app/admin/actions";
import { formatVnd } from "@/lib/utils";
import { ProductDescriptionEditor } from "@/components/admin/ProductDescriptionEditor";

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
  media = [],
}: {
  categories: Category[];
  product?: ProductValues;
  media?: { id: string; filename: string }[];
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
  const [imageMsg, setImageMsg] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [isUploading, startImageUpload] = useTransition();
  const [colors, setColors] = useState<string[]>(() => [
    ...new Set((product?.variants || []).map((variant) => variant.color?.trim()).filter(Boolean)),
  ] as string[]);
  const [sizes, setSizes] = useState<string[]>(() => [
    ...new Set((product?.variants || []).map((variant) => variant.size?.trim()).filter(Boolean)),
  ] as string[]);

  const galleryPreview = useMemo(
    () =>
      imagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [imagesText],
  );
  const variantRows = useMemo(
    () => variants.map((variant, originalIndex) => ({ variant, originalIndex }))
      .sort((a, b) => (a.variant.color || "").localeCompare(b.variant.color || "", "vi") || (a.variant.size || "").localeCompare(b.variant.size || "", "vi")),
    [variants],
  );
  function updateVariant(index: number, patch: Partial<VariantFormRow>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function setGallery(images: string[]) {
    setImagesText(images.join("\n"));
  }

  function uploadImages(files: File[], replaceIndex?: number) {
    if (!files.length) return;
    setImageMsg(null);
    startImageUpload(async () => {
      const data = new FormData();
      for (const file of files) data.append("images", file);
      const result = await uploadProductImagesAction(data);
      setImageMsg(result.message);
      if (!result.ok) return;

      if (replaceIndex == null) {
        setGallery([...galleryPreview, ...result.urls]);
      } else {
        const next = [...galleryPreview];
        next[replaceIndex] = result.urls[0];
        setGallery(next);
      }
    });
  }

  function syncVariants(nextColors: string[], nextSizes: string[]) {
    const colorValues = nextColors.filter(Boolean);
    const sizeValues = nextSizes.filter(Boolean);
    const matrixColors = colorValues.length ? colorValues : [""];
    const matrixSizes = sizeValues.length ? sizeValues : [""];

    setVariants((current) =>
      matrixColors.flatMap((color) =>
        matrixSizes.map((size) => {
          const existing = current.find(
            (variant) => (variant.color || "") === color && (variant.size || "") === size,
          );
          return existing || { ...emptyVariant(), color, size };
        }),
      ),
    );
  }

  function renameOption(type: "color" | "size", index: number, value: string) {
    const source = type === "color" ? colors : sizes;
    const previous = source[index];
    const next = source.map((item, itemIndex) => itemIndex === index ? value : item);
    if (type === "color") setColors(next);
    else setSizes(next);
    setVariants((current) => current.map((variant) =>
      (type === "color" ? variant.color : variant.size) === previous
        ? { ...variant, [type]: value }
        : variant,
    ));
  }

  function addOption(type: "color" | "size") {
    const source = type === "color" ? colors : sizes;
    const next = [...source, ""];
    if (type === "color") setColors(next);
    else setSizes(next);
  }

  function removeOption(type: "color" | "size", index: number) {
    const source = type === "color" ? colors : sizes;
    const next = source.filter((_, itemIndex) => itemIndex !== index);
    if (type === "color") {
      setColors(next);
      syncVariants(next, sizes);
    } else {
      setSizes(next);
      syncVariants(colors, next);
    }
  }

  function uploadColorImage(color: string, files: File[]) {
    if (!color || !files.length) return;
    setImageMsg(null);
    startImageUpload(async () => {
      const data = new FormData();
      data.append("images", files[0]);
      const result = await uploadProductImagesAction(data);
      setImageMsg(result.message);
      if (!result.ok) return;
      const image = result.urls[0];
      setVariants((current) => current.map((variant) =>
        variant.color === color ? { ...variant, image } : variant,
      ));
      if (!galleryPreview.includes(image)) setGallery([...galleryPreview, image]);
    });
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
    <form action={saveProductAction} className="product-editor pb-24 text-sm">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
      <input type="hidden" name="imagesJson" value={JSON.stringify(galleryPreview)} />

      <nav className="sticky top-0 z-30 mb-5 flex overflow-x-auto rounded-lg border border-line bg-white shadow-sm">
        {[
          ["basic", "Thông tin cơ bản"],
          ["details", "Thông tin chi tiết"],
          ["description", "Mô tả"],
          ["sales", "Thông tin bán hàng"],
          ["shipping", "Vận chuyển"],
          ["other", "Thông tin khác"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={() => setActiveSection(id)}
            className={`shrink-0 border-b-4 px-5 py-4 font-medium ${activeSection === id ? "border-[#ee4d2d] text-[#ee4d2d]" : "border-transparent hover:text-[#ee4d2d]"}`}
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="basic" className="scroll-mt-24 rounded-lg border border-line bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-6 text-2xl font-bold">Thông tin cơ bản</h2>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-bold">Hình ảnh sản phẩm</p>
            <p className="text-xs text-muted">
              Ảnh đầu tiên là ảnh đại diện. Tối đa 10 MB mỗi ảnh, 18 MB mỗi lần tải.
            </p>
          </div>
          <label className="cursor-pointer bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-accent">
            {isUploading ? "Đang tải..." : "+ Thêm ảnh"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              disabled={isUploading}
              className="sr-only"
              onChange={(event) => {
                uploadImages(Array.from(event.target.files || []));
                event.target.value = "";
              }}
            />
          </label>
        </div>

        {galleryPreview.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-3">
            {galleryPreview.map((image, index) => (
              <div key={`${image}-${index}`} className="w-[92px] overflow-hidden rounded border border-line bg-white">
                <div className="relative aspect-square bg-[#f5f2ee]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`Ảnh sản phẩm ${index + 1}`} className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-ink/80 px-2 py-1 text-[10px] font-semibold text-white">
                      * Ảnh bìa
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 border-t border-line text-center text-xs">
                  <label className="cursor-pointer border-r border-line px-2 py-2 text-accent hover:bg-accent-soft">
                    Thay ảnh
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={isUploading}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) uploadImages([file], index);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setGallery(galleryPreview.filter((_, imageIndex) => imageIndex !== index))}
                    className="px-2 py-2 text-sale hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <label className="mb-3 flex min-h-36 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-line bg-[#faf7f5] text-center hover:border-accent">
            <span className="text-2xl text-accent">+</span>
            <span className="mt-1 font-medium">Chọn ảnh từ máy</span>
            <span className="mt-1 text-xs text-muted">JPG, PNG, WebP hoặc GIF</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              disabled={isUploading}
              className="sr-only"
              onChange={(event) => {
                uploadImages(Array.from(event.target.files || []));
                event.target.value = "";
              }}
            />
          </label>
        )}

        {imageMsg && (
          <p className={`mb-3 text-xs ${imageMsg.startsWith("Đã tải") ? "text-green-700" : "text-sale"}`} role="status">
            {imageMsg}
          </p>
        )}

        <label className="mb-1 block text-xs text-muted">
          Hoặc nhập URL ảnh (mỗi dòng một ảnh)
        </label>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={3}
          className="w-full border border-line px-3 py-2 font-mono text-xs"
          placeholder="/api/media/...&#10;https://..."
        />
      </div>

        <label className="mt-6 block space-y-2 font-bold">
          <span><span className="text-[#ee4d2d]">*</span> Tên sản phẩm</span>
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={product?.name || ""}
            placeholder="Tên sản phẩm"
            className="w-full rounded border border-line px-4 py-3 font-normal"
          />
        </label>
      </section>

      <section id="details" className="mt-5 scroll-mt-24 rounded-lg border border-line bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-6 text-2xl font-bold">Thông tin chi tiết</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 font-bold">
            <span>Thương hiệu</span>
            <input name="brand" defaultValue={product?.brand || ""} placeholder="Thương hiệu" className="w-full rounded border border-line px-3 py-2.5 font-normal" />
          </label>
          <label className="space-y-2 font-bold">
            <span>Danh mục</span>
            <select name="categoryId" defaultValue={product?.categoryId || ""} className="w-full rounded border border-line px-3 py-2.5 font-normal">
              <option value="">— Danh mục —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section id="description" className="mt-5 scroll-mt-24 rounded-lg border border-line bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-6 text-2xl font-bold">Mô tả</h2>
        <div className="space-y-2">
          <p className="font-bold"><span className="text-[#ee4d2d]">*</span> Mô tả sản phẩm</p>
          <ProductDescriptionEditor value={product?.description || ""} media={media} />
        </div>
      </section>

      <section id="sales" className="mt-5 scroll-mt-24 rounded-lg border border-line bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-6 text-2xl font-bold">Thông tin bán hàng</h2>
        <div className="mb-5 rounded-md bg-[#f7f7f7] p-5">
          <h3 className="mb-4 font-bold"><span className="text-[#ee4d2d]">●</span> Phân loại hàng</h3>
          <div className="space-y-4">
            <div className="rounded border border-line bg-white p-4">
              <label className="mb-3 block max-w-sm"><span className="mb-1 block font-medium">Phân loại 1</span><input value="Màu sắc" readOnly className="w-full rounded border border-line bg-white px-3 py-2" /></label>
              <p className="mb-2 font-medium">Tùy chọn <span className="text-[#ee4d2d]">●</span></p>
              <div className="grid gap-3 md:grid-cols-2">
                {colors.map((color, index) => (
                  <div key={`color-${index}`} className="flex min-w-0">
                    <input value={color} onChange={(event) => renameOption("color", index, event.target.value)} onBlur={() => syncVariants(colors, sizes)} placeholder="Nhập màu" className="min-w-0 flex-1 rounded-l border border-line px-3 py-2" />
                    <label className="cursor-pointer border-y border-line px-3 py-2 text-[#ee4d2d] hover:bg-[#fff2ef]">
                      Ảnh
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { uploadColorImage(color, Array.from(event.target.files || [])); event.target.value = ""; }} />
                    </label>
                    <button type="button" onClick={() => removeOption("color", index)} className="rounded-r border border-line px-3 text-sale">×</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => addOption("color")} className="mt-3 font-medium text-[#ee4d2d]">+ Thêm màu</button>
            </div>
            <div className="rounded border border-line bg-white p-4">
              <label className="mb-3 block max-w-sm"><span className="mb-1 block font-medium">Phân loại 2</span><input value="Kích thước" readOnly className="w-full rounded border border-line bg-white px-3 py-2" /></label>
              <p className="mb-2 font-medium">Tùy chọn <span className="text-[#ee4d2d]">●</span></p>
              <div className="grid gap-3 md:grid-cols-2">
                {sizes.map((size, index) => (
                  <div key={`size-${index}`} className="flex min-w-0">
                    <input value={size} onChange={(event) => renameOption("size", index, event.target.value)} onBlur={() => syncVariants(colors, sizes)} placeholder="Nhập kích thước" className="min-w-0 flex-1 rounded-l border border-line px-3 py-2" />
                    <button type="button" onClick={() => removeOption("size", index)} className="rounded-r border border-line px-3 text-sale">×</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => addOption("size")} className="mt-3 font-medium text-[#ee4d2d]">+ Thêm kích thước</button>
            </div>
          </div>
        </div>

      <div className="space-y-3 rounded border border-[#f4a394] bg-[#fff7f5] p-4">
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

      <div className="mt-5 rounded border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold">Danh sách phân loại hàng</h3>
            <p className="mt-1 text-xs text-muted">Kéo thanh phía dưới sang phải để chỉnh đầy đủ giá, kho và SKU.</p>
          </div>
          <button type="button" className="shrink-0 rounded bg-[#f5a091] px-4 py-2 font-semibold text-white" onClick={applyBulkToAll}>
            Áp dụng cho tất cả phân loại
          </button>
        </div>

        <div className="overflow-x-auto rounded border border-line [scrollbar-color:#ee4d2d_#eee] [scrollbar-width:thin]">
          <table className="min-w-[1480px] table-fixed border-collapse text-left">
            <thead className="bg-[#f7f7f7]">
              <tr>
                {[
                  ["Màu sắc", "150px"], ["Kích thước", "120px"],
                  ["Giá gốc", "160px"], ["Giá bán", "160px"], ["Giá nhập", "160px"],
                  ["Giá buôn", "160px"], ["Kho hàng", "150px"], ["SKU phân loại", "180px"],
                  ["Lãi / SP", "160px"], ["", "70px"],
                ].map(([label, width]) => <th key={label || "actions"} style={{ width }} className="border-r border-line px-3 py-3 font-medium last:border-r-0">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {variantRows.map(({ variant, originalIndex }, rowIndex) => {
                const firstOfColor = rowIndex === 0 || variantRows[rowIndex - 1]?.variant.color !== variant.color;
                return (
                  <tr key={variant.id || `${variant.color}-${variant.size}-${originalIndex}`} className="border-t border-line align-middle">
                    {firstOfColor && (
                      <td rowSpan={variantRows.filter((item) => item.variant.color === variant.color).length} className="border-r border-line px-3 py-3 text-center align-middle">
                        <p className="mb-3 font-medium">{variant.color || "Mặc định"}</p>
                        <label className="relative mx-auto flex size-14 cursor-pointer items-center justify-center overflow-hidden rounded border border-line bg-[#fafafa] text-center text-[10px] text-muted hover:border-[#ee4d2d]">
                          {variant.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={variant.image} alt="" className="h-full w-full object-cover" />
                          ) : "Tải ảnh"}
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { uploadColorImage(variant.color || "", Array.from(event.target.files || [])); event.target.value = ""; }} />
                        </label>
                      </td>
                    )}
                    <td className="border-r border-line px-3 py-3">{variant.size || "Freesize"}</td>
                    <td className="border-r border-line p-2"><input aria-label="Giá gốc" type="number" value={variant.compareAt ?? ""} onChange={(event) => updateVariant(originalIndex, { compareAt: event.target.value === "" ? null : Number(event.target.value) })} className="w-full rounded border border-line px-3 py-2" /></td>
                    <td className="border-r border-line p-2"><input aria-label="Giá bán" required type="number" value={variant.price ?? 0} onChange={(event) => updateVariant(originalIndex, { price: Number(event.target.value) })} className="w-full rounded border border-line px-3 py-2" /></td>
                    <td className="border-r border-line p-2"><input aria-label="Giá nhập" type="number" value={variant.costPrice ?? ""} onChange={(event) => updateVariant(originalIndex, { costPrice: event.target.value === "" ? null : Number(event.target.value) })} className="w-full rounded border border-line px-3 py-2" /></td>
                    <td className="border-r border-line p-2"><input aria-label="Giá buôn" type="number" value={variant.wholesalePrice ?? ""} onChange={(event) => updateVariant(originalIndex, { wholesalePrice: event.target.value === "" ? null : Number(event.target.value) })} className="w-full rounded border border-line px-3 py-2" /></td>
                    <td className="border-r border-line p-2"><input aria-label="Tồn kho" type="number" value={variant.stock ?? 0} onChange={(event) => updateVariant(originalIndex, { stock: Number(event.target.value) })} className="w-full rounded border border-line px-3 py-2" /></td>
                    <td className="border-r border-line p-2"><input aria-label="SKU" value={variant.sku || ""} onChange={(event) => updateVariant(originalIndex, { sku: event.target.value })} className="w-full rounded border border-line px-3 py-2" /></td>
                    <td className="border-r border-line px-3 py-3 text-xs"><strong>{marginLabel(variant.price || 0, variant.costPrice)}</strong></td>
                    <td className="px-2 text-center">{variants.length > 1 && <button type="button" onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== originalIndex))} className="text-xs text-sale">Xóa</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

        <div className="mt-6 rounded border border-line p-4">
          <h3 className="font-bold"><span className="text-[#ee4d2d]">*</span> Bảng quy đổi kích cỡ</h3>
          <p className="mt-2 text-xs text-muted">Bảng tham khảo nhanh theo kích thước sản phẩm hiện có.</p>
          <div className="mt-4 overflow-hidden rounded border border-line">
            <div className="grid grid-cols-3 bg-[#f7f7f7] px-4 py-3 font-medium"><span>Size</span><span>Vòng ngực (cm)</span><span>Eo (cm)</span></div>
            {(sizes.length ? sizes : ["S", "M"]).map((size, index) => (
              <div key={size} className="grid grid-cols-3 border-t border-line px-4 py-3"><span>{size}</span><span>{86 + index * 7}</span><span>{68 + index * 7}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="shipping" className="mt-5 scroll-mt-24 rounded-lg border border-line bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-2xl font-bold">Vận chuyển</h2>
        <p className="mt-2 text-muted">Sản phẩm áp dụng cấu hình vận chuyển mặc định của cửa hàng.</p>
      </section>

      <section id="other" className="mt-5 scroll-mt-24 rounded-lg border border-line bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-2xl font-bold">Thông tin khác</h2>

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
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,.08)] backdrop-blur md:left-60">
        <div className="ml-auto flex max-w-6xl items-center justify-end gap-3">
          <button type="button" onClick={() => history.back()} className="rounded border border-line px-6 py-2.5 font-semibold">Hủy</button>
          <button type="submit" className="rounded bg-[#ee4d2d] px-7 py-2.5 font-bold text-white hover:bg-[#d93f22]">
            {product?.id ? "Cập nhật" : "Thêm sản phẩm"}
          </button>
        </div>
      </div>
    </form>
  );
}
