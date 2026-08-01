import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Tin tức" };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="font-display text-5xl">Tin tức</h1>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/tin-tuc/${post.slug}`} className="group">
            <div className="relative aspect-[16/10] overflow-hidden bg-line/30">
              {post.coverImage && (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="33vw"
                />
              )}
            </div>
            <h2 className="mt-3 font-display text-2xl group-hover:text-accent">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
