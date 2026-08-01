import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export function hashApiKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey() {
  const raw = `ln_${randomBytes(24).toString("hex")}`;
  return {
    raw,
    prefix: raw.slice(0, 10),
    hash: hashApiKey(raw),
  };
}

export async function requireApiOrAdmin(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    return { type: "session" as const, userId: session.user.id };
  }

  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return null;
  }

  const key = await prisma.apiKey.findUnique({
    where: { keyHash: hashApiKey(token) },
  });

  if (!key || key.revokedAt) return null;

  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  });

  return { type: "apiKey" as const, userId: key.userId, keyId: key.id };
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}
