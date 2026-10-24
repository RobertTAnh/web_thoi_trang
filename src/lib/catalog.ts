import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const CATALOG_TAG = "catalog";

/** Fields ProductCard / HomeCategoryTabs need — skip description & variant cost fields. */
export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  images: true,
  categoryId: true,
  featured: true,
  variants: {
    select: {
      id: true,
      color: true,
      size: true,
      price: true,
      compareAt: true,
      stock: true,
      image: true,
    },
  },
} as const;

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  images: string[];
  categoryId: string | null;
  featured: boolean;
  variants: {
    id: string;
    color: string | null;
    size: string | null;
    price: number;
    compareAt: number | null;
    stock: number;
    image: string | null;
  }[];
};

async function fetchNavCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
    },
  });
}

export const getNavCategories = unstable_cache(fetchNavCategories, ["nav-categories"], {
  tags: [CATALOG_TAG],
  revalidate: 120,
});

async function fetchHomeCatalog() {
  const [coupons, flashSale, featuredProducts, latestProducts, categories, posts, instagramReels] =
    await Promise.all([
      prisma.coupon.findMany({
        where: { active: true },
        take: 4,
        select: {
          id: true,
          code: true,
          description: true,
        },
      }),
      prisma.flashSale.findFirst({
        where: { active: true, endsAt: { gt: new Date() } },
        orderBy: { endsAt: "asc" },
        select: { id: true, endsAt: true },
      }),
      prisma.product.findMany({
        where: { published: true, featured: true },
        select: productCardSelect,
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { published: true },
        select: productCardSelect,
        take: 40,
        orderBy: { createdAt: "desc" },
      }),
      fetchNavCategories(),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          createdAt: true,
        },
      }),
      prisma.instagramReel.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, url: true },
      }),
    ]);

  const newProducts = latestProducts.slice(0, 10);
  const hotProducts = featuredProducts.length ? featuredProducts : newProducts;

  const prices = latestProducts.flatMap((p) =>
    p.variants.map((v) => v.price).filter((price) => price >= 100_000),
  );
  const fromPrice = prices.length ? Math.min(...prices) : 249_000;

  return {
    coupons,
    flashSale,
    hotProducts,
    newProducts,
    categories,
    categoryProducts: latestProducts,
    posts,
    fromPrice,
    instagramReels,
  };
}

export const getHomeCatalog = unstable_cache(fetchHomeCatalog, ["home-catalog"], {
  tags: [CATALOG_TAG],
  revalidate: 60,
});

async function fetchRecentPurchaseProducts() {
  return prisma.product.findMany({
    where: { published: true },
    select: {
      name: true,
      slug: true,
      images: true,
      variants: { select: { image: true }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });
}

export const getRecentPurchaseProducts = unstable_cache(
  fetchRecentPurchaseProducts,
  ["recent-purchase-products"],
  { tags: [CATALOG_TAG], revalidate: 120 },
);
