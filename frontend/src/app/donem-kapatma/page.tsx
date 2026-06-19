import { Lock } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getPeriodLocks } from "@/lib/api";
import { DonemKapatmaWorkspace } from "./donem-workspace";

export const dynamic = "force-dynamic";

export default async function DonemKapatmaPage() {
  const locks = await getPeriodLocks();

  return (
    <PageShell title="Dönem Kapatma" description="Muhasebe dönemlerini kilitleyin — kilitli dönemde işlem yapılamaz">
      <Card className="border-amber-100 bg-amber-50/40 shadow-sm">
        <CardContent className="flex gap-3 py-4 text-sm text-amber-950/80">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p>
            Kilitli bir yıl veya aya ait tarihli satış, alım, gider ve tahsilat kayıtları eklenemez veya
            güncellenemez. Kullanıcı arayüzünde <strong>423 period_locked</strong> hatası net bir mesajla
            gösterilir.
          </p>
        </CardContent>
      </Card>
      <DonemKapatmaWorkspace locks={locks} />
    </PageShell>
  );
}
