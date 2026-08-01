import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";

export const metadata = { title: "Tài khoản" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/dang-nhap?callbackUrl=/tai-khoan");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-5xl">Tài khoản</h1>
          <p className="mt-2 text-sm text-muted">{session.user.email}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-accent underline">
            Đăng xuất
          </button>
        </form>
      </div>
      {session.user.role === "ADMIN" && (
        <Link href="/admin" className="mt-4 inline-block text-sm text-accent underline">
          Vào trang quản trị
        </Link>
      )}
      <h2 className="mt-10 font-display text-3xl">Đơn hàng của bạn</h2>
      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex justify-between border border-line p-4 text-sm">
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="text-muted">{order.status}</p>
            </div>
            <p>{formatVnd(order.total)}</p>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted">Chưa có đơn hàng.</p>}
      </div>
    </div>
  );
}
