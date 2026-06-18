"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { LineItemsEditor } from "../line-items";
import { createSiparis, updateSiparis } from "./actions";
import type { SiparisTableRow } from "./siparis-rows";

export function SiparisModal({
  mode,
  row,
  partners,
  products,
  onClose,
}: {
  mode: "create" | "edit";
  row?: SiparisTableRow;
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Siparişi Düzenle" : "Yeni Sipariş"}
      description={
        isEdit
          ? "Sipariş başlığı ve kalemlerini güncelleyin."
          : "Satış veya alım siparişi oluşturun; kalemleri ekleyin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Sipariş Ekle"}
      maxWidth="max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateSiparis(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Sipariş güncellendi." });
        } else {
          run(async () => {
            const result = await createSiparis(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Sipariş eklendi." });
        }
      }}
    >
      <FormSection title="Sipariş bilgileri">
        <div>
          <Label htmlFor={`${idPrefix}-tarih`}>Tarih</Label>
          <Input
            id={`${idPrefix}-tarih`}
            name="tarih"
            type="date"
            defaultValue={isEdit ? toDateInputValue(row._date) : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-docType`}>Tür *</Label>
          <Select
            id={`${idPrefix}-docType`}
            name="docType"
            required
            defaultValue={isEdit ? row._docType : "SALES"}
          >
            <option value="SALES">Satış</option>
            <option value="PURCHASE">Alım</option>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-partnerId`}>Cari *</Label>
          <Select
            id={`${idPrefix}-partnerId`}
            name="partnerId"
            required
            defaultValue={isEdit ? String(row._partnerId) : ""}
          >
            <option value="" disabled>
              Seçin
            </option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-status`}>Durum</Label>
          <Select
            id={`${idPrefix}-status`}
            name="status"
            defaultValue={isEdit ? row._status : "DRAFT"}
          >
            <option value="DRAFT">Taslak</option>
            <option value="CONFIRMED">Onaylı</option>
            <option value="DELIVERED">Teslim</option>
            <option value="CANCELLED">İptal</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-notlar`}>Notlar</Label>
          <Textarea
            id={`${idPrefix}-notlar`}
            name="notlar"
            rows={2}
            placeholder="Teslimat adresi, özel şartlar vb."
            defaultValue={isEdit ? row._notes : ""}
          />
        </div>
      </FormSection>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 p-4">
        <LineItemsEditor
          key={isEdit ? row.id : "new"}
          products={products}
          initialLines={isEdit ? row._lines : undefined}
        />
      </div>

      {isEdit && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-900">
          Mevcut toplam:{" "}
          <span className="font-semibold tabular-nums">{formatCurrency(row._totalAmount)}</span>
          <span className="mx-2 text-indigo-300">·</span>
          KDV dahil:{" "}
          <span className="font-semibold tabular-nums">
            {formatCurrency(row._vatIncludedAmount)}
          </span>
        </div>
      )}
    </FormModal>
  );
}
