import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";
import { syncProductsAction } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Sản phẩm</h1>
        <div className="flex gap-2">
          <form action={syncProductsAction}>
            <button type="submit" className="border border-ink px-4 py-2 text-sm">
              Sync từ Sapo
            </button>
          </form>
          <Link href="/admin/products/new" className="bg-ink px-4 py-2 text-sm text-white">
            Thêm sản phẩm
          </Link>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-[#faf7f5]">
            <tr>
              <th className="px-4 py-3">SP</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Tồn</th>
              <th className="px-4 py-3">Sapo</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const minPrice = Math.min(...p.variants.map((v) => v.price), 0);
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="border-b border-line">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 overflow-hidden bg-line/40">
                        {p.images[0] && (
                          <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3">{formatVnd(minPrice || 0)}</td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="px-4 py-3 text-xs">
                    {p.sapoProductId ? `#${p.sapoProductId}` : "Local"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="text-accent">
                      Sửa
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
