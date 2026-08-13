import Image from "next/image";
import { prisma } from "@/lib/db";
import { deleteMediaAssetAction } from "@/app/admin/actions";
import { MediaLibraryUpload } from "@/components/admin/MediaLibraryUpload";

export default async function MediaLibraryPage() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, mimeType: true, createdAt: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Thư viện Media</h1>
          <p className="mt-1 text-sm text-muted">Quản lý {assets.length} ảnh đã tải lên cửa hàng.</p>
        </div>
        <MediaLibraryUpload />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {assets.map((asset) => (
          <article key={asset.id} className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
            <div className="relative aspect-square bg-[#f5f5f5]">
              <Image src={`/api/media/${asset.id}`} alt={asset.filename} fill className="object-cover" sizes="180px" unoptimized />
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-semibold" title={asset.filename}>{asset.filename}</p>
              <p className="mt-1 text-[10px] text-muted">{asset.mimeType} · {asset.createdAt.toLocaleDateString("vi-VN")}</p>
              <form action={deleteMediaAssetAction} className="mt-2">
                <input type="hidden" name="id" value={asset.id} />
                <button type="submit" className="text-xs font-medium text-sale">Xóa ảnh</button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
