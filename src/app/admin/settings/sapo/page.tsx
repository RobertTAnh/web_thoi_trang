import { prisma } from "@/lib/db";
import { getSapoCredentials } from "@/lib/sapo/settings";
import { SapoSettingsForm } from "@/components/admin/SapoSettingsForm";

export default async function SapoSettingsPage() {
  const creds = await getSapoCredentials();
  const logs = await prisma.syncLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Sapo Sync</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Sapo là nguồn sự thật về kho. Sync sản phẩm về web; đơn thành công trên web sẽ
        được đẩy sang Sapo để trừ tồn.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <SapoSettingsForm
          storeUrl={creds.storeUrl}
          hasToken={Boolean(creds.token)}
        />
        <section className="border border-line bg-white p-5">
          <h2 className="font-display text-2xl">Sync logs</h2>
          <ul className="mt-4 max-h-[480px] space-y-3 overflow-auto text-sm">
            {logs.map((log) => (
              <li key={log.id} className="border-b border-line pb-2">
                <p className="font-medium">
                  {log.type} · {log.status}
                </p>
                <p className="text-muted">{log.message}</p>
                <p className="text-xs text-muted">
                  {log.createdAt.toLocaleString("vi-VN")}
                </p>
              </li>
            ))}
            {logs.length === 0 && <li className="text-muted">Chưa có log.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
