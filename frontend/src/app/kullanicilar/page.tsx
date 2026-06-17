import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getUsers, type AppUser } from "@/lib/api";
import { KullaniciForm } from "./kullanici-form";
import { KullaniciList } from "./kullanici-list";

export const dynamic = "force-dynamic";

const ROL_LABEL: Record<AppUser["role"], string> = {
  ADMIN: "Yönetici",
  SALES_REP: "Satış Temsilcisi",
  WAREHOUSE_MANAGER: "Depo Sorumlusu",
};

type Row = {
  id: number;
  ad: string;
  eposta: string;
  rol: string;
  durum: string;
};

export default async function KullanicilarPage() {
  const users = await getUsers();
  const rows: Row[] = users.map((u) => ({
    id: u.id,
    ad: u.name,
    eposta: u.email,
    rol: ROL_LABEL[u.role] ?? u.role,
    durum: u.isActive ? "Aktif" : "Pasif",
  }));

  return (
    <PageShell title="Kullanıcı Yönetimi">
      <Card><CardContent>
        <h3 className="mb-4 font-semibold">Yeni Kullanıcı</h3>
        <KullaniciForm />
      </CardContent></Card>
      <KullaniciList rows={rows} />
    </PageShell>
  );
}
