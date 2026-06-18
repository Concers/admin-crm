"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { createOdeme, updateOdeme } from "./actions";
import type { OdemeTableRow } from "./odeme-rows";

export function OdemeModal({
  mode,
  row,
  tedarikciler,
  onClose,
}: {
  mode: "create" | "edit";
  row?: OdemeTableRow;
  tedarikciler: string[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Ödeme Kaydını Düzenle" : "Yeni Tedarikçi Ödemesi"}
      description={
        isEdit
          ? "Ödeme bilgilerini güncelleyin."
          : "Tedarikçiye veya hizmet sağlayıcıya yapılan ödemeyi kaydedin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Ödeme Ekle"}
      maxWidth="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateOdeme(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Ödeme kaydı güncellendi." });
        } else {
          run(async () => {
            const result = await createOdeme(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Ödeme kaydı eklendi." });
        }
      }}
    >
      <FormSection title="Ödeme bilgileri">
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
          <Label htmlFor={`${idPrefix}-tedarikci`}>Tedarikçi / Hizmet Sağlayıcı *</Label>
          <Select
            id={`${idPrefix}-tedarikci`}
            name="tedarikciAdi"
            required
            defaultValue={isEdit ? row._partnerName : ""}
          >
            <option value="" disabled>
              Seçin
            </option>
            {tedarikciler.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-tutar`}>Ödenen Tutar *</Label>
          <Input
            id={`${idPrefix}-tutar`}
            name="odenenTutar"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0,00"
            defaultValue={isEdit ? String(row._amount) : ""}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-notlar`}>Notlar</Label>
          <Textarea
            id={`${idPrefix}-notlar`}
            name="notlar"
            rows={3}
            placeholder="Fatura no, ödeme şekli vb."
            defaultValue={isEdit ? row._notes : ""}
          />
        </div>
      </FormSection>
      {isEdit && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-sm text-rose-900">
          Mevcut tutar: <span className="font-semibold tabular-nums">{formatCurrency(row._amount)}</span>
        </div>
      )}
    </FormModal>
  );
}
