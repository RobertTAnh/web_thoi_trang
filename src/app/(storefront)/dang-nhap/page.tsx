import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/lib/auth";

export const metadata = { title: "Đăng nhập" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl = "/", error } = await searchParams;

  // Tránh vòng lặp: chỉ redirect admin khi callback không phải /admin
  // (middleware và session phải đồng bộ; nếu vào /admin đã OK thì redirect)
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }
  if (session?.user && !callbackUrl.startsWith("/admin")) {
    redirect(callbackUrl || "/");
  }

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const next = String(formData.get("callbackUrl") || "/");
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: next.startsWith("/") ? next : "/",
      });
    } catch (e) {
      if (e instanceof AuthError) {
        redirect(`/dang-nhap?error=CredentialsSignin&callbackUrl=${encodeURIComponent(next)}`);
      }
      throw e;
    }
  }

  return (
    <div className="container-ega flex min-h-[60vh] max-w-md flex-col justify-center py-16">
      <h1 className="text-3xl font-bold">Đăng nhập</h1>
      <p className="mt-2 text-[13px] text-muted">
        Admin demo: <b>admin@tisora.vn</b> / <b>admin123</b>
        <br />
        (hoặc admin@lunara.vn / admin123 nếu DB cũ)
      </p>
      {error && (
        <p className="mt-4 text-[13px] text-sale">
          Đăng nhập thất bại. Kiểm tra email/mật khẩu.
        </p>
      )}
      <form action={loginAction} className="mt-8 space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <input
          name="email"
          type="email"
          required
          defaultValue="admin@tisora.vn"
          placeholder="Email"
          className="w-full border border-line bg-white px-3 py-3 text-[14px]"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Mật khẩu"
          className="w-full border border-line bg-white px-3 py-3 text-[14px]"
        />
        <button type="submit" className="btn-primary w-full py-3 text-[13px]">
          Đăng nhập
        </button>
      </form>
      <p className="mt-6 text-[13px] text-muted">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="text-accent underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
