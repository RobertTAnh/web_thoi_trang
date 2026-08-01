"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession, generateApiKey } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";
import { getSapoClient } from "@/lib/sapo/client";
import { syncProductsFromSapo, pushOrderToSapo } from "@/lib/sapo/sync";

async function ensureAdmin() {
  const session = await requireAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function syncProductsAction() {
  await ensureAdmin();
  await syncProductsFromSapo();
  revalidatePath("/admin/products");
  revalidatePath("/admin/settings/sapo");
}

export async function pushOrderAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("orderId") || "");
  await pushOrderToSapo(id);
  revalidatePath("/admin/orders");
}

export async function updateOrderStatusAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");
  await prisma.order.update({
    where: { id },
    data: { status: status as never },
  });
  revalidatePath("/admin/orders");
}

export async function saveProductAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  const brand = String(formData.get("brand") || "") || null;
  const description = String(formData.get("description") || "") || null;
  const categoryId = String(formData.get("categoryId") || "") || null;
  const image = String(formData.get("image") || "");
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const price = Number(formData.get("price") || 0);
  const compareAt = Number(formData.get("compareAt") || 0) || null;
  const stock = Number(formData.get("stock") || 0);
  const color = String(formData.get("color") || "") || null;
  const size = String(formData.get("size") || "") || null;

  const slugBase = slugify(name);
  let slug = slugBase;
  let i = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === id) break;
    slug = `${slugBase}-${i++}`;
  }

  if (id) {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        brand,
        description,
        categoryId,
        published,
        featured,
        images: image ? [image] : undefined,
      },
    });
    const first = await prisma.productVariant.findFirst({ where: { productId: id } });
    if (first) {
      await prisma.productVariant.update({
        where: { id: first.id },
        data: { price, compareAt, stock, color, size, title: `${color || ""} / ${size || ""}` },
      });
    }
  } else {
    await prisma.product.create({
      data: {
        name,
        slug,
        brand,
        description,
        categoryId,
        published,
        featured,
        images: image ? [image] : [],
        variants: {
          create: {
            price,
            compareAt,
            stock,
            color,
            size,
            title: `${color || "Default"} / ${size || "Freesize"}`,
            sku: `${slugify(name).toUpperCase()}-01`,
          },
        },
      },
    });
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function saveCouponAction(formData: FormData) {
  await ensureAdmin();
  const code = String(formData.get("code") || "").toUpperCase();
  await prisma.coupon.upsert({
    where: { code },
    update: {
      description: String(formData.get("description") || "") || null,
      percentOff: Number(formData.get("percentOff") || 0) || null,
      minOrder: Number(formData.get("minOrder") || 0),
      maxDiscount: Number(formData.get("maxDiscount") || 0) || null,
      freeShip: formData.get("freeShip") === "on",
      active: formData.get("active") === "on",
    },
    create: {
      code,
      description: String(formData.get("description") || "") || null,
      percentOff: Number(formData.get("percentOff") || 0) || null,
      minOrder: Number(formData.get("minOrder") || 0),
      maxDiscount: Number(formData.get("maxDiscount") || 0) || null,
      freeShip: formData.get("freeShip") === "on",
      active: true,
    },
  });
  revalidatePath("/admin/coupons");
}

export async function saveFlashSaleAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    title: String(formData.get("title") || ""),
    percentOff: Number(formData.get("percentOff") || 50),
    startsAt: new Date(String(formData.get("startsAt"))),
    endsAt: new Date(String(formData.get("endsAt"))),
    active: formData.get("active") === "on",
    tabLabels: String(formData.get("tabLabels") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };

  if (id) {
    await prisma.flashSale.update({ where: { id }, data });
  } else {
    await prisma.flashSale.create({ data });
  }
  revalidatePath("/admin/flash-sales");
}

export async function saveCategoryAction(formData: FormData) {
  await ensureAdmin();
  const name = String(formData.get("name") || "");
  const slug = slugify(String(formData.get("slug") || name));
  const image = String(formData.get("image") || "") || null;
  await prisma.category.upsert({
    where: { slug },
    update: { name, image },
    create: { name, slug, image },
  });
  revalidatePath("/admin/categories");
}

export async function saveBlogAction(formData: FormData) {
  await ensureAdmin();
  const title = String(formData.get("title") || "");
  const slug = slugify(String(formData.get("slug") || title));
  await prisma.blogPost.upsert({
    where: { slug },
    update: {
      title,
      excerpt: String(formData.get("excerpt") || "") || null,
      content: String(formData.get("content") || ""),
      coverImage: String(formData.get("coverImage") || "") || null,
      published: formData.get("published") === "on",
    },
    create: {
      title,
      slug,
      excerpt: String(formData.get("excerpt") || "") || null,
      content: String(formData.get("content") || ""),
      coverImage: String(formData.get("coverImage") || "") || null,
      published: true,
    },
  });
  revalidatePath("/admin/content");
}

export async function createApiKeyAction(formData: FormData) {
  const session = await ensureAdmin();
  const name = String(formData.get("name") || "Default");
  const { raw, prefix, hash } = generateApiKey();
  await prisma.apiKey.create({
    data: {
      name,
      prefix,
      keyHash: hash,
      userId: session.user.id,
    },
  });
  revalidatePath("/admin/api-keys");
  return raw;
}

export async function revokeApiKeyAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/admin/api-keys");
}

export async function saveSapoSettingsAction(formData: FormData) {
  await ensureAdmin();
  const storeUrl = String(formData.get("storeUrl") || "").replace(/\/$/, "");
  const token = String(formData.get("token") || "");

  await prisma.setting.upsert({
    where: { key: "SAPO_STORE_URL" },
    update: { value: storeUrl },
    create: { key: "SAPO_STORE_URL", value: storeUrl },
  });
  if (token) {
    await prisma.setting.upsert({
      where: { key: "SAPO_ACCESS_TOKEN" },
      update: { value: token },
      create: { key: "SAPO_ACCESS_TOKEN", value: token },
    });
  }

  // Also write to process env for current runtime convenience via settings lookup in client
  process.env.SAPO_STORE_URL = storeUrl;
  if (token) process.env.SAPO_ACCESS_TOKEN = token;

  revalidatePath("/admin/settings/sapo");
}

export async function testSapoConnectionAction() {
  await ensureAdmin();
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["SAPO_STORE_URL", "SAPO_ACCESS_TOKEN"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const client = getSapoClient(
    map.SAPO_STORE_URL || process.env.SAPO_STORE_URL,
    map.SAPO_ACCESS_TOKEN || process.env.SAPO_ACCESS_TOKEN,
  );
  if (!client.isConfigured()) {
    return { ok: false, message: "Chưa cấu hình store URL / token" };
  }
  try {
    const shop = await client.testConnection();
    return {
      ok: true,
      message: `Kết nối OK: ${shop.shop?.name || shop.shop?.domain || "Sapo shop"}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
