import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/customers", label: "Khách hàng" },
  { href: "/admin/crm", label: "CRM / Lợi nhuận" },
  { href: "/admin/coupons", label: "Mã giảm giá" },
  { href: "/admin/flash-sales", label: "Flash sale" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/content", label: "Nội dung" },
  { href: "/admin/instagram-reels", label: "Instagram Reels" },
  { href: "/admin/api-keys", label: "API Keys" },
  { href: "/admin/settings/sapo", label: "Sapo Sync" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dang-nhap?callbackUrl=/admin");
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-[#f3f1ef] text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-line bg-white md:block">
          <div className="border-b border-line px-5 py-5">
            <Link href="/admin" className="font-display text-2xl tracking-[0.14em]">
              TISORA
            </Link>
            <p className="mt-1 text-xs text-muted">Admin Panel</p>
          </div>
          <nav className="space-y-1 p-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded px-3 py-2 text-sm hover:bg-accent-soft/40"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/" className="block rounded px-3 py-2 text-sm text-muted hover:bg-accent-soft/40">
              ← Xem storefront
            </Link>
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 md:px-6">
            <p className="text-sm text-muted md:hidden">Tisora Admin</p>
            <p className="text-sm">{session.user.email}</p>
            <form action={logout}>
              <button type="submit" className="text-sm text-accent">
                Đăng xuất
              </button>
            </form>
          </header>
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
