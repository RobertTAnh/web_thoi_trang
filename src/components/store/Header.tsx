import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCart, cartTotals } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { MobileNav } from "@/components/store/MobileNav";

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Tisora";

export async function Header() {
  const session = await auth();
  const cart = await getCart();
  const { count } = cartTotals(cart.items);
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  const accountHref = session?.user
    ? session.user.role === "ADMIN"
      ? "/admin"
      : "/tai-khoan"
    : "/dang-nhap";
  const accountLabel = session?.user
    ? session.user.role === "ADMIN"
      ? "Admin"
      : "Tài khoản"
    : "Đăng nhập";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="container-ega relative flex h-[66px] items-center justify-between gap-2 border-x-4 border-transparent px-2 lg:h-[70px] lg:gap-3 lg:border-0">
        <div className="relative z-[60] flex w-11 shrink-0 items-center lg:w-auto lg:flex-1">
          <MobileNav
            categories={categories}
            accountHref={accountHref}
            accountLabel={accountLabel}
          />
          <nav className="hidden flex-1 items-center gap-5 text-[13px] font-medium uppercase lg:flex">
            <Link href="/" className="hover:text-accent">
              Trang chủ
            </Link>
            <div className="group relative">
              <Link href="/collections" className="hover:text-accent">
                Sản phẩm ▾
              </Link>
              <div className="invisible absolute left-0 top-full z-50 w-[560px] border border-line bg-white p-5 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted uppercase">
                  Thời trang nữ
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/collections/${c.slug}`}
                      className="rounded px-2 py-1.5 text-[13px] font-normal normal-case hover:bg-accent-soft hover:text-accent"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/collections/all"
                  className="mt-3 inline-block text-[12px] text-accent normal-case"
                >
                  Xem tất cả sản phẩm →
                </Link>
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
        </div>

        <Link
          href="/"
          className="pointer-events-auto absolute left-1/2 z-10 -translate-x-1/2 font-serif text-[31px] font-bold tracking-[0.04em] uppercase sm:text-[34px] lg:static lg:z-auto lg:translate-x-0 lg:font-sans lg:text-[28px] lg:tracking-[0.08em]"
        >
          {brand}
        </Link>

        <div className="relative z-50 flex flex-1 items-center justify-end gap-3 text-[13px] lg:gap-4">
          {session?.user ? (
            <Link
              href={session.user.role === "ADMIN" ? "/admin" : "/tai-khoan"}
              className="hidden hover:text-accent sm:inline"
            >
              {session.user.role === "ADMIN" ? "Admin" : "Tài khoản"}
            </Link>
          ) : (
            <>
              <Link href="/dang-nhap" className="hidden hover:text-accent sm:inline">
                Đăng nhập
              </Link>
              <Link href="/dang-ky" className="hidden hover:text-accent md:inline">
                Đăng ký
              </Link>
            </>
          )}
          <Link href="/collections" className="relative flex size-10 items-center justify-center lg:hidden" aria-label="Tìm kiếm sản phẩm">
            <span className="block size-[23px] rounded-full border-[2.5px] border-ink after:absolute after:top-[27px] after:left-[27px] after:h-[10px] after:w-[2.5px] after:-rotate-45 after:bg-ink" />
          </Link>
          <Link
            href="/gio-hang"
            className="relative flex size-10 items-center justify-center font-medium hover:text-accent lg:w-auto lg:gap-1"
            aria-label={`Giỏ hàng có ${count} sản phẩm`}
          >
            <span className="relative block h-[25px] w-[22px] rounded-sm border-2 border-ink before:absolute before:-top-[7px] before:left-1/2 before:h-[9px] before:w-[10px] before:-translate-x-1/2 before:rounded-t-full before:border-2 before:border-b-0 before:border-ink lg:hidden" />
            <span className="hidden lg:inline">Giỏ hàng</span>
            <span className="absolute top-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-white lg:static">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
