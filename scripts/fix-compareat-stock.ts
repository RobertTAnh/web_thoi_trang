import { prisma } from "../src/lib/db";

/**
 * Sapo PL_Giá bán lẻ đang nằm ở `price` → chuyển sang `compareAt` (giá gốc),
 * đồng thời giữ `price` = giá gốc (để sửa giá bán web sau), tồn kho = 200.
 */
async function main() {
  const result = await prisma.$executeRaw`
    UPDATE "ProductVariant"
    SET
      "compareAt" = price,
      stock = 200
  `;
  console.log(`Updated variants: ${result}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
