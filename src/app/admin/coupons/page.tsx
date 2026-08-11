import { prisma } from "@/lib/db";
import { formatVnd } from "@/lib/utils";
import { deleteCouponAction, saveCouponAction } from "@/app/admin/actions";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-4xl">Mã giảm giá</h1>
      <p className="mt-2 text-sm text-muted">
        Mã active sẽ hiện trên trang sản phẩm (nút Áp dụng). Khách dùng khi thanh toán.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-[#faf7f5]">
              <tr>
                <th className="px-3 py-3">Mã</th>
                <th className="px-3 py-3">Mô tả / ưu đãi</th>
                <th className="px-3 py-3">Đơn tối thiểu</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-line">
                  <td className="px-3 py-3 font-semibold">{c.code}</td>
                  <td className="px-3 py-3">
                    <p>{c.description || "—"}</p>
                    <p className="text-xs text-muted">
                      {c.percentOff ? `-${c.percentOff}%` : ""}
                      {c.amountOff ? ` -${formatVnd(c.amountOff)}` : ""}
                      {c.freeShip ? " · Freeship" : ""}
                      {c.maxDiscount ? ` · max ${formatVnd(c.maxDiscount)}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    {c.minOrder > 0 ? formatVnd(c.minOrder) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    {c.active ? (
                      <span className="text-accent">Active</span>
                    ) : (
                      <span className="text-muted">Off</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <form action={deleteCouponAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-xs text-sale">
                        Xóa
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-muted">
                    Chưa có mã. Thêm ở form bên phải — sẽ hiện trên trang SP.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form
          action={saveCouponAction}
          className="h-fit space-y-3 border border-line bg-white p-5 text-sm"
        >
          <h2 className="font-display text-2xl">Thêm / cập nhật mã</h2>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Mã (vd: TISORA10)</span>
            <input
              name="code"
              required
              placeholder="CODE"
              className="w-full border border-line px-3 py-2 uppercase"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Mô tả hiện trên web</span>
            <input
              name="description"
              placeholder="Nhập mã … giảm …"
              className="w-full border border-line px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="text-xs text-muted">% giảm</span>
              <input
                name="percentOff"
                type="number"
                placeholder="10"
                className="w-full border border-line px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-muted">Giảm cố định (đ)</span>
              <input
                name="amountOff"
                type="number"
                placeholder="50000"
                className="w-full border border-line px-3 py-2"
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Đơn tối thiểu (đ)</span>
            <input
              name="minOrder"
              type="number"
              placeholder="0"
              className="w-full border border-line px-3 py-2"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Giảm tối đa (đ, nếu % )</span>
            <input
              name="maxDiscount"
              type="number"
              placeholder=""
              className="w-full border border-line px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2">
            <input name="freeShip" type="checkbox" /> Freeship
          </label>
          <label className="flex items-center gap-2">
            <input name="active" type="checkbox" defaultChecked /> Hiển thị / Active
          </label>
          <button type="submit" className="w-full bg-ink py-2 text-white">
            Lưu mã
          </button>
        </form>
      </div>
    </div>
  );
}
