import { createHash } from "crypto";
import { prisma } from "@/lib/db";

export function mediaPath(id: string) {
  return `/api/media/${id}`;
}

export function isMediaPath(url: string | null | undefined) {
  return Boolean(url && url.startsWith("/api/media/"));
}

function guessMime(url: string, contentType: string | null) {
  if (contentType && contentType.startsWith("image/")) {
    return contentType.split(";")[0].trim();
  }
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".gif")) return "image/gif";
  return "image/jpeg";
}

function filenameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop() || "image.jpg";
    return base.slice(0, 180);
  } catch {
    return "image.jpg";
  }
}

/** Download remote image (or reuse by sha256 / sourceUrl) and return /api/media/{id} path. */
export async function storeImageFromUrl(sourceUrl: string) {
  const byUrl = await prisma.mediaAsset.findFirst({
    where: { sourceUrl },
    select: { id: true },
  });
  if (byUrl) return mediaPath(byUrl.id);

  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "TisoraImporter/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Không tải được ảnh (${res.status}): ${sourceUrl}`);
  }

  const bytes = Buffer.from(await res.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  const byHash = await prisma.mediaAsset.findUnique({
    where: { sha256 },
    select: { id: true, sourceUrl: true },
  });
  if (byHash) {
    if (!byHash.sourceUrl) {
      await prisma.mediaAsset.update({
        where: { id: byHash.id },
        data: { sourceUrl },
      });
    }
    return mediaPath(byHash.id);
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      filename: filenameFromUrl(sourceUrl),
      mimeType: guessMime(sourceUrl, res.headers.get("content-type")),
      bytes,
      sha256,
      sourceUrl,
    },
    select: { id: true },
  });

  return mediaPath(asset.id);
}
