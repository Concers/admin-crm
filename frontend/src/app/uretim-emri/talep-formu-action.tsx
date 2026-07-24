"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { generateTalepFormuAction } from "./actions";

export function TalepFormuAction({
  orderId,
  mamul,
  ureticiler,
}: {
  orderId: number;
  mamul: string;
  ureticiler: { id: number; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!partnerId) return toast.error("Üretici seçin.");
    startTransition(async () => {
      const res = await generateTalepFormuAction(orderId, Number(partnerId), notes.trim() || undefined);
      if (res.error) return toast.error(res.error);
      toast.success("Üretim talep formu oluşturuldu.");
      setOpen(false);
      if (res.id) router.push(`/talep-formu/${res.id}`);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Talep Formu Oluştur"
        aria-label="Talep Formu Oluştur"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <FileText className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Talep Formu Oluştur</DialogTitle>
            <DialogDescription>
              <strong>{mamul}</strong> üretimi için üreticiye gönderilecek talep formu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="uretici">Üretici (kime ürettirilecek) *</Label>
              <Select id="uretici" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
                <option value="" disabled>
                  Üretici seçin…
                </option>
                {ureticiler.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="tf-notes">Not</Label>
              <Textarea id="tf-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Vazgeç
              </Button>
              <Button type="button" onClick={submit} disabled={pending}>
                {pending ? "Oluşturuluyor…" : "Oluştur"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
