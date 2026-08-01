import { prisma } from "@/lib/db";
import { revokeApiKeyAction } from "@/app/admin/actions";
import { ApiKeyForm } from "@/components/admin/ApiKeyForm";

export default async function AdminApiKeysPage() {
  const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-4xl">API Keys</h1>
        <p className="mt-2 text-sm text-muted">
          Dùng header <code>Authorization: Bearer &lt;key&gt;</code> để gọi{" "}
          <code>/api/v1/*</code>
        </p>
        <div className="mt-6 space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between border border-line bg-white p-4 text-sm"
            >
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-xs text-muted">
                  {key.prefix}… · {key.revokedAt ? "Revoked" : "Active"}
                  {key.lastUsedAt
                    ? ` · last used ${key.lastUsedAt.toLocaleString("vi-VN")}`
                    : ""}
                </p>
              </div>
              {!key.revokedAt && (
                <form action={revokeApiKeyAction}>
                  <input type="hidden" name="id" value={key.id} />
                  <button type="submit" className="text-sale">
                    Thu hồi
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
      <ApiKeyForm />
    </div>
  );
}
