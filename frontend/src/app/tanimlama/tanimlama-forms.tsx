"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  createGenelGider,
  createTedarikci,
  createUrun,
  createUrunGider,
} from "./actions";

const TEDARIKCI_TIPLERI = ["TEDARİKÇİ", "HİZMET VEREN", "EL PATRON"] as const;

function AddRowForm({
  action,
  children,
  label,
  successMessage,
}: {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  label: string;
  successMessage: string;
}) {
  const { run, pending } = useActionToast();
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
        Yeni kayıt ekle
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => action(new FormData(e.currentTarget)), {
            success: successMessage,
          });
          e.currentTarget.reset();
        }}
        className="flex flex-wrap items-end gap-3"
      >
        {children}
        <Button type="submit" size="sm" disabled={pending} className="shrink-0">
          <Plus className="h-4 w-4" />
          {pending ? "Ekleniyor..." : label}
        </Button>
      </form>
    </div>
  );
}

export function TedarikciEkleForm() {
  return (
    <AddRowForm action={createTedarikci} label="Ekle" successMessage="Tedarikçi eklendi.">
      <div className="min-w-[140px] flex-1 sm:flex-none">
        <Label htmlFor="tedarikci-tip">Tip</Label>
        <Select id="tedarikci-tip" name="tip" defaultValue="TEDARİKÇİ">
          {TEDARIKCI_TIPLERI.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </div>
      <div className="min-w-0 flex-1 sm:min-w-[220px]">
        <Label htmlFor="tedarikci-ad">Ad *</Label>
        <Input id="tedarikci-ad" name="ad" required placeholder="Firma veya kişi adı" />
      </div>
    </AddRowForm>
  );
}

export function UrunEkleForm() {
  return (
    <AddRowForm action={createUrun} label="Ekle" successMessage="Ürün eklendi.">
      <div className="min-w-0 flex-[2]">
        <Label htmlFor="urun-ad">Ürün Adı *</Label>
        <Input id="urun-ad" name="ad" required placeholder="Örn. Zeytinyağı 500ml" />
      </div>
      <div className="min-w-[120px] flex-1">
        <Label htmlFor="urun-raf">Hangi Raf</Label>
        <Input id="urun-raf" name="raf" placeholder="Örn. A-03" />
      </div>
    </AddRowForm>
  );
}

export function GenelGiderEkleForm() {
  return (
    <AddRowForm action={createGenelGider} label="Ekle" successMessage="Genel gider türü eklendi.">
      <div className="min-w-0 flex-1">
        <Label htmlFor="genel-gider-ad">Gider Türü *</Label>
        <Input id="genel-gider-ad" name="ad" required placeholder="Örn. Kira, Personel" />
      </div>
    </AddRowForm>
  );
}

export function UrunGiderEkleForm() {
  return (
    <AddRowForm action={createUrunGider} label="Ekle" successMessage="Ürün gider türü eklendi.">
      <div className="min-w-0 flex-1">
        <Label htmlFor="urun-gider-ad">Gider Türü *</Label>
        <Input id="urun-gider-ad" name="ad" required placeholder="Örn. Ambalaj, Dolum" />
      </div>
    </AddRowForm>
  );
}
