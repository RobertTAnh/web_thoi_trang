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

type VariantPayload = {
  id?: string;
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  compareAt?: number | null;
  costPrice?: number | null;
  wholesalePrice?: number | null;
  stock?: number;
  image?: string | null;
};

export async function saveProductAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  const brand = String(formData.get("brand") || "") || null;
  const { productDescriptionToText } = await import("@/lib/html");
  const description = productDescriptionToText(String(formData.get("description") || ""));
  const categoryId = String(formData.get("categoryId") || "") || null;
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";

  let images: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("imagesJson") || "[]"));
    if (Array.isArray(parsed)) {
      images = parsed.map(String).map((s) => s.trim()).filter(Boolean);
    }
  } catch {
    images = [];
  }

  let variants: VariantPayload[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("variantsJson") || "[]"));
    if (Array.isArray(parsed)) variants = parsed;
  } catch {
    variants = [];
  }
  if (!variants.length) {
    throw new Error("Cần ít nhất 1 biến thể");
  }

  const slugBase = slugify(name);
  let slug = slugBase;
  let i = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === id) break;
    slug = `${slugBase}-${i++}`;
  }

  const normalizeVariant = (v: VariantPayload, index: number) => {
    const color = v.color || null;
    const size = v.size || null;
    const toNullableInt = (n: number | null | undefined) => {
      if (n == null || Number.isNaN(Number(n))) return null;
      const value = Number(n);
      return value > 0 || value === 0 ? value : null;
    };
    return {
      sku: v.sku?.trim() || `${slug.toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
      color,
      size,
      title: `${color || "Default"} / ${size || "Freesize"}`,
      price: Number(v.price) || 0,
      compareAt: toNullableInt(v.compareAt ?? null),
      costPrice: toNullableInt(v.costPrice ?? null),
      wholesalePrice: toNullableInt(v.wholesalePrice ?? null),
      stock: Number(v.stock) || 0,
      image: v.image || images[0] || null,
    };
  };

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
        images,
      },
    });

    const existing = await prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const keepIds: string[] = [];

    for (let idx = 0; idx < variants.length; idx++) {
      const raw = variants[idx];
      const data = normalizeVariant(raw, idx);
      if (raw.id && existing.some((e) => e.id === raw.id)) {
        await prisma.productVariant.update({
          where: { id: raw.id },
          data,
        });
        keepIds.push(raw.id);
      } else {
        const created = await prisma.productVariant.create({
          data: { productId: id, ...data },
        });
        keepIds.push(created.id);
      }
    }

    await prisma.productVariant.deleteMany({
      where: {
        productId: id,
        id: { notIn: keepIds },
        cartItems: { none: {} },
        orderItems: { none: {} },
      },
    });
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
        images,
        variants: {
          create: variants.map((v, idx) => normalizeVariant(v, idx)),
        },
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/crm");
  redirect("/admin/products");
}

export async function importSapoExcelAction(formData: FormData) {
  await ensureAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, message: "Chưa chọn file Excel" };
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return { ok: false as const, message: "Chỉ hỗ trợ file .xlsx" };
  }

  const { importSapoExcelBuffer } = await import("@/lib/sapo/excel-import");
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await importSapoExcelBuffer(buffer);

  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/crm");

  return {
    ok: true as const,
    products: result.products,
    variants: result.variants,
    images: result.images,
    errors: result.errors.length,
    message: result.errors[0],
  };
}

/** Chuyển giá bán hiện tại → giá gốc, giá bán = giá gốc, tồn = 200 cho mọi biến thể. */
export async function fixCompareAtAndStockAction() {
  await ensureAdmin();
  const updated = await prisma.$executeRaw`
    UPDATE "ProductVariant"
    SET
      "compareAt" = price,
      stock = 200
  `;
  revalidatePath("/admin/products");
  revalidatePath("/admin/crm");
  return { ok: true as const, updated: Number(updated) };
}

/** Chuẩn hóa HTML mô tả tất cả sản phẩm (Sapo/Excel). */
export async function beautifyAllDescriptionsAction() {
  await ensureAdmin();
  const { beautifyProductHtml } = await import("@/lib/html");
  const products = await prisma.product.findMany({
    select: { id: true, description: true },
  });
  let updated = 0;
  for (const p of products) {
    const next = beautifyProductHtml(p.description);
    if (next !== p.description) {
      await prisma.product.update({
        where: { id: p.id },
        data: { description: next },
      });
      updated += 1;
    }
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true as const, updated, total: products.length };
}

export async function deleteProductAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function bulkDeleteProductsAction(ids: string[]) {
  await ensureAdmin();
  const uniqueIds = [...new Set(ids.map(String).filter(Boolean))].slice(0, 500);
  if (!uniqueIds.length) {
    return { ok: false as const, message: "Chưa chọn sản phẩm nào." };
  }

  const existing = await prisma.product.count({ where: { id: { in: uniqueIds } } });
  if (existing !== uniqueIds.length) {
    return { ok: false as const, message: "Danh sách có sản phẩm không còn tồn tại. Hãy tải lại trang." };
  }

  try {
    await prisma.product.deleteMany({ where: { id: { in: uniqueIds } } });
  } catch {
    return {
      ok: false as const,
      message: "Không thể xóa vì một số sản phẩm đã xuất hiện trong giỏ hàng hoặc đơn hàng.",
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/collections", "layout");
  return { ok: true as const, message: `Đã xóa ${uniqueIds.length} sản phẩm.` };
}

export async function uploadProductImagesAction(formData: FormData) {
  await ensureAdmin();
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, 10);

  if (!files.length) {
    return { ok: false as const, message: "Chưa chọn ảnh." };
  }
  if (files.reduce((total, file) => total + file.size, 0) > 18 * 1024 * 1024) {
    return { ok: false as const, message: "Tổng dung lượng mỗi lần tải không được quá 18 MB." };
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return { ok: false as const, message: `Không hỗ trợ định dạng ${file.name}.` };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { ok: false as const, message: `${file.name} vượt quá giới hạn 10 MB.` };
    }
  }

  try {
    const { storeUploadedImage } = await import("@/lib/media");
    const urls: string[] = [];
    for (const file of files) urls.push(await storeUploadedImage(file));
    return { ok: true as const, urls, message: `Đã tải lên ${urls.length} ảnh.` };
  } catch {
    return { ok: false as const, message: "Tải ảnh thất bại. Vui lòng thử lại." };
  }
}

export async function deleteMediaAssetAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const path = `/api/media/${id}`;
  const [galleryUse, variantUse] = await Promise.all([
    prisma.product.count({ where: { images: { has: path } } }),
    prisma.productVariant.count({ where: { image: path } }),
  ]);
  if (galleryUse || variantUse) {
    throw new Error("Ảnh đang được sản phẩm sử dụng nên chưa thể xóa.");
  }
  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
}

export async function saveCouponAction(formData: FormData) {
  await ensureAdmin();
  const code = String(formData.get("code") || "").toUpperCase().trim();
  if (!code) throw new Error("Thiếu mã giảm giá");

  const data = {
    description: String(formData.get("description") || "") || null,
    percentOff: Number(formData.get("percentOff") || 0) || null,
    amountOff: Number(formData.get("amountOff") || 0) || null,
    minOrder: Number(formData.get("minOrder") || 0),
    maxDiscount: Number(formData.get("maxDiscount") || 0) || null,
    freeShip: formData.get("freeShip") === "on",
    active: formData.get("active") === "on",
  };

  await prisma.coupon.upsert({
    where: { code },
    update: data,
    create: { code, ...data, active: data.active ?? true },
  });
  revalidatePath("/admin/coupons");
  revalidatePath("/products", "layout");
}

export async function deleteCouponAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  revalidatePath("/products", "layout");
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
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "");
  if (!name.trim()) throw new Error("Thiếu tên danh mục");
  const slug = slugify(String(formData.get("slug") || name));
  const image = String(formData.get("image") || "") || null;
  const duplicate = await prisma.category.findFirst({
    where: { slug, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (duplicate) throw new Error("Slug danh mục đã tồn tại");

  if (id) await prisma.category.update({ where: { id }, data: { name, slug, image } });
  else await prisma.category.create({ data: { name, slug, image } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/collections", "layout");
}

export async function deleteCategoryAction(id: string) {
  await ensureAdmin();
  const category = await prisma.category.findUnique({
    where: { id: String(id) },
    select: { name: true, _count: { select: { products: true, children: true } } },
  });
  if (!category) return { ok: false as const, message: "Danh mục không còn tồn tại." };
  if (category._count.products > 0 || category._count.children > 0) {
    return {
      ok: false as const,
      message: `Không thể xóa “${category.name}” vì đang có ${category._count.products} sản phẩm hoặc danh mục con.`,
    };
  }
  await prisma.category.delete({ where: { id: String(id) } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/collections", "layout");
  return { ok: true as const, message: `Đã xóa danh mục “${category.name}”.` };
}

function normalizeInstagramReelUrl(raw: string) {
  try {
    const url = new URL(raw.trim());
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return null;
    const match = url.pathname.match(/^\/(reel|p)\/([^/]+)/i);
    if (!match) return null;
    return `https://www.instagram.com/${match[1].toLowerCase()}/${match[2]}/`;
  } catch {
    return null;
  }
}

export async function saveInstagramReelAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  const url = normalizeInstagramReelUrl(String(formData.get("url") || ""));
  if (!url) throw new Error("Link Instagram Reel không hợp lệ");
  const data = {
    title: String(formData.get("title") || "").trim() || null,
    url,
    sortOrder: Number(formData.get("sortOrder") || 0),
    active: formData.get("active") === "on",
  };
  const duplicate = await prisma.instagramReel.findFirst({
    where: { url, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (duplicate) throw new Error("Reel này đã có trong danh sách");
  if (id) await prisma.instagramReel.update({ where: { id }, data });
  else await prisma.instagramReel.create({ data });
  revalidatePath("/admin/instagram-reels");
  revalidatePath("/");
}

export async function deleteInstagramReelAction(id: string) {
  await ensureAdmin();
  const existing = await prisma.instagramReel.findUnique({ where: { id: String(id) }, select: { id: true } });
  if (!existing) return { ok: false as const, message: "Reel không còn tồn tại." };
  await prisma.instagramReel.delete({ where: { id: existing.id } });
  revalidatePath("/admin/instagram-reels");
  revalidatePath("/");
  return { ok: true as const, message: "Đã xóa Reel." };
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
