import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [products, variants, media, orders, coupons] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.mediaAsset.count(),
    prisma.order.count(),
    prisma.coupon.count(),
  ]);
  console.log(
    JSON.stringify(
      { products, variants, mediaAssets: media, orders, coupons },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
