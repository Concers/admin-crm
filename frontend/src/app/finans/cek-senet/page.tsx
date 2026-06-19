import { PageShell } from "@/components/page-shell";
import { getAccounts, getPartners, getPaymentInstruments } from "@/lib/api";
import { CekSenetWorkspace } from "./cek-senet-workspace";

export const dynamic = "force-dynamic";

export default async function CekSenetPage() {
  const [instruments, partners, accounts] = await Promise.all([
    getPaymentInstruments(),
    getPartners(),
    getAccounts(),
  ]);

  return (
    <PageShell
      title="Çek / Senet Portföyü"
      description="Alacak ve borç çek/senetlerini vade ve durum bazında takip edin"
    >
      <CekSenetWorkspace
        rows={instruments}
        partners={partners.map((p) => ({ name: p.name, type: p.type }))}
        accounts={accounts}
      />
    </PageShell>
  );
}
