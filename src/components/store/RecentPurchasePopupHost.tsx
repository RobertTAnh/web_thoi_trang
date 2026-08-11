import { prisma } from "@/lib/db";
import { RecentPurchasePopup } from "@/components/store/RecentPurchasePopup";

export async function RecentPurchasePopupHost() {
  const products = await prisma.product.findMany({
    where: { published: true },
    select: {
      name: true,
      slug: true,
      images: true,
      variants: { select: { image: true }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });

  const items = products
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.images[0] || p.variants[0]?.image || null,
    }))
    .filter((p) => p.image);

  if (!items.length) return null;

  return <RecentPurchasePopup products={items} />;
}
