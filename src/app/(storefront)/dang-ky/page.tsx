import Link from "next/link";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";

export const metadata = { title: "Đăng ký" };

export default function RegisterPage() {
  async function registerAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "").toLowerCase();
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "");
    const phone = String(formData.get("phone") || "") || undefined;

    if (password.length < 6) throw new Error("Mật khẩu tối thiểu 6 ký tự");

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error("Email đã tồn tại");

    await prisma.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash: await bcrypt.hash(password, 10),
        role: "CUSTOMER",
      },
    });

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-5xl">Đăng ký</h1>
      <form action={registerAction} className="mt-8 space-y-4">
        <input
          name="name"
          required
          placeholder="Họ tên"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <input
          name="phone"
          placeholder="Số điện thoại"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Mật khẩu"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <button type="submit" className="w-full bg-ink py-3 text-sm text-white uppercase">
          Tạo tài khoản
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="text-accent underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
