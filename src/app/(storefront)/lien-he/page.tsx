const hotline = process.env.NEXT_PUBLIC_HOTLINE || "19006750";

export const metadata = { title: "Liên hệ" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Liên hệ</h1>
      <div className="mt-8 space-y-3 text-sm text-muted">
        <p>Hotline: {hotline}</p>
        <p>Email: hello@tisora.vn</p>
        <p>Địa chỉ: 70 Lữ Gia, Quận 11, TP. Hồ Chí Minh</p>
      </div>
      <form className="mt-10 space-y-4">
        <input
          placeholder="Họ tên"
          className="w-full border border-line bg-surface px-3 py-3 text-sm"
        />
        <input
          type="email"
          placeholder="Email"
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
