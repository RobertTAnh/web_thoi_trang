import { getRecentPurchaseProducts } from "@/lib/catalog";
import { RecentPurchasePopup } from "@/components/store/RecentPurchasePopup";

export async function RecentPurchasePopupHost() {
  const products = await getRecentPurchaseProducts();

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
