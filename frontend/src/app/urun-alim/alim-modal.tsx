"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2, Info, LayoutGrid, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue, cn } from "@/lib/utils";
import { createAlim, updateAlim } from "./actions";
import type { AlimRow, UrunKart } from "./alim-list";

const KDV_OPTIONS = [
  { value: "0", label: "%0 KDV" },
  { value: "0.1", label: "%10 KDV" },
  { value: "0.2", label: "%20 KDV" },
];

export function AlimModal({
  mode,
  row,
  urunKartlari,
  tedarikciler,
  onClose,
}: {
  mode: "create" | "edit";
  row?: AlimRow;
  urunKartlari: UrunKart[];
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
  const [urunAdi, setUrunAdi] = useState(isEdit ? row._productName : "");
  // Kayıt sonrası "kartı tamamla" yönlendirmesi (yeni/eksik ürünlerde).
  const [completePrompt, setCompletePrompt] = useState<{ id: number; name: string } | null>(null);

  // Girilen ürün adının kart durumu: yeni mi, var-ama-eksik mi, tam mı?
  const eslesme = useMemo(() => {
    const q = urunAdi.trim().toLowerCase();
    if (!q) return null;
    return urunKartlari.find((c) => c.name.toLowerCase() === q) ?? null;
  }, [urunAdi, urunKartlari]);
  const urunDurumu: "yeni" | "eksik" | "tam" | null = !urunAdi.trim()
    ? null
    : !eslesme
      ? "yeni"
      : eslesme.complete
        ? "tam"
        : "eksik";

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
          const needsDetail = urunDurumu !== "tam"; // yeni veya eksik kart
          run(async () => {
            const result = await createAlim(fd);
            if (!result?.error) {
              if (needsDetail && result?.productId) {
                // Kullanıcıyı doğrudan kartı tamamlamaya yönlendir.
                setCompletePrompt({ id: result.productId, name: urunAdi.trim() });
              } else {
                onClose();
              }
            }
            return result;
          }, { success: "Alım kaydı eklendi." });
        }
      }}
    >
      <div className="space-y-4">
        {completePrompt && (
          <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <span>
                <strong>{completePrompt.name}</strong> alımı kaydedildi ve ürün kartı açıldı.
                <br />
                Künye bilgilerini (GTİP, botanik ad, analiz/sertifika…) şimdi tamamlayabilirsiniz.
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Sonra
              </Button>
              <Link
                href={`/urun-detay/${completePrompt.id}`}
                className="inline-flex items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Kartı Tamamla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
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
            {/* Yazılabilir combobox: mevcut karttan seç ya da yeni ürün adı yaz;
                yeni ürünün kartı kayıtta otomatik açılır (backend upsert). */}
            <Input
              id={`${p}-urunAdi`}
              name="urunAdi"
              list={`${p}-urun-list`}
              required
              autoComplete="off"
              placeholder="Ürün seçin veya yeni ad yazın"
              value={urunAdi}
              onChange={(e) => setUrunAdi(e.target.value)}
            />
            <datalist id={`${p}-urun-list`}>
              {urunKartlari.map((u) => (
                <option key={u.id} value={u.name} />
              ))}
            </datalist>
            {urunDurumu === "yeni" && (
              <p className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                <Info className="h-3.5 w-3.5" />
                Yeni ürün — kaydedince kartı otomatik açılır, sonra tamamlarsınız.
              </p>
            )}
            {urunDurumu === "eksik" && eslesme && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-600">
                <Info className="h-3.5 w-3.5" />
                Kart var ama detaylar eksik.
                <Link
                  href={`/urun-detay/${eslesme.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-0.5 font-medium underline"
                >
                  Kartı aç <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            )}
            {urunDurumu === "tam" && (
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Kayıtlı ürün kartı — detaylar tam.
              </p>
            )}
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
