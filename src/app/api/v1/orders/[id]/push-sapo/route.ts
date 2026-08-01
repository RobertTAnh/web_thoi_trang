import { NextRequest, NextResponse } from "next/server";
import { requireApiOrAdmin } from "@/lib/api-auth";
import { pushOrderToSapo } from "@/lib/sapo/sync";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireApiOrAdmin(req);
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await pushOrderToSapo(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Push failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
