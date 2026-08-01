import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { SyncLogType } from "@prisma/client";
import type { SapoProduct } from "@/lib/sapo/client";
import { slugify } from "@/lib/utils";

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.SAPO_WEBHOOK_SECRET;
  if (!secret) return true; // allow in dev without secret
  if (!signature) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature =
    req.headers.get("x-sapo-hmac-sha256") ||
    req.headers.get("x-bizweb-hmac-sha256");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topic =
    req.headers.get("x-sapo-topic") ||
    req.headers.get("x-bizweb-topic") ||
    "unknown";

  try {
    if (topic.includes("products/") || payload.id) {
      const product = (payload.product || payload) as SapoProduct;
      if (product?.id && product.variants) {
        for (const variant of product.variants) {
          if (!variant.id) continue;
          await prisma.productVariant.updateMany({
            where: { sapoVariantId: String(variant.id) },
            data: {
              stock: variant.inventory_quantity ?? 0,
              price: Math.round(Number(variant.price) || 0),
              compareAt: variant.compare_at_price
                ? Math.round(Number(variant.compare_at_price))
                : null,
            },
          });
        }

        // Ensure product exists
        const existing = await prisma.product.findUnique({
          where: { sapoProductId: String(product.id) },
        });
        if (!existing && product.name) {
          await prisma.product.create({
            data: {
              sapoProductId: String(product.id),
              name: product.name,
              slug: slugify(product.alias || `${product.name}-${product.id}`),
              brand: product.vendor || null,
              description: product.content || null,
              images: (product.images || []).map((i) => i.src),
              published: product.published !== false,
              variants: {
                create: (product.variants || []).map((v) => ({
                  sapoVariantId: String(v.id),
                  sku: v.sku || null,
                  title: v.title || null,
                  color: v.option1 || null,
                  size: v.option2 || null,
                  price: Math.round(Number(v.price) || 0),
                  compareAt: v.compare_at_price
                    ? Math.round(Number(v.compare_at_price))
                    : null,
                  stock: v.inventory_quantity ?? 0,
                })),
              },
            },
          });
        }
      }
    }

    if (topic.includes("orders/") && payload.id) {
      const sapoOrderId = String(payload.id);
      await prisma.order.updateMany({
        where: { sapoOrderId },
        data: {
          // Keep local status unless cancelled
          ...(String(payload.cancelled_on || "")
            ? { status: "CANCELLED" as const }
            : {}),
        },
      });
    }

    await prisma.syncLog.create({
      data: {
        type: SyncLogType.WEBHOOK,
        status: "success",
        message: `Webhook ${topic}`,
        meta: { topic, id: payload.id ?? null },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed";
    await prisma.syncLog.create({
      data: {
        type: SyncLogType.WEBHOOK,
        status: "error",
        message,
        meta: { topic },
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
