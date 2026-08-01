import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`DB already has ${count} products — skip seed.`);
    return;
  }

  console.log("DB empty — running seed...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
