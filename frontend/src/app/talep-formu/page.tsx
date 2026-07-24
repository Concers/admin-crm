import Link from "next/link";
import { ArrowRight, Factory, FileText, Truck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRequestForms, type RequestFormDoc } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  SENT: "Gönderildi",
  FULFILLED: "Karşılandı",
  CANCELLED: "İptal",
};
const STATUS_TONE: Record<string, "default" | "blue" | "green" | "red"> = {
  DRAFT: "default",
  SENT: "blue",
  FULFILLED: "green",
  CANCELLED: "red",
};

function FormCard({ f }: { f: RequestFormDoc }) {
  return (
    <Link href={`/talep-formu/${f.id}`} className="group">
      <Card className="h-full transition-colors group-hover:border-[var(--primary)]">
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium">TF-{String(f.id).padStart(5, "0")}</span>
            <Badge tone={STATUS_TONE[f.status] ?? "default"}>{STATUS_LABEL[f.status] ?? f.status}</Badge>
          </div>
          <p className="truncate text-sm">{f.partner.name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {formatDate(f.date)} · {f.lines.length} kalem
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function TalepFormuListPage() {
  const forms = await getRequestForms();
  const production = forms.filter((f) => f.type === "PRODUCTION");
  const procurement = forms.filter((f) => f.type === "PROCUREMENT");

  return (
    <PageShell
      title="Talep Formları"
      description="Üretim ve tedarik talep formları"
      actions={
        <Link
          href="/tedarik-emri"
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
        >
          <Truck className="h-4 w-4" /> Yeni Tedarik Emri
        </Link>
      }
    >
      {forms.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">
          Henüz talep formu yok. Üretim Emri sayfasından üretim talebi, Tedarik Emri sayfasından tedarik
          talebi oluşturabilirsiniz.
        </p>
      )}

      {production.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h2 className="text-base font-semibold">Üretim Talepleri</h2>
            <span className="text-xs text-[var(--muted-foreground)]">({production.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {production.map((f) => (
              <FormCard key={f.id} f={f} />
            ))}
          </div>
        </section>
      )}

      {procurement.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h2 className="text-base font-semibold">Tedarik Talepleri</h2>
            <span className="text-xs text-[var(--muted-foreground)]">({procurement.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {procurement.map((f) => (
              <FormCard key={f.id} f={f} />
            ))}
          </div>
        </section>
      )}

      <p className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
        <FileText className="h-3.5 w-3.5" /> Üretim talepleri Üretim Emri sayfasındaki{" "}
        <ArrowRight className="h-3 w-3" /> &quot;Talep Formu Oluştur&quot; ile üretilir.
      </p>
    </PageShell>
  );
}
