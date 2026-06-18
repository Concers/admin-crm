import { PageShell } from "@/components/page-shell";
import { DataTable } from "@/components/data-table";
import { getAuditLogs } from "@/lib/api";
import { formatDate } from "@/lib/calculations";

export const dynamic = "force-dynamic";

const ISLEM_LABEL: Record<string, string> = {
  CREATE: "Ekleme",
  UPDATE: "Güncelleme",
  DELETE: "Silme",
};

export default async function IslemGecmisiPage() {
  const logs = await getAuditLogs(200);
  const rows = logs.map((log) => ({
    tarih: formatDate(new Date(log.createdAt)),
    kullanici: log.user?.name ?? "-",
    islem: ISLEM_LABEL[log.action] ?? log.action,
    kayit: log.entityName,
    detay: log.details ?? "",
  }));

  return (
    <PageShell title="İşlem Geçmişi (Audit Log)">
      <DataTable
        rows={rows}
        searchKeys={["kullanici", "kayit", "detay"]}
        searchPlaceholder="Kullanıcı veya kayıt ara…"
        defaultSort={{ key: "tarih", asc: false }}
        columns={[
          { key: "tarih", label: "Tarih" },
          { key: "kullanici", label: "Kullanıcı" },
          { key: "islem", label: "İşlem" },
          { key: "kayit", label: "Kayıt" },
          { key: "detay", label: "Detay" },
        ]}
      />
    </PageShell>
  );
}
