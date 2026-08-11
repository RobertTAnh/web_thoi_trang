import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";

function marginPct(price: number, cost: number | null | undefined) {
  if (cost == null || price <= 0) return null;
  return Math.round(((price - cost) / price) * 1000) / 10;
}

export default async function AdminCrmPage() {
  const [variants, completedItems] = await Promise.all([
    prisma.productVariant.findMany({
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ product: { name: "asc" } }, { sku: "asc" }],
    }),
    prisma.orderItem.findMany({
      where: { order: { status: "COMPLETED" } },
      select: { price: true, costPrice: true, quantity: true },
    }),
  ]);

  let inventoryProfit = 0;
  let inventoryCost = 0;
  let inventoryRetail = 0;
  for (const v of variants) {
    inventoryRetail += v.price * v.stock;
    if (v.costPrice != null) {
      inventoryCost += v.costPrice * v.stock;
      inventoryProfit += (v.price - v.costPrice) * v.stock;
    }
  }

  let realizedRevenue = 0;
  let realizedProfit = 0;
  for (const item of completedItems) {
    realizedRevenue += item.price * item.quantity;
    if (item.costPrice != null) {
      realizedProfit += (item.price - item.costPrice) * item.quantity;
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl">CRM / Lợi nhuận</h1>
      <p className="mt-2 text-sm text-muted">
        So sánh giá bán và giá nhập theo biến thể; lãi thực lấy từ đơn hoàn thành.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border border-line bg-white p-5">
          <p className="text-xs tracking-wide text-muted uppercase">Giá trị tồn (bán)</p>
          <p className="mt-2 font-display text-3xl">{formatVnd(inventoryRetail)}</p>
        </div>
        <div className="border border-line bg-white p-5">
          <p className="text-xs tracking-wide text-muted uppercase">Giá vốn tồn</p>
          <p className="mt-2 font-display text-3xl">{formatVnd(inventoryCost)}</p>
        </div>
        <div className="border border-line bg-white p-5">
          <p className="text-xs tracking-wide text-muted uppercase">Lãi ước tính tồn</p>
          <p className="mt-2 font-display text-3xl">{formatVnd(inventoryProfit)}</p>
        </div>
        <div className="border border-line bg-white p-5">
          <p className="text-xs tracking-wide text-muted uppercase">Lãi đơn hoàn thành</p>
          <p className="mt-2 font-display text-3xl">{formatVnd(realizedProfit)}</p>
          <p className="mt-1 text-xs text-muted">DT {formatVnd(realizedRevenue)}</p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-[#faf7f5]">
            <tr>
              <th className="px-3 py-3">Sản phẩm</th>
              <th className="px-3 py-3">SKU</th>
              <th className="px-3 py-3">Màu/Size</th>
              <th className="px-3 py-3">Giá bán</th>
              <th className="px-3 py-3">Giá nhập</th>
              <th className="px-3 py-3">Giá buôn</th>
              <th className="px-3 py-3">Biên</th>
              <th className="px-3 py-3">Tồn</th>
              <th className="px-3 py-3">Lãi tồn</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => {
              const pct = marginPct(v.price, v.costPrice);
              const lineProfit =
                v.costPrice != null ? (v.price - v.costPrice) * v.stock : null;
              return (
                <tr key={v.id} className="border-b border-line">
                  <td className="px-3 py-2">
                    <Link href={`/admin/products/${v.product.id}`} className="hover:text-accent">
                      {v.product.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{v.sku || "—"}</td>
                  <td className="px-3 py-2">
                    {[v.color, v.size].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-3 py-2">{formatVnd(v.price)}</td>
                  <td className="px-3 py-2">
                    {v.costPrice != null ? formatVnd(v.costPrice) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {v.wholesalePrice != null ? formatVnd(v.wholesalePrice) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {pct != null ? (
                      <span>
                        {formatVnd(v.price - (v.costPrice || 0))} ({pct}%)
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2">{v.stock}</td>
                  <td className="px-3 py-2">
                    {lineProfit != null ? formatVnd(lineProfit) : "—"}
                  </td>
                </tr>
              );
            })}
            {variants.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-muted">
                  Chưa có biến thể. Import Excel Sapo để có giá nhập.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
