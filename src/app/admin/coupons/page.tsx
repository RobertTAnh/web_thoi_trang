import { prisma } from "@/lib/db";
import { saveCouponAction } from "@/app/admin/actions";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-4xl">Mã giảm giá</h1>
        <div className="mt-6 space-y-3">
          {coupons.map((c) => (
            <div key={c.id} className="border border-line bg-white p-4 text-sm">
              <p className="font-medium">{c.code}</p>
              <p className="text-muted">{c.description}</p>
              <p className="mt-1 text-xs">
                {c.percentOff ? `-${c.percentOff}%` : ""}{" "}
                {c.freeShip ? "Freeship" : ""} · min {c.minOrder} ·{" "}
                {c.active ? "Active" : "Off"}
              </p>
            </div>
          ))}
        </div>
      </div>
      <form action={saveCouponAction} className="h-fit space-y-3 border border-line bg-white p-5 text-sm">
        <h2 className="font-display text-2xl">Thêm / cập nhật</h2>
        <input name="code" required placeholder="CODE" className="w-full border border-line px-3 py-2" />
        <input name="description" placeholder="Mô tả" className="w-full border border-line px-3 py-2" />
        <input name="percentOff" type="number" placeholder="% giảm" className="w-full border border-line px-3 py-2" />
        <input name="minOrder" type="number" placeholder="Đơn tối thiểu" className="w-full border border-line px-3 py-2" />
        <input name="maxDiscount" type="number" placeholder="Giảm tối đa" className="w-full border border-line px-3 py-2" />
        <label className="flex items-center gap-2">
          <input name="freeShip" type="checkbox" /> Freeship
        </label>
        <label className="flex items-center gap-2">
          <input name="active" type="checkbox" defaultChecked /> Active
        </label>
        <button type="submit" className="w-full bg-ink py-2 text-white">
          Lưu
        </button>
      </form>
    </div>
  );
}
