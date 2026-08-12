import { prisma } from "@/lib/db";
import { InstagramReelsManager } from "@/components/admin/InstagramReelsManager";

export default async function AdminInstagramReelsPage() {
  const reels = await prisma.instagramReel.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, url: true, sortOrder: true, active: true },
  });
  return <InstagramReelsManager reels={reels} />;
}
