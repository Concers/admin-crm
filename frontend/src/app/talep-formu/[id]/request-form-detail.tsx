"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { RequestFormDoc } from "@/lib/api";
import { LinesEditor, draftsToLines, type LineDraft } from "../lines-editor";
import { deleteRequestFormAction, updateRequestFormAction } from "../actions";

const STATUS_OPTS = [
  { value: "DRAFT", label: "Taslak" },
  { value: "SENT", label: "Gönderildi" },
  { value: "FULFILLED", label: "Karşılandı" },
  { value: "CANCELLED", label: "İptal" },
];

export function RequestFormDetail({
  form,
  products,
}: {
  form: RequestFormDoc;
  products: { id: number; name: string; unit?: string | null }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(form.status);
  const [notes, setNotes] = useState(form.notes ?? "");
  const [lines, setLines] = useState<LineDraft[]>(
    form.lines.map((l) => ({
      productId: l.productId,
      itemName: l.itemName,
      quantity: String(l.quantity),
      unit: l.unit ?? "",
      note: l.note ?? "",
    })),
  );

  function save() {
    const apiLines = draftsToLines(lines);
    if (!apiLines.length) return toast.error("En az bir geçerli kalem girin.");
    startTransition(async () => {
      const res = await updateRequestFormAction(form.id, {
        status,
        notes: notes.trim() || null,
        lines: apiLines,
      });
      if (res?.error) return toast.error(res.error);
      toast.success("Talep formu kaydedildi.");
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Bu talep formu silinsin mi?")) return;
    startTransition(async () => {
      const res = await deleteRequestFormAction(form.id);
      if (res?.error) return toast.error(res.error);
      toast.success("Talep formu silindi.");
      router.push("/talep-formu");
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={form.type === "PRODUCTION" ? "indigo" : "blue"}>
          {form.type === "PRODUCTION" ? "Üretim Talebi" : "Tedarik Talebi"}
        </Badge>
        <span className="text-sm text-[var(--muted-foreground)]">
          {form.type === "PRODUCTION" ? "Üretici" : "Tedarikçi"}: <strong>{form.partner.name}</strong>
        </span>
        <a
          href={`/talep-formu/${form.id}/pdf`}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
        >
          <Download className="h-4 w-4" /> PDF
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="status">Durum</Label>
          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as RequestFormDoc["status"])}
          >
            {STATUS_OPTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>Kalemler</Label>
        <LinesEditor lines={lines} onChange={setLines} products={products} />
      </div>

      <div>
        <Label htmlFor="notes">Not</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          className="text-[var(--danger)] hover:bg-red-50"
          onClick={remove}
          disabled={pending}
        >
          <Trash2 className="h-4 w-4" /> Sil
        </Button>
        <Button type="button" onClick={save} disabled={pending}>
          <Save className="h-4 w-4" /> {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </div>
  );
}
