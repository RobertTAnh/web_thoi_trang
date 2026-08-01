import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCart, cartTotals } from "@/lib/cart";
import { prisma } from "@/lib/db";

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "LUNARA";

export async function Header() {
  const session = await auth();
  const cart = await getCart();
  const { count } = cartTotals(cart.items);
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <nav className="hidden items-center gap-5 text-sm text-ink lg:flex">
          <Link href="/" className="hover:text-accent">
            Trang chủ
          </Link>
          <div className="group relative">
            <Link href="/collections" className="hover:text-accent">
              Sản phẩm
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-[520px] translate-y-2 rounded-md border border-line bg-surface p-5 opacity-0 shadow-lg transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-3">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/collections/${c.slug}`}
                    className="rounded px-2 py-1.5 text-sm hover:bg-accent-soft/50"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/#flash-sale" className="hover:text-accent">
            Khuyến mãi
          </Link>
          <Link href="/tin-tuc" className="hover:text-accent">
            Tin tức
          </Link>
          <Link href="/lien-he" className="hover:text-accent">
            Liên hệ
          </Link>
        </nav>

        <Link
          href="/"
          className="font-display text-3xl tracking-[0.18em] text-ink md:text-4xl"
        >
          {brand}
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <Link href={session.user.role === "ADMIN" ? "/admin" : "/tai-khoan"} className="hover:text-accent">
              {session.user.role === "ADMIN" ? "Admin" : "Tài khoản"}
            </Link>
          ) : (
            <Link href="/dang-nhap" className="hover:text-accent">
              Đăng nhập
            </Link>
          )}
          <Link
            href="/gio-hang"
            className="relative rounded-full border border-ink px-3 py-1.5 hover:bg-ink hover:text-white"
          >
            Giỏ hàng
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
