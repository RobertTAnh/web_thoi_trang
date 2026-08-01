import { saveProductAction } from "@/app/admin/actions";

type Category = { id: string; name: string };

type ProductValues = {
  id?: string;
  name?: string;
  brand?: string | null;
  description?: string | null;
  categoryId?: string | null;
  image?: string;
  published?: boolean;
  featured?: boolean;
  price?: number;
  compareAt?: number;
  stock?: number;
  color?: string;
  size?: string;
  sapoProductId?: string | null;
};

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ProductValues;
}) {
  return (
    <form action={saveProductAction} className="space-y-4 text-sm">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
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
      <input
        name="image"
        defaultValue={product?.image || ""}
        placeholder="URL ảnh"
        className="w-full border border-line px-3 py-2"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="price"
          type="number"
          required
          defaultValue={product?.price || 0}
          placeholder="Giá"
          className="border border-line px-3 py-2"
        />
        <input
          name="compareAt"
          type="number"
          defaultValue={product?.compareAt || 0}
          placeholder="Giá gốc"
          className="border border-line px-3 py-2"
        />
        <input
          name="stock"
          type="number"
          defaultValue={product?.stock || 0}
          placeholder="Tồn kho"
          className="border border-line px-3 py-2"
        />
        <input
          name="color"
          defaultValue={product?.color || ""}
          placeholder="Màu"
          className="border border-line px-3 py-2"
        />
        <input
          name="size"
          defaultValue={product?.size || ""}
          placeholder="Size"
          className="border border-line px-3 py-2"
        />
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
