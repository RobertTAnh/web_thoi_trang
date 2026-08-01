import Link from "next/link";

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Tisora";
const hotline = process.env.NEXT_PUBLIC_HOTLINE || "19006750";

export function Footer() {
  return (
    <footer className="mt-16 bg-footer text-white">
      <div className="container-ega grid gap-10 py-12 md:grid-cols-4">
        <div>
          <p className="text-2xl font-bold tracking-wide uppercase">{brand}</p>
          <p className="mt-4 text-[13px] leading-6 text-white/70">
            Địa chỉ: 70 Lữ Gia, Quận 11, TP. Hồ Chí Minh
          </p>
          <p className="mt-2 text-[13px] text-white/70">
            Số điện thoại: {hotline}
          </p>
          <p className="text-[13px] text-white/70">Email: hello@tisora.vn</p>
        </div>
        <div>
          <h4 className="mb-4 text-[13px] font-semibold tracking-wider uppercase">
            Chính sách
          </h4>
          <ul className="space-y-2 text-[13px] text-white/75">
            <li>
              <Link href="/gioi-thieu" className="hover:text-accent">
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="hover:text-accent">
                Hệ thống cửa hàng
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="hover:text-accent">
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <a href={`tel:${hotline}`} className="hover:text-accent">
                Gọi điện đặt hàng
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-[13px] font-semibold tracking-wider uppercase">
            Hỗ trợ khách hàng
          </h4>
          <ul className="space-y-2 text-[13px] text-white/75">
            <li>Thông tin liên hệ</li>
            <li>Chính sách giao hàng</li>
            <li>Chính sách đổi hàng</li>
            <li>Chính sách bán hàng</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-[13px] font-semibold tracking-wider uppercase">
            Đăng ký nhận tin
          </h4>
          <p className="mb-3 text-[13px] text-white/70">
            Bạn có muốn nhận khuyến mãi đặc biệt? Đăng ký ngay.
          </p>
          <form className="flex gap-0">
            <input
              type="email"
              placeholder="Email của bạn"
              className="w-full border-0 bg-white px-3 py-2.5 text-[13px] text-ink outline-none"
            />
            <button type="submit" className="btn-primary shrink-0 px-4 py-2.5 text-[12px]">
              Đăng ký
            </button>
          </form>
          <div className="mt-4 flex gap-3 text-[12px] text-white/60">
            <span>Facebook</span>
            <span>Zalo</span>
            <span>Instagram</span>
            <span>TikTok</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[12px] text-white/50">
        © {new Date().getFullYear()} Bản quyền thuộc về {brand}
      </div>
    </footer>
  );
}
