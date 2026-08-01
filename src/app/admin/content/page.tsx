import { prisma } from "@/lib/db";
import { saveBlogAction } from "@/app/admin/actions";

export default async function AdminContentPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-4xl">Nội dung / Blog</h1>
        <div className="mt-6 space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="border border-line bg-white p-4 text-sm">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted">/{p.slug}</p>
            </div>
          ))}
        </div>
      </div>
      <form action={saveBlogAction} className="h-fit space-y-3 border border-line bg-white p-5 text-sm">
        <h2 className="font-display text-2xl">Thêm bài viết</h2>
        <input name="title" required placeholder="Tiêu đề" className="w-full border border-line px-3 py-2" />
        <input name="slug" placeholder="slug" className="w-full border border-line px-3 py-2" />
        <input name="excerpt" placeholder="Mô tả ngắn" className="w-full border border-line px-3 py-2" />
        <input name="coverImage" placeholder="URL ảnh cover" className="w-full border border-line px-3 py-2" />
        <textarea
          name="content"
          required
          rows={6}
          placeholder="Nội dung"
          className="w-full border border-line px-3 py-2"
        />
        <label className="flex items-center gap-2">
          <input name="published" type="checkbox" defaultChecked /> Xuất bản
        </label>
        <button type="submit" className="w-full bg-ink py-2 text-white">
          Lưu
        </button>
      </form>
    </div>
  );
}
