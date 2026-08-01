const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Tisora";

export const metadata = { title: "Giới thiệu" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-5xl">Giới thiệu {brand}</h1>
      <p className="mt-6 text-sm leading-7 text-muted">
        {brand} là thương hiệu thời trang nữ chú trọng form dáng tinh tế và chất liệu
        chọn lọc. Chúng tôi mang đến những thiết kế phù hợp cho công sở, tiệc tối và
        đời sống thường nhật — đồng thời kết nối kho hàng với hệ thống Sapo để đảm bảo
        tồn kho chính xác.
      </p>
    </div>
  );
}
