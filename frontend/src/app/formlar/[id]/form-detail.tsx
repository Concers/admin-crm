"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useActionToast } from "@/hooks/use-action-toast";
import { useToast } from "@/components/ui/toast";
import type { GenericFormDoc } from "@/lib/api";
import { CONTRACT_SUBTYPES, FORM_KIND_LABEL } from "@/lib/form-kinds";
import { deleteFormAction, updateFormAction } from "../actions";

export function FormDetail({
  form,
  partners,
}: {
  form: GenericFormDoc;
  partners: { id: number; name: string }[];
}) {
  const { run, pending } = useActionToast();
  const router = useRouter();
  const toast = useToast();
  const [deleting, startDelete] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updateFormAction(form.id, new FormData(e.currentTarget)), { success: "Form kaydedildi." });
      }}
      className="space-y-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="indigo">{FORM_KIND_LABEL[form.kind]}</Badge>
        <a
          href={`/formlar/${form.id}/pdf`}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
        >
          <Download className="h-4 w-4" /> PDF
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Başlık *</Label>
          <Input id="title" name="title" required defaultValue={form.title} />
        </div>
        <div>
          <Label htmlFor="status">Durum</Label>
          <Select id="status" name="status" defaultValue={form.status}>
            <option value="DRAFT">Taslak</option>
            <option value="ACTIVE">Aktif</option>
            <option value="ARCHIVED">Arşiv</option>
          </Select>
        </div>
        {form.kind === "SERVICE_CONTRACT" && (
          <div>
            <Label htmlFor="subtype">Sözleşme Türü</Label>
            <Select id="subtype" name="subtype" defaultValue={form.subtype ?? ""}>
              <option value="">—</option>
              {CONTRACT_SUBTYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        )}
        {form.kind !== "SERVICE_CONTRACT" && (
          <div>
            <Label htmlFor="subtype">Alt Başlık</Label>
            <Input id="subtype" name="subtype" defaultValue={form.subtype ?? ""} />
          </div>
        )}
        <div>
          <Label htmlFor="partnerId">İlgili Cari</Label>
          <Select id="partnerId" name="partnerId" defaultValue={form.partnerId ? String(form.partnerId) : ""}>
            <option value="">—</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="body">İçerik</Label>
        <Textarea id="body" name="body" rows={12} defaultValue={form.body ?? ""} placeholder="Form içeriğini buraya yazın (sonradan doldurulabilir)…" />
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          className="text-[var(--danger)] hover:bg-red-50"
          disabled={deleting}
          onClick={() => {
            if (!confirm("Bu form silinsin mi?")) return;
            startDelete(async () => {
              const res = await deleteFormAction(form.id);
              if (res?.error) return toast.error(res.error);
              toast.success("Form silindi.");
              router.push("/formlar");
            });
          }}
        >
          <Trash2 className="h-4 w-4" /> Sil
        </Button>
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
