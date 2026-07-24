"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { createRequestFormAction } from "../talep-formu/actions";
import { LinesEditor, draftsToLines, emptyLine, type LineDraft } from "../talep-formu/lines-editor";

export function TedarikForm({
  suppliers,
  products,
}: {
  suppliers: { id: number; name: string }[];
  products: { id: number; name: string; unit?: string | null }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [partnerId, setPartnerId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);

  function submit() {
    const apiLines = draftsToLines(lines);
    if (!partnerId) return toast.error("Tedarikçi seçin.");
    if (!apiLines.length) return toast.error("En az bir geçerli kalem girin.");
    startTransition(async () => {
      const res = await createRequestFormAction({
        type: "PROCUREMENT",
        partnerId: Number(partnerId),
        notes: notes.trim() || null,
        lines: apiLines,
      });
      if (res.error) return toast.error(res.error);
      toast.success("Tedarik talep formu oluşturuldu.");
      if (res.id) router.push(`/talep-formu/${res.id}`);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="partnerId">Tedarikçi *</Label>
          <Select id="partnerId" value={partnerId} onChange={(e) => setPartnerId(e.target.value)} required>
            <option value="" disabled>
              Tedarikçi seçin…
            </option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>Talep Edilen Kalemler *</Label>
        <LinesEditor lines={lines} onChange={setLines} products={products} />
      </div>

      <div>
        <Label htmlFor="notes">Not</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          <Send className="h-4 w-4" />
          {pending ? "Oluşturuluyor…" : "Tedarik Talebi Oluştur"}
        </Button>
      </div>
    </form>
  );
}
