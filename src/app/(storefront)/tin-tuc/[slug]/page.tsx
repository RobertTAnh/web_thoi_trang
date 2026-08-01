import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <p className="text-xs tracking-[0.16em] text-muted uppercase">
        {post.readingMins} phút đọc
      </p>
      <h1 className="mt-3 font-display text-5xl">{post.title}</h1>
      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="800px" />
        </div>
      )}
      <div className="prose mt-8 max-w-none text-sm leading-7 text-muted whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
