import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCart, cartTotals } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { MobileNav } from "@/components/store/MobileNav";
import { ScrollAwareHeader } from "@/components/store/ScrollAwareHeader";

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
    <ScrollAwareHeader>
      <div className="container-ega relative flex h-[66px] items-center justify-between gap-2 border-x-4 border-transparent px-2 lg:h-[78px] lg:max-w-none lg:gap-8 lg:border-0 lg:px-7">
        <div className="relative z-[60] flex w-11 shrink-0 items-center lg:order-2 lg:w-auto lg:flex-1 lg:justify-center">
          <MobileNav
            categories={categories}
            accountHref={accountHref}
            accountLabel={accountLabel}
          />
          <nav className="hidden items-center justify-center gap-8 text-[15px] font-medium lg:flex xl:gap-10 xl:text-[16px]">
            <Link href="/" className="hover:text-accent">
              Trang chủ
            </Link>
            <div className="group relative">
              <Link href="/collections" className="hover:text-accent">
                Sản phẩm <span className="ml-1">⌄</span>
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
              <span className="mr-1 text-xl text-[#f3a032]">ϟ</span> Chương trình khuyến mãi <span className="ml-1">⌄</span>
            </Link>
            <Link href={session?.user?.role === "ADMIN" ? "/admin/orders" : "/tai-khoan"} className="hover:text-accent">
              Đơn hàng
            </Link>
            <Link href="/lien-he" className="hover:text-accent">
              Hệ thống cửa hàng
            </Link>
          </nav>
        </div>

        <Link
          href="/"
          className="pointer-events-auto absolute left-1/2 z-10 -translate-x-1/2 font-serif text-[31px] font-bold tracking-[0.04em] uppercase sm:text-[34px] lg:static lg:order-1 lg:z-auto lg:w-[185px] lg:translate-x-0 lg:text-left lg:font-serif lg:text-[38px] lg:normal-case lg:tracking-[0.01em]"
        >
          {brand}
        </Link>

        <div className="relative z-50 flex flex-1 items-center justify-end gap-3 text-[13px] lg:order-3 lg:w-[170px] lg:flex-none lg:gap-5">
          <Link href="/collections" className="relative flex size-10 items-center justify-center" aria-label="Tìm kiếm sản phẩm">
            <span className="block size-[23px] rounded-full border-[2.5px] border-ink after:absolute after:top-[27px] after:left-[27px] after:h-[10px] after:w-[2.5px] after:-rotate-45 after:bg-ink" />
          </Link>
          <Link href={accountHref} className="relative hidden size-10 items-center justify-center lg:flex" aria-label={accountLabel}>
            <span className="absolute top-[5px] size-[13px] rounded-full border-[2.5px] border-ink" />
            <span className="absolute bottom-[4px] h-[15px] w-[23px] rounded-t-full border-[2.5px] border-b-0 border-ink" />
          </Link>
          <Link
            href="/gio-hang"
            className="relative flex size-10 items-center justify-center font-medium hover:text-accent"
            aria-label={`Giỏ hàng có ${count} sản phẩm`}
          >
            <span className="relative block h-[25px] w-[22px] rounded-sm border-2 border-ink before:absolute before:-top-[7px] before:left-1/2 before:h-[9px] before:w-[10px] before:-translate-x-1/2 before:rounded-t-full before:border-2 before:border-b-0 before:border-ink" />
            <span className="absolute top-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </ScrollAwareHeader>
  );
}
