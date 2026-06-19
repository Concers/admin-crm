"use client";

import { useMemo, useState } from "react";
import { Calculator, StickyNote, TrendingUp, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FxFields } from "@/components/fx-fields";
import { VadeFields } from "@/components/vade-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue, cn } from "@/lib/utils";
import { createSatis, updateSatis } from "./actions";
import { lookupUnitPrice } from "@/lib/pricing-actions";
import type { SatisRow } from "./satis-list";

const KDV_OPTIONS = [
  { value: "0", label: "%0 KDV" },
  { value: "0.1", label: "%10 KDV" },
  { value: "0.2", label: "%20 KDV" },
];

export function SatisModal({
  mode,
  row,
  urunler,
  musteriler,
  onClose,
}: {
  mode: "create" | "edit";
  row?: SatisRow;
  urunler: string[];
  musteriler: string[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const p = isEdit ? "edit" : "new";

  const [birim, setBirim] = useState(isEdit ? String(row._unitPrice) : "");
  const [adet, setAdet] = useState(isEdit ? String(row._quantity) : "");
  const [kdv, setKdv] = useState(isEdit ? String(row._vatRate) : "0.2");
  const [pesin, setPesin] = useState(isEdit ? String(row._paidAmount || "") : "");
  const [tarih, setTarih] = useState(isEdit ? toDateInputValue(row._date) : "");
  const [musteri, setMusteri] = useState(isEdit ? row._customerName : "");
  const [urun, setUrun] = useState(isEdit ? row._productName : "");
  const [priceLoading, setPriceLoading] = useState(false);

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
      title={isEdit ? "Satış Kaydını Düzenle" : "Yeni Satış Kaydı"}
      description={
        isEdit
          ? "Satış bilgilerini güncelleyin; tutarlar otomatik hesaplanır."
          : "Müşteriye yapılan satışı kaydedin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Satış Ekle"}
      maxWidth="max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateSatis(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Satış kaydı güncellendi." });
        } else {
          run(async () => {
            const result = await createSatis(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Satış kaydı eklendi." });
        }
      }}
    >
      <div className="space-y-4">
        <FormSection title="Satış bilgileri">
          <div>
            <Label htmlFor={`${p}-tarih`}>Tarih *</Label>
            <Input
              id={`${p}-tarih`}
              name="tarih"
              type="date"
              required
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${p}-urunAdi`}>Ürün *</Label>
            <Select
              id={`${p}-urunAdi`}
              name="urunAdi"
              required
              value={urun}
              onChange={(e) => setUrun(e.target.value)}
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
          <div className="sm:col-span-2">
            <Label htmlFor={`${p}-musteri`}>Müşteri / Cari *</Label>
            <Select
              id={`${p}-musteri`}
              name="musteri"
              required
              value={musteri}
              onChange={(e) => setMusteri(e.target.value)}
            >
              <option value="" disabled>
                Cari seçin
              </option>
              {musteriler.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
        </FormSection>

        <FormSection title="Tutarlar">
          <div>
            <Label htmlFor={`${p}-birimSatisFiyati`}>Birim Satış Fiyatı (₺)</Label>
            <div className="flex gap-2">
              <Input
                id={`${p}-birimSatisFiyati`}
                name="birimSatisFiyati"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={birim}
                onChange={(e) => setBirim(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={priceLoading || !musteri || !urun}
                onClick={async () => {
                  setPriceLoading(true);
                  const price = await lookupUnitPrice(musteri, urun);
                  if (price != null) setBirim(String(price));
                  setPriceLoading(false);
                }}
              >
                <Wand2 className="h-4 w-4" />
                {priceLoading ? "…" : "Fiyat"}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor={`${p}-satisAdeti`}>Satış Adedi *</Label>
            <Input
              id={`${p}-satisAdeti`}
              name="satisAdeti"
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
            <Label htmlFor={`${p}-pesinOdenen`}>Peşin Tahsilat (₺)</Label>
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

        <FormSection title="Vade ve döviz">
          <VadeFields idPrefix={p} invoiceDate={tarih} />
          <FxFields idPrefix={p} amountTry={preview.kdvDahil} />
        </FormSection>

        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-[var(--card)] p-4 ring-1 ring-blue-100/60">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900">
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
              <dt className="text-xs text-[var(--muted-foreground)]">Kalan Alacak</dt>
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
          {isEdit && row._profitMargin != null && (
            <div className="mt-3 flex items-center gap-2 border-t border-blue-100/80 pt-3 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-[var(--muted-foreground)]">Kayıtlı kâr marjı:</span>
              <span
                className={cn(
                  "font-semibold",
                  row._profitMargin >= 0 ? "text-emerald-700" : "text-rose-600"
                )}
              >
                %{row._profitMargin.toFixed(1)}
              </span>
            </div>
          )}
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
              placeholder="Sipariş no, teslimat veya özel not…"
              defaultValue={isEdit ? row._notes : ""}
              className="mt-1.5 resize-none"
            />
          </div>
        </FormSection>
      </div>
    </FormModal>
  );
}
