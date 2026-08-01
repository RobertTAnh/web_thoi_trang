import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getSapoClient, type SapoProduct, type SapoVariant } from "@/lib/sapo/client";
import { getSapoCredentials } from "@/lib/sapo/settings";
import { SyncLogType } from "@prisma/client";

async function clientFromSettings() {
  const creds = await getSapoCredentials();
  return getSapoClient(creds.storeUrl, creds.token);
}

function toIntPrice(value: number | string | null | undefined) {
  if (value == null || value === "") return 0;
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return 0;
  // Sapo may return VND as integer already
  return Math.round(n);
}

function mapVariantOptions(product: SapoProduct, variant: SapoVariant) {
  const optionNames = (product.options || []).map((o) => o.name.toLowerCase());
  const values = [variant.option1, variant.option2, variant.option3];
  let color: string | null = null;
  let size: string | null = null;

  optionNames.forEach((name, idx) => {
    const val = values[idx] || null;
    if (!val) return;
    if (name.includes("màu") || name.includes("color") || name.includes("colour")) color = val;
    else if (name.includes("size") || name.includes("cỡ") || name.includes("kích")) size = val;
  });

  if (!color && variant.option1) color = variant.option1;
  if (!size && variant.option2) size = variant.option2;

  return { color, size };
}

async function upsertSapoProduct(product: SapoProduct) {
  const baseSlug = slugify(product.alias || product.name || `sp-${product.id}`);
  let slug = baseSlug;
  let i = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.sapoProductId === String(product.id)) break;
    slug = `${baseSlug}-${i++}`;
  }

  const images = (product.images || [])
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((img) => img.src)
    .filter(Boolean);

  const saved = await prisma.product.upsert({
    where: { sapoProductId: String(product.id) },
    update: {
      name: product.name,
      slug,
      description: product.content || null,
      brand: product.vendor || null,
      images,
      published: product.published !== false,
    },
    create: {
      sapoProductId: String(product.id),
      name: product.name,
      slug,
      description: product.content || null,
      brand: product.vendor || null,
      images,
      published: product.published !== false,
    },
  });

  const variants = product.variants || [];
  const keptIds: string[] = [];

  for (const variant of variants) {
    const { color, size } = mapVariantOptions(product, variant);
    const row = await prisma.productVariant.upsert({
      where: { sapoVariantId: String(variant.id) },
      update: {
        productId: saved.id,
        sku: variant.sku || null,
        title: variant.title || null,
        color,
        size,
        price: toIntPrice(variant.price),
        compareAt: variant.compare_at_price
          ? toIntPrice(variant.compare_at_price)
          : null,
        stock: variant.inventory_quantity ?? 0,
        image: variant.image?.src || images[0] || null,
      },
      create: {
        sapoVariantId: String(variant.id),
        productId: saved.id,
        sku: variant.sku || null,
        title: variant.title || null,
        color,
        size,
        price: toIntPrice(variant.price),
        compareAt: variant.compare_at_price
          ? toIntPrice(variant.compare_at_price)
          : null,
        stock: variant.inventory_quantity ?? 0,
        image: variant.image?.src || images[0] || null,
      },
    });
    keptIds.push(row.id);
  }

  await prisma.productVariant.deleteMany({
    where: {
      productId: saved.id,
      sapoVariantId: { not: null },
      id: { notIn: keptIds },
    },
  });

  return saved;
}

export async function syncProductsFromSapo() {
  const client = await clientFromSettings();
  if (!client.isConfigured()) {
    throw new Error("Sapo chưa được cấu hình (SAPO_STORE_URL / SAPO_ACCESS_TOKEN)");
  }

  let page = 1;
  let total = 0;
  const limit = 50;

  try {
    while (true) {
      const { products } = await client.listProducts(page, limit);
      if (!products?.length) break;
      for (const product of products) {
        await upsertSapoProduct(product);
        total += 1;
      }
      if (products.length < limit) break;
      page += 1;
    }

    await prisma.syncLog.create({
      data: {
        type: SyncLogType.PRODUCTS,
        status: "success",
        message: `Synced ${total} products from Sapo`,
        meta: { total, pages: page },
      },
    });

    return { total };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await prisma.syncLog.create({
      data: {
        type: SyncLogType.PRODUCTS,
        status: "error",
        message,
      },
    });
    throw error;
  }
}

export async function syncInventoryFromSapo() {
  // Inventory is embedded in product variants; reusing product sync keeps stock accurate.
  const result = await syncProductsFromSapo();
  await prisma.syncLog.create({
    data: {
      type: SyncLogType.INVENTORY,
      status: "success",
      message: `Inventory refreshed via product sync (${result.total} products)`,
      meta: result,
    },
  });
  return result;
}

export async function pushOrderToSapo(orderId: string) {
  const client = await clientFromSettings();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: true } } },
  });

  if (!order) throw new Error("Order not found");
  if (order.syncStatus === "SYNCED" && order.sapoOrderId) {
    return { sapoOrderId: order.sapoOrderId, skipped: true };
  }

  if (!client.isConfigured()) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        syncStatus: "SKIPPED",
        syncError: "Sapo not configured",
      },
    });
    return { skipped: true };
  }

  const lineItems = order.items
    .filter((item) => item.variant.sapoVariantId)
    .map((item) => ({
      variant_id: Number(item.variant.sapoVariantId),
      quantity: item.quantity,
      price: item.price,
    }));

  if (!lineItems.length) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        syncStatus: "SKIPPED",
        syncError: "No Sapo-mapped variants in order",
      },
    });
    await prisma.syncLog.create({
      data: {
        type: SyncLogType.ORDER_PUSH,
        status: "skipped",
        message: `Order ${order.orderNumber} skipped — no sapoVariantId`,
        meta: { orderId },
      },
    });
    return { skipped: true };
  }

  try {
    const nameParts = order.customerName.trim().split(/\s+/);
    const lastName = nameParts.pop() || order.customerName;
    const firstName = nameParts.join(" ") || lastName;

    const payload = {
      order: {
        email: order.email,
        phone: order.phone,
        note: `[LUNARA] ${order.orderNumber}${order.note ? ` — ${order.note}` : ""}`,
        gateway: order.paymentMethod === "COD" ? "Thanh toán khi giao hàng" : "Chuyển khoản",
        financial_status: order.paymentStatus === "PAID" ? "paid" : "pending",
        send_receipt: false,
        line_items: lineItems,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address1: order.address,
          phone: order.phone,
          city: order.city || undefined,
          country: "Vietnam",
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address1: order.address,
          phone: order.phone,
          city: order.city || undefined,
          country: "Vietnam",
        },
      },
    };

    const result = await client.createOrder(payload);
    const sapoOrderId = String(result.order.id);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        sapoOrderId,
        syncStatus: "SYNCED",
        syncError: null,
      },
    });

    await prisma.syncLog.create({
      data: {
        type: SyncLogType.ORDER_PUSH,
        status: "success",
        message: `Pushed order ${order.orderNumber} → Sapo #${sapoOrderId}`,
        meta: { orderId, sapoOrderId },
      },
    });

    return { sapoOrderId, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Push failed";
    await prisma.order.update({
      where: { id: orderId },
      data: {
        syncStatus: "SYNC_FAILED",
        syncError: message,
      },
    });
    await prisma.syncLog.create({
      data: {
        type: SyncLogType.ORDER_PUSH,
        status: "error",
        message: `Failed push ${order.orderNumber}: ${message}`,
        meta: { orderId },
      },
    });
    throw error;
  }
}
