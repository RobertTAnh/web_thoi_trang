import Link from "next/link";
import { prisma } from "@/lib/db";
import { syncProductsAction } from "@/app/admin/actions";
import { SapoExcelImportForm } from "@/components/admin/SapoExcelImportForm";
import { FixPricesStockButton } from "@/components/admin/FixPricesStockButton";
import { BeautifyDescriptionsButton } from "@/components/admin/BeautifyDescriptionsButton";
import { ProductsBulkTable } from "@/components/admin/ProductsBulkTable";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Sản phẩm</h1>
        <div className="flex flex-wrap gap-2">
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

      <div className="mt-4 border border-line bg-white p-4">
        <p className="mb-2 text-sm font-medium">Import Excel Sapo</p>
        <p className="mb-3 text-xs text-muted">
          Tải ảnh từ URL trong file về Postgres (Railway) rồi gắn /api/media/...
        </p>
        <SapoExcelImportForm />
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-sm font-medium">Chỉnh giá &amp; tồn nhanh</p>
          <p className="mb-3 text-xs text-muted">
            Giá đang ở ô bán lẻ → copy sang giá gốc; giá bán = giá gốc; tồn kho mọi biến thể = 200.
            Sau đó bạn sửa giá bán web từng SP.
          </p>
          <FixPricesStockButton />
          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2 text-sm font-medium">Mô tả sản phẩm</p>
            <p className="mb-3 text-xs text-muted">
              Chuẩn hóa HTML mô tả (bỏ thẻ rỗng, decode nếu bị escape). Storefront đã render HTML.
            </p>
            <BeautifyDescriptionsButton />
          </div>
        </div>
      </div>

      <ProductsBulkTable
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0] || null,
          category: product.category?.name || null,
          minPrice: Math.min(
            ...product.variants.map((variant) => variant.price),
            Number.POSITIVE_INFINITY,
          ),
          cost: product.variants.find((variant) => variant.costPrice != null)?.costPrice ?? null,
          stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
          variantCount: product.variants.length,
          sapoProductId: product.sapoProductId,
        })).map((product) => ({
          ...product,
          minPrice: Number.isFinite(product.minPrice) ? product.minPrice : 0,
        }))}
      />
    </div>
  );
}
