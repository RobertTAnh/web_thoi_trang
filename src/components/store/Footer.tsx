import Link from "next/link";

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "LUNARA";
const hotline = process.env.NEXT_PUBLIC_HOTLINE || "19006750";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <p className="font-display text-3xl tracking-[0.16em]">{brand}</p>
          <p className="mt-4 text-sm text-white/70">
            Thời trang nữ hiện đại — form dáng tinh tế, chất liệu chọn lọc.
          </p>
          <p className="mt-4 text-sm text-white/70">Hotline: {hotline}</p>
          <p className="text-sm text-white/70">Email: hello@lunara.vn</p>
        </div>
        <div>
          <h4 className="mb-3 text-xs tracking-[0.2em] uppercase">Chính sách</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <Link href="/gioi-thieu">Giới thiệu</Link>
            </li>
            <li>
              <Link href="/lien-he">Hệ thống cửa hàng</Link>
            </li>
            <li>
              <Link href="/lien-he">Câu hỏi thường gặp</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs tracking-[0.2em] uppercase">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm text-white/75">
            <li>Chính sách giao hàng</li>
            <li>Chính sách đổi hàng</li>
            <li>Chính sách bán hàng</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs tracking-[0.2em] uppercase">Đăng ký nhận tin</h4>
          <p className="mb-3 text-sm text-white/70">
            Nhận ưu đãi đặc biệt từ {brand}.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Email của bạn"
              className="w-full rounded-sm border border-white/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="rounded-sm bg-white px-4 py-2 text-sm text-ink"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {brand}. All rights reserved.
      </div>
    </footer>
  );
}
