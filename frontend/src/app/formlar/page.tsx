import Link from "next/link";
import { ArrowRight, FileSignature, FileText, Send } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getForms } from "@/lib/api";
import { FORM_KINDS, FORM_KIND_LABEL, FORM_STATUS_LABEL } from "@/lib/form-kinds";
import { formatDate } from "@/lib/utils";
import { YeniFormButton } from "./yeni-form-button";

export const dynamic = "force-dynamic";

export default async function FormlarPage() {
  const forms = await getForms();

  return (
    <PageShell title="Formlar" description="Belge şablonları — başlığı oluştur, içeriği sonra doldur">
      {/* Mevcut modüllere köprü */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/belgeler/teklif" className="group">
          <Card className="h-full transition-colors group-hover:border-[var(--primary)]">
            <CardContent className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4 text-[var(--muted-foreground)]" /> Teklif Formu
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/talep-formu" className="group">
          <Card className="h-full transition-colors group-hover:border-[var(--primary)]">
            <CardContent className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <Send className="h-4 w-4 text-[var(--muted-foreground)]" /> Talep Formu
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Genel form tipleri */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FORM_KINDS.map((k) => (
          <Card key={k.kind}>
            <CardContent className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-2 font-medium">
                  <FileSignature className="h-4 w-4 text-[var(--muted-foreground)]" />
                  {k.label}
                </span>
                <YeniFormButton kind={k.kind} label={k.label} />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">{k.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Oluşturulmuş formlar */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Oluşturulan Formlar</h2>
        {forms.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Henüz form yok. Yukarıdaki tiplerden &quot;Yeni&quot; ile oluşturabilirsiniz.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((f) => (
              <Link key={f.id} href={`/formlar/${f.id}`} className="group">
                <Card className="h-full transition-colors group-hover:border-[var(--primary)]">
                  <CardContent className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate font-medium">{f.title}</span>
                      <Badge tone={f.status === "ACTIVE" ? "green" : f.status === "ARCHIVED" ? "default" : "amber"}>
                        {FORM_STATUS_LABEL[f.status] ?? f.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {FORM_KIND_LABEL[f.kind]}
                      {f.subtype ? ` · ${f.subtype}` : ""} · {formatDate(f.date)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
