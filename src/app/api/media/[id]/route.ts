import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type Params = { params: Promise<{ id: string }> };

const immutableCache =
  "public, max-age=31536000, immutable, stale-while-revalidate=86400";

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch) {
    const meta = await prisma.mediaAsset.findUnique({
      where: { id },
      select: { sha256: true },
    });
    if (!meta) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const etag = `"${meta.sha256}"`;
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": immutableCache,
        },
      });
    }
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { bytes: true, mimeType: true, filename: true, sha256: true },
  });

  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const etag = `"${asset.sha256}"`;
  return new NextResponse(new Uint8Array(asset.bytes), {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(asset.bytes.length),
      "Cache-Control": immutableCache,
      ETag: etag,
      "Content-Disposition": `inline; filename="${asset.filename.replace(/"/g, "")}"`,
    },
  });
}
