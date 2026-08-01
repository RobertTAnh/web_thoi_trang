import { prisma } from "@/lib/db";
import { saveFlashSaleAction } from "@/app/admin/actions";

export default async function AdminFlashSalesPage() {
  const sales = await prisma.flashSale.findMany({ orderBy: { endsAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-4xl">Flash sale</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {sales.map((s) => (
            <div key={s.id} className="border border-line bg-white p-4 text-sm">
              <p className="font-medium">{s.title}</p>
              <p className="text-muted">
                -{s.percentOff}% · {s.active ? "Active" : "Off"}
              </p>
              <p className="text-xs text-muted">
                {s.startsAt.toLocaleString("vi-VN")} → {s.endsAt.toLocaleString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
        <form action={saveFlashSaleAction} className="space-y-3 border border-line bg-white p-5 text-sm">
          <h2 className="font-display text-2xl">Tạo flash sale</h2>
          <input name="title" required placeholder="Tiêu đề" className="w-full border border-line px-3 py-2" />
          <input name="percentOff" type="number" defaultValue={50} className="w-full border border-line px-3 py-2" />
          <input name="startsAt" type="datetime-local" required className="w-full border border-line px-3 py-2" />
          <input name="endsAt" type="datetime-local" required className="w-full border border-line px-3 py-2" />
          <input
            name="tabLabels"
            placeholder="Tab1, Tab2, Tab3"
            className="w-full border border-line px-3 py-2"
          />
          <label className="flex items-center gap-2">
            <input name="active" type="checkbox" defaultChecked /> Active
          </label>
          <button type="submit" className="w-full bg-ink py-2 text-white">
            Lưu
          </button>
        </form>
      </div>
    </div>
  );
}
