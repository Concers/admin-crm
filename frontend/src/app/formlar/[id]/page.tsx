import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getForm, getPartners } from "@/lib/api";
import { FORM_KIND_LABEL } from "@/lib/form-kinds";
import { FormDetail } from "./form-detail";

export const dynamic = "force-dynamic";

export default async function FormDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [form, partners] = await Promise.all([getForm(id).catch(() => null), getPartners()]);
  if (!form) notFound();

  const partnerOpts = partners
    .map((p) => ({ id: p.id, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return (
    <PageShell title={form.title} description={FORM_KIND_LABEL[form.kind]}>
      <Link
        href="/formlar"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Formlara dön
      </Link>
      <Card>
        <CardContent>
          <FormDetail form={form} partners={partnerOpts} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
