import { PageShell } from "@/components/page-shell";
import { PanelCard } from "@/components/ui/stat-card";
import { Users } from "lucide-react";
import { getUsers, type AppUser } from "@/lib/api";
import { KullaniciList } from "./kullanici-list";
import { KullaniciWorkspace } from "./kullanici-workspace";

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
      <PanelCard icon={Users} title="Kullanıcılar" description="Sistem kullanıcılarını yönetin" accent="indigo">
        <KullaniciWorkspace>
          <KullaniciList rows={rows} />
        </KullaniciWorkspace>
      </PanelCard>
    </PageShell>
  );
}
