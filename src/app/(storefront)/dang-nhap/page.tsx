import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export const metadata = { title: "Đăng nhập" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl = "/", error } = await searchParams;
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : callbackUrl);
  }

  async function loginAction(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        redirectTo: String(formData.get("callbackUrl") || "/"),
      });
    } catch (e) {
      throw e;
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-5xl">Đăng nhập</h1>
      <p className="mt-2 text-sm text-muted">
        Admin demo: admin@lunara.vn / admin123
      </p>
      {error && (
        <p className="mt-4 text-sm text-sale">Đăng nhập thất bại. Thử lại.</p>
      )}
      <form action={loginAction} className="mt-8 space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Mật khẩu"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <button type="submit" className="w-full bg-ink py-3 text-sm text-white uppercase">
          Đăng nhập
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="text-accent underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
