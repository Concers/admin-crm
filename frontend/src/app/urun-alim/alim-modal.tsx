"use client";

import { useMemo, useState } from "react";
import { Calculator, LayoutGrid, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue, cn } from "@/lib/utils";
import { createAlim, updateAlim } from "./actions";
import type { AlimRow } from "./alim-list";

const KDV_OPTIONS = [
  { value: "0", label: "%0 KDV" },
  { value: "0.1", label: "%10 KDV" },
  { value: "0.2", label: "%20 KDV" },
];

export function AlimModal({
  mode,
  row,
  urunler,
  tedarikciler,
  onClose,
}: {
  mode: "create" | "edit";
  row?: AlimRow;
  urunler: string[];
  tedarikciler: string[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const p = isEdit ? "edit" : "new";

  const [birim, setBirim] = useState(isEdit ? String(row._unitPrice) : "");
  const [adet, setAdet] = useState(isEdit ? String(row._quantity) : "");
  const [kdv, setKdv] = useState(isEdit ? String(row._vatRate) : "0.2");
  const [pesin, setPesin] = useState(isEdit ? String(row._paidAmount || "") : "");

  const preview = useMemo(() => {
    const unit = Number(birim) || 0;
    const qty = Number(adet) || 0;
    const rate = Number(kdv) || 0;
    const toplam = unit * qty;
    const kdvDahil = toplam * (1 + rate);
    const paid = Number(pesin) || 0;
    const kalan = Math.max(0, kdvDahil - paid);
    return { toplam, kdvDahil, paid, kalan };
  }, [birim, adet, kdv, pesin]);

  return (
    <FormModal
      title={isEdit ? "Alım Kaydını Düzenle" : "Yeni Alım Kaydı"}
      description={
        isEdit
          ? "Alım bilgilerini güncelleyin; tutarlar otomatik hesaplanır."
          : "Tedarikçiden alınan ürünü stoka işleyin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Alım Ekle"}
      maxWidth="max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateAlim(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Alım kaydı güncellendi." });
        } else {
          run(async () => {
            await createAlim(fd);
            onClose();
          }, { success: "Alım kaydı eklendi." });
        }
      }}
    >
      <div className="space-y-4">
        <FormSection title="Alım bilgileri">
          <div>
            <Label htmlFor={`${p}-tarih`}>Tarih *</Label>
            <Input
              id={`${p}-tarih`}
              name="tarih"
              type="date"
              required
              defaultValue={isEdit ? toDateInputValue(row._date) : ""}
            />
          </div>
          <div>
            <Label htmlFor={`${p}-urunAdi`}>Ürün *</Label>
            <Select
              id={`${p}-urunAdi`}
              name="urunAdi"
              required
              defaultValue={isEdit ? row._productName : ""}
            >
              <option value="" disabled>
                Ürün seçin
              </option>
              {urunler.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`${p}-tedarikci`}>Tedarikçi</Label>
            <Select
              id={`${p}-tedarikci`}
              name="tedarikci"
              defaultValue={isEdit ? row._supplierName : ""}
            >
              <option value="">Seçilmedi</option>
              {tedarikciler.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`${p}-konulanRaf`} className="flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              Konulan Raf
            </Label>
            <Input
              id={`${p}-konulanRaf`}
              name="konulanRaf"
              placeholder="Örn. A-03"
              defaultValue={isEdit ? row._shelfLocation : ""}
            />
          </div>
        </FormSection>

        <FormSection title="Tutarlar">
          <div>
            <Label htmlFor={`${p}-birimAlimFiyati`}>Birim Alım Fiyatı (₺)</Label>
            <Input
              id={`${p}-birimAlimFiyati`}
              name="birimAlimFiyati"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={birim}
              onChange={(e) => setBirim(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${p}-alimAdeti`}>Alım Adedi *</Label>
            <Input
              id={`${p}-alimAdeti`}
              name="alimAdeti"
              type="number"
              min="1"
              step="1"
              required
              placeholder="1"
              value={adet}
              onChange={(e) => setAdet(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${p}-kdvOrani`}>KDV Oranı</Label>
            <Select
              id={`${p}-kdvOrani`}
              name="kdvOrani"
              value={kdv}
              onChange={(e) => setKdv(e.target.value)}
            >
              {KDV_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`${p}-pesinOdenen`}>Peşin Ödenen (₺)</Label>
            <Input
              id={`${p}-pesinOdenen`}
              name="pesinOdenen"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={pesin}
              onChange={(e) => setPesin(e.target.value)}
            />
          </div>
        </FormSection>

        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-[var(--card)] p-4 ring-1 ring-emerald-100/60">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <Calculator className="h-4 w-4" />
            Tutar Özeti
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-[var(--muted-foreground)]">Ara Toplam</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{formatCurrency(preview.toplam)}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted-foreground)]">KDV Dahil</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-emerald-700">
                {formatCurrency(preview.kdvDahil)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted-foreground)]">Peşin</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-amber-700">
                {formatCurrency(preview.paid)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted-foreground)]">Kalan Borç</dt>
              <dd
                className={cn(
                  "mt-0.5 font-semibold tabular-nums",
                  preview.kalan > 0 ? "text-rose-600" : "text-[var(--muted-foreground)]"
                )}
              >
                {formatCurrency(preview.kalan)}
              </dd>
            </div>
          </dl>
        </div>

        <FormSection title="Notlar">
          <div className="sm:col-span-2">
            <Label htmlFor={`${p}-notlar`} className="flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              Ek Not (isteğe bağlı)
            </Label>
            <Textarea
              id={`${p}-notlar`}
              name="notlar"
              rows={2}
              placeholder="Fatura no, irsaliye veya özel not…"
              defaultValue={isEdit ? row._notes : ""}
              className="mt-1.5 resize-none"
            />
          </div>
        </FormSection>
      </div>
    </FormModal>
  );
}
