import { HOTLINE_DISPLAY, STORE_ADDRESS, hotlineTel } from "@/lib/contact";

const hotline = HOTLINE_DISPLAY;
const tel = hotlineTel(hotline);

export const metadata = { title: "Liên hệ" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Liên hệ</h1>
      <div className="mt-8 space-y-3 text-sm text-muted">
        <p>
          Hotline:{" "}
          <a href={`tel:${tel}`} className="font-medium text-ink hover:text-accent">
            {hotline}
          </a>
        </p>
        <p>Địa chỉ: {STORE_ADDRESS}</p>
      </div>
      <form className="mt-10 space-y-4">
        <input
          placeholder="Họ tên"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <textarea
          rows={4}
          placeholder="Nội dung"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <button type="button" className="bg-ink px-6 py-3 text-sm text-white uppercase">
          Gửi liên hệ
        </button>
      </form>
    </div>
  );
}
