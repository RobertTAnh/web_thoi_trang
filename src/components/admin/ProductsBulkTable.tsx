"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkDeleteProductsAction } from "@/app/admin/actions";
import { formatVnd } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  category: string | null;
  minPrice: number;
  cost: number | null;
  stock: number;
  variantCount: number;
  sapoProductId: string | null;
};

type SortKey = "name" | "category" | "price" | "stock" | "sapo";
type SortDirection = "asc" | "desc";

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });

export function ProductsBulkTable({ products }: { products: AdminProductRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: "name",
    direction: "asc",
  });
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const sortedProducts = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...products].sort((a, b) => {
      if (sort.key === "price") return (a.minPrice - b.minPrice) * direction;
      if (sort.key === "stock") return (a.stock - b.stock) * direction;

      const aValue =
        sort.key === "name"
          ? a.name
          : sort.key === "category"
            ? a.category || ""
            : a.sapoProductId || "Local";
      const bValue =
        sort.key === "name"
          ? b.name
          : sort.key === "category"
            ? b.category || ""
            : b.sapoProductId || "Local";
      return collator.compare(aValue, bValue) * direction;
    });
  }, [products, sort]);

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleSort(key: SortKey) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function sortLabel(key: SortKey) {
    if (sort.key !== key) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  }

  function toggleProduct(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setMessage("");
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((product) => product.id)));
    setMessage("");
  }

  function deleteSelected() {
    if (!selected.size) return;
    const confirmed = window.confirm(
      `Xóa vĩnh viễn ${selected.size} sản phẩm đã chọn? Thao tác này không thể hoàn tác.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await bulkDeleteProductsAction([...selected]);
      setMessage(result.message);
      if (result.ok) {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  const sortableHeader = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="inline-flex items-center gap-1.5 font-semibold hover:text-accent"
      aria-label={`Sắp xếp ${label} ${sort.key === key && sort.direction === "asc" ? "giảm dần" : "tăng dần"}`}
    >
      {label}
      <span className={sort.key === key ? "text-accent" : "text-muted"}>{sortLabel(key)}</span>
    </button>
  );

  return (
    <div className="mt-6 overflow-hidden border border-line bg-white">
      <div className="flex min-h-14 flex-wrap items-center gap-3 border-b border-line bg-[#faf7f5] px-4 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 accent-[#e31c23]"
          />
          Chọn tất cả
        </label>
        <span className="text-xs text-muted">Đã chọn {selected.size}/{products.length}</span>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={!selected.size || isPending}
          className="ml-auto border border-[#d62828] px-4 py-2 text-xs font-semibold text-[#d62828] transition hover:bg-[#d62828] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Đang xóa..." : `Xóa sản phẩm đã chọn${selected.size ? ` (${selected.size})` : ""}`}
        </button>
        {message && (
          <p className={`w-full text-xs ${message.startsWith("Đã xóa") ? "text-green-700" : "text-[#d62828]"}`} role="status">
            {message}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-[#faf7f5]">
            <tr>
              <th className="w-10 px-4 py-3">
                <span className="sr-only">Chọn</span>
              </th>
              <th className="px-4 py-3">{sortableHeader("SP", "name")}</th>
              <th className="px-4 py-3">{sortableHeader("Danh mục", "category")}</th>
              <th className="px-4 py-3">{sortableHeader("Giá / Nhập", "price")}</th>
              <th className="px-4 py-3">{sortableHeader("Tồn", "stock")}</th>
              <th className="px-4 py-3">{sortableHeader("Sapo", "sapo")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr
                key={product.id}
                className={`border-b border-line transition ${selected.has(product.id) ? "bg-[#fff5f3]" : "hover:bg-[#fffdfb]"}`}
              >
                <td className="px-4 py-3 align-middle">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    aria-label={`Chọn ${product.name}`}
                    className="h-4 w-4 accent-[#e31c23]"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-line/40">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized={product.image.startsWith("/api/media/")}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted">
                        {product.variantCount} biến thể · {product.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{product.category || "—"}</td>
                <td className="px-4 py-3">
                  <div>{formatVnd(product.minPrice)}</div>
                  {product.cost != null && (
                    <div className="text-xs text-muted">Nhập {formatVnd(product.cost)}</div>
                  )}
                </td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3 text-xs">
                  {product.sapoProductId ? `#${product.sapoProductId}` : "Local"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="text-accent">
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
