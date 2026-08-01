import { NextRequest, NextResponse } from "next/server";
import { requireApiOrAdmin } from "@/lib/api-auth";
import { syncInventoryFromSapo } from "@/lib/sapo/sync";

export async function POST(req: NextRequest) {
  const authz = await requireApiOrAdmin(req);
  if (!authz) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncInventoryFromSapo();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
