"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { GIDER_KATEGORILERI } from "@/lib/calculations";
import { useActionToast } from "@/hooks/use-action-toast";
import { toDateInputValue } from "@/lib/utils";
import { createGider, updateGider } from "./actions";
import type { GiderTableRow } from "./gider-rows";

type GiderModalProps = {
  mode: "create" | "edit";
  row?: GiderTableRow;
  genelGiderTurleri: string[];
  urunGiderTurleri: string[];
  urunler: string[];
  tedarikciler: string[];
  onClose: () => void;
};

export function GiderModal({
  mode,
  row,
  genelGiderTurleri,
  urunGiderTurleri,
  urunler,
  tedarikciler,
  onClose,
}: GiderModalProps) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;

  const [kategori, setKategori] = useState<string>(
    isEdit && row._scope === "PRODUCT" ? "ÜRÜN_GİDERLERİ" : "Genel_Giderler"
  );

  const giderTurleri = useMemo(
    () => (kategori === "ÜRÜN_GİDERLERİ" ? urunGiderTurleri : genelGiderTurleri),
    [kategori, genelGiderTurleri, urunGiderTurleri]
  );

  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Gider Kaydını Düzenle" : "Yeni Gider Kaydı"}
      description={
        isEdit
          ? "Tüm alanları bu pencereden güncelleyebilirsiniz."
          : "Genel veya ürün gideri ekleyin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Gider Ekle"}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateGider(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Gider kaydı güncellendi." });
        } else {
          run(async () => {
            await createGider(fd);
            onClose();
          }, { success: "Gider kaydı eklendi." });
        }
      }}
    >
          <FormSection title="Tarih ve sınıflandırma">
            <div>
              <Label htmlFor={`${idPrefix}-tarih`}>Tarih *</Label>
              <Input
                id={`${idPrefix}-tarih`}
                name="tarih"
                type="date"
                required
                defaultValue={isEdit ? toDateInputValue(row._date) : ""}
              />
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-giderKategori`}>Ürün Gideri / Genel</Label>
              <Select
                id={`${idPrefix}-giderKategori`}
                name="giderKategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
              >
                {GIDER_KATEGORILERI.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-giderTuru`}>Gider Türü *</Label>
              <Select
                key={kategori}
                id={`${idPrefix}-giderTuru`}
                name="giderTuru"
                required
                defaultValue={isEdit ? row._category : ""}
              >
                <option value="" disabled>Seçin</option>
                {giderTurleri.map((g, i) => (
                  <option key={`gider-${i}-${g}`} value={g}>{g}</option>
                ))}
                {isEdit && row._category && !giderTurleri.includes(row._category) && (
                  <option value={row._category}>{row._category}</option>
                )}
              </Select>
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-periyotAy`}>Gider Periyodu (Ay)</Label>
              <Input
                id={`${idPrefix}-periyotAy`}
                name="periyotAy"
                type="number"
                min="1"
                defaultValue={isEdit ? (row._durationMonths ?? "") : "12"}
              />
            </div>
          </FormSection>

          <FormSection title="Ürün ve tedarikçi">
            <div>
              <Label htmlFor={`${idPrefix}-urunAdi`}>
                Ürün Adı{kategori === "ÜRÜN_GİDERLERİ" ? " *" : ""}
              </Label>
              <Select
                id={`${idPrefix}-urunAdi`}
                name="urunAdi"
                defaultValue={isEdit ? row._productName : ""}
                required={kategori === "ÜRÜN_GİDERLERİ"}
              >
                <option value="">—</option>
                {urunler.map((u, i) => (
                  <option key={`urun-${i}-${u}`} value={u}>{u}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-tedarikciAdi`}>Hizmet Veren / Tedarikçi</Label>
              <Select
                id={`${idPrefix}-tedarikciAdi`}
                name="tedarikciAdi"
                defaultValue={isEdit ? row._partnerName : ""}
              >
                <option value="">—</option>
                {tedarikciler.map((t, i) => (
                  <option key={`tedarikci-${i}-${t}`} value={t}>{t}</option>
                ))}
              </Select>
            </div>
          </FormSection>

          <FormSection title="Tutar ve belge">
            <div>
              <Label htmlFor={`${idPrefix}-toplamTutar`}>Toplam Tutar</Label>
              <Input
                id={`${idPrefix}-toplamTutar`}
                name="toplamTutar"
                type="number"
                step="0.01"
                min="0"
                defaultValue={isEdit ? row._totalAmount : ""}
              />
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-pesinOdenen`}>Peşin Ödenen Tutar</Label>
              <Input
                id={`${idPrefix}-pesinOdenen`}
                name="pesinOdenen"
                type="number"
                step="0.01"
                min="0"
                defaultValue={isEdit ? row._paidAmount : ""}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor={`${idPrefix}-faturaNo`}>Fatura No</Label>
              <Input
                id={`${idPrefix}-faturaNo`}
                name="faturaNo"
                placeholder="Örn. ORA2025000000301"
                defaultValue={isEdit ? row._invoiceNo : ""}
              />
            </div>
          </FormSection>

          <div>
            <Label htmlFor={`${idPrefix}-notlar`}>Notlar</Label>
            <Textarea
              id={`${idPrefix}-notlar`}
              name="notlar"
              rows={3}
              placeholder="Açıklama, FN: … veya Fatura No: …"
              defaultValue={isEdit ? row._notes : ""}
              className="mt-1"
            />
          </div>
    </FormModal>
  );
}
