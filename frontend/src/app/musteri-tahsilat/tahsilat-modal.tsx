"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { createTahsilat, updateTahsilat } from "./actions";
import type { TahsilatTableRow } from "./tahsilat-rows";

export function TahsilatModal({
  mode,
  row,
  musteriler,
  onClose,
}: {
  mode: "create" | "edit";
  row?: TahsilatTableRow;
  musteriler: string[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Tahsilat Kaydını Düzenle" : "Yeni Müşteri Tahsilatı"}
      description={
        isEdit
          ? "Tahsilat bilgilerini güncelleyin."
          : "Müşteriden alınan tahsilatı kaydedin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Tahsilat Ekle"}
      maxWidth="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateTahsilat(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Tahsilat kaydı güncellendi." });
        } else {
          run(async () => {
            const result = await createTahsilat(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Tahsilat kaydı eklendi." });
        }
      }}
    >
      <FormSection title="Tahsilat bilgileri">
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
          <Label htmlFor={`${idPrefix}-musteri`}>Müşteri *</Label>
          <Select
            id={`${idPrefix}-musteri`}
            name="musteriAdi"
            required
            defaultValue={isEdit ? row._partnerName : ""}
          >
            <option value="" disabled>
              Seçin
            </option>
            {musteriler.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-tutar`}>Tahsilat Tutarı *</Label>
          <Input
            id={`${idPrefix}-tutar`}
            name="tahsilatTutari"
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
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
          Mevcut tutar: <span className="font-semibold tabular-nums">{formatCurrency(row._amount)}</span>
        </div>
      )}
    </FormModal>
  );
}
