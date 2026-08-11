import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { beautifyProductHtml } from "@/lib/html";
import { storeImageFromUrl } from "@/lib/media";

export type SapoImportResult = {
  products: number;
  variants: number;
  images: number;
  categories: number;
  errors: string[];
};

type RowProduct = {
  name: string;
  productType: string | null;
  description: string | null;
  brand: string | null;
  attr1Name: string | null;
  attr1Value: string | null;
  attr2Name: string | null;
  attr2Value: string | null;
  variantTitle: string | null;
  sku: string;
  imageUrl: string | null;
  retailPrice: number;
  costPrice: number | null;
  wholesalePrice: number | null;
};

function cellStr(value: ExcelJS.CellValue | undefined): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim() || null;
  }
  if (typeof value === "object" && "richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((t) => t.text).join("").trim() || null;
  }
  const s = String(value).trim();
  return s || null;
}

function cellNum(value: ExcelJS.CellValue | undefined): number | null {
  const s = cellStr(value);
  if (s == null) return null;
  const n = Number(String(s).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : null;
}

function mapColorSize(row: RowProduct) {
  let color: string | null = null;
  let size: string | null = null;
  const pairs: [string | null, string | null][] = [
    [row.attr1Name, row.attr1Value],
    [row.attr2Name, row.attr2Value],
  ];
  for (const [name, val] of pairs) {
    if (!val) continue;
    const n = (name || "").toLowerCase();
    if (n.includes("màu") || n.includes("color") || n.includes("colour")) color = val;
    else if (n.includes("size") || n.includes("cỡ") || n.includes("kích")) size = val;
  }
  if (!color && row.attr1Value) color = row.attr1Value;
  if (!size && row.attr2Value) size = row.attr2Value;
  return { color, size };
}

async function ensureCategory(name: string | null): Promise<{ id: string; created: boolean } | null> {
  if (!name) return null;
  const slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return { id: existing.id, created: false };
  const created = await prisma.category.create({
    data: { name, slug },
  });
  return { id: created.id, created: true };
}

async function uniqueProductSlug(name: string, existingId?: string) {
  const base = slugify(name) || `sp-${Date.now()}`;
  let slug = base;
  let i = 1;
  while (true) {
    const found = await prisma.product.findUnique({ where: { slug } });
    if (!found || found.id === existingId) return slug;
    slug = `${base}-${i++}`;
  }
}

function parseWorkbookRows(workbook: ExcelJS.Workbook): RowProduct[] {
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers: Record<string, number> = {};
  headerRow.eachCell((cell, col) => {
    const key = cellStr(cell.value);
    if (key) headers[key] = col;
  });

  const col = (name: string) => headers[name];

  const rows: RowProduct[] = [];
  let currentName = "";
  let currentType: string | null = null;
  let currentDesc: string | null = null;
  let currentBrand: string | null = null;
  let currentAttr1: string | null = null;
  let currentAttr2: string | null = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const name = cellStr(row.getCell(col("Tên sản phẩm*") || 1).value);
    if (name) {
      currentName = name;
      currentType = cellStr(row.getCell(col("Loại sản phẩm") || 3).value);
      currentDesc = cellStr(row.getCell(col("Mô tả sản phẩm") || 4).value);
      currentBrand = cellStr(row.getCell(col("Nhãn hiệu") || 5).value);
      currentAttr1 = cellStr(row.getCell(col("Thuộc tính 1") || 7).value);
      currentAttr2 = cellStr(row.getCell(col("Thuộc tính 2") || 9).value);
    }
    if (!currentName) return;

    const sku = cellStr(row.getCell(col("Mã SKU*") || 14).value);
    if (!sku) return;

    const retail = cellNum(row.getCell(col("PL_Giá bán lẻ") || 19).value) ?? 0;

    rows.push({
      name: currentName,
      productType: currentType,
      description: currentDesc ? beautifyProductHtml(currentDesc) : null,
      brand: currentBrand,
      attr1Name: currentAttr1 ?? cellStr(row.getCell(col("Thuộc tính 1") || 7).value),
      attr1Value: cellStr(row.getCell(col("Giá trị thuộc tính 1") || 8).value),
      attr2Name: currentAttr2 ?? cellStr(row.getCell(col("Thuộc tính 2") || 9).value),
      attr2Value: cellStr(row.getCell(col("Giá trị thuộc tính 2") || 10).value),
      variantTitle: cellStr(row.getCell(col("Tên phiên bản sản phẩm") || 13).value),
      sku,
      imageUrl: cellStr(row.getCell(col("Ảnh đại diện") || 17).value),
      retailPrice: retail,
      costPrice: cellNum(row.getCell(col("PL_Giá nhập") || 20).value),
      wholesalePrice: cellNum(row.getCell(col("PL_Giá bán buôn") || 21).value),
    });
  });

  return rows;
}

export async function importSapoExcelBuffer(
  buffer: Buffer,
  options?: { downloadImages?: boolean },
): Promise<SapoImportResult> {
  const downloadImages = options?.downloadImages !== false;
  const workbook = new ExcelJS.Workbook();
  // exceljs typings accept ArrayBuffer-like
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const rows = parseWorkbookRows(workbook);
  const result: SapoImportResult = {
    products: 0,
    variants: 0,
    images: 0,
    categories: 0,
    errors: [],
  };

  const imageCache = new Map<string, string>();
  const categoryCache = new Map<string, string | null>();
  const productIdsByName = new Map<string, string>();
  const productImages = new Map<string, Set<string>>();
  let createdProducts = 0;

  async function resolveImage(url: string | null) {
    if (!url || !downloadImages) return url;
    if (imageCache.has(url)) return imageCache.get(url)!;
    try {
      const path = await storeImageFromUrl(url);
      imageCache.set(url, path);
      result.images += 1;
      return path;
    } catch (e) {
      result.errors.push(e instanceof Error ? e.message : String(e));
      return url;
    }
  }

  for (const row of rows) {
    try {
      let categoryId: string | null = null;
      if (row.productType) {
        if (!categoryCache.has(row.productType)) {
          const cat = await ensureCategory(row.productType);
          categoryCache.set(row.productType, cat?.id ?? null);
          if (cat?.created) result.categories += 1;
        }
        categoryId = categoryCache.get(row.productType) ?? null;
      }

      const { color, size } = mapColorSize(row);
      const media = await resolveImage(row.imageUrl);

      let productId = productIdsByName.get(row.name);

      // Match existing variant by SKU first (Sapo sync / prior import)
      const existingVariant = await prisma.productVariant.findFirst({
        where: { sku: row.sku },
        select: { id: true, productId: true, stock: true, image: true },
      });

      if (existingVariant) {
        productId = existingVariant.productId;
        productIdsByName.set(row.name, productId);

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (product) {
          const images = [...product.images];
          if (media && !images.includes(media)) images.push(media);
          await prisma.product.update({
            where: { id: productId },
            data: {
              name: row.name,
              description: row.description
                ? beautifyProductHtml(row.description)
                : product.description,
              brand: row.brand ?? product.brand,
              categoryId: categoryId ?? product.categoryId,
              images,
              published: true,
            },
          });
        }

        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            title: row.variantTitle || `${color || ""} / ${size || ""}`.trim(),
            color,
            size,
            // PL_Giá bán lẻ từ Sapo = giá gốc; giá bán web tạm = giá gốc (sửa sau trên admin)
            price: row.retailPrice,
            compareAt: row.retailPrice || null,
            costPrice: row.costPrice,
            wholesalePrice: row.wholesalePrice,
            stock: 200,
            image: media || existingVariant.image,
          },
        });
        result.variants += 1;
        continue;
      }

      if (!productId) {
        const slug = await uniqueProductSlug(row.name);
        const bySlug = await prisma.product.findUnique({ where: { slug } });
        const byName = bySlug
          ? null
          : await prisma.product.findFirst({ where: { name: row.name } });
        const existingProduct = bySlug || byName;

        if (existingProduct) {
          productId = existingProduct.id;
          productIdsByName.set(row.name, productId);
          const images = [...existingProduct.images];
          if (media && !images.includes(media)) images.push(media);
          await prisma.product.update({
            where: { id: productId },
            data: {
              description: row.description
                ? beautifyProductHtml(row.description)
                : existingProduct.description,
              brand: row.brand ?? existingProduct.brand,
              categoryId: categoryId ?? existingProduct.categoryId,
              images,
              published: true,
            },
          });
          productImages.set(productId, new Set(images));
        } else {
          const images = media ? [media] : [];
          const created = await prisma.product.create({
            data: {
              name: row.name,
              slug,
              description: row.description
                ? beautifyProductHtml(row.description)
                : null,
              brand: row.brand,
              categoryId,
              images,
              published: true,
            },
          });
          productId = created.id;
          productIdsByName.set(row.name, productId);
          productImages.set(productId, new Set(images));
          createdProducts += 1;
        }
      } else if (media) {
        const set = productImages.get(productId) || new Set<string>();
        if (!set.has(media)) {
          set.add(media);
          productImages.set(productId, set);
          await prisma.product.update({
            where: { id: productId },
            data: { images: [...set] },
          });
        }
      }

      await prisma.productVariant.create({
        data: {
          productId,
          sku: row.sku,
          title: row.variantTitle || `${color || ""} / ${size || ""}`.trim(),
          color,
          size,
          price: row.retailPrice,
          compareAt: row.retailPrice || null,
          costPrice: row.costPrice,
          wholesalePrice: row.wholesalePrice,
          stock: 200,
          image: media,
        },
      });
      result.variants += 1;
    } catch (e) {
      result.errors.push(
        `SKU ${row.sku}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  // Unique products touched in this import
  result.products = Math.max(createdProducts, productIdsByName.size);

  return result;
}

export async function importSapoExcelFile(filePath: string) {
  const fs = await import("fs/promises");
  const buffer = await fs.readFile(filePath);
  return importSapoExcelBuffer(buffer);
}
