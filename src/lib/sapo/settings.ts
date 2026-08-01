import { prisma } from "@/lib/db";

export async function getSapoCredentials() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["SAPO_STORE_URL", "SAPO_ACCESS_TOKEN"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    storeUrl: map.SAPO_STORE_URL || process.env.SAPO_STORE_URL || "",
    token: map.SAPO_ACCESS_TOKEN || process.env.SAPO_ACCESS_TOKEN || "",
  };
}
