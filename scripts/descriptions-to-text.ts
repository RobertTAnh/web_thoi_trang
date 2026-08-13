import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { productDescriptionToText } from "../src/lib/html";

config({ path: ".env.local", override: true });

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, description: true },
  });
  let updated = 0;

  for (const product of products) {
    const description = productDescriptionToText(product.description);
    if (description !== product.description) {
      await prisma.product.update({
        where: { id: product.id },
        data: { description },
      });
      updated += 1;
    }
  }

  console.log(JSON.stringify({ total: products.length, updated }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
