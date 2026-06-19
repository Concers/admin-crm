"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EntityAttachments } from "@/components/entity-attachments";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { LineItemsEditor } from "../line-items";
import { createFatura, updateFatura } from "./actions";
import type { FaturaTableRow } from "./fatura-rows";

export function FaturaModal({
  mode,
  row,
  partners,
  products,
  onClose,
}: {
  mode: "create" | "edit";
  row?: FaturaTableRow;
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Faturayı Düzenle" : "Yeni Fatura"}
      description={
        isEdit
          ? "Fatura başlığı ve kalemlerini güncelleyin."
          : "Satış veya alım faturası oluşturun; kalemleri ekleyin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Fatura Ekle"}
      maxWidth="max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateFatura(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Fatura güncellendi." });
        } else {
          run(async () => {
            const result = await createFatura(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Fatura eklendi." });
        }
      }}
    >
      <FormSection title="Fatura bilgileri">
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
          <Label htmlFor={`${idPrefix}-faturaNo`}>Fatura No</Label>
          <Input
            id={`${idPrefix}-faturaNo`}
            name="faturaNo"
            type="text"
            placeholder="Örn. FAT-2024-001"
            defaultValue={isEdit ? row._number : ""}
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
          <Label htmlFor={`${idPrefix}-vade`}>Vade Tarihi</Label>
          <Input
            id={`${idPrefix}-vade`}
            name="vade"
            type="date"
            defaultValue={isEdit && row._dueDate ? toDateInputValue(row._dueDate) : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-status`}>Durum</Label>
          <Select
            id={`${idPrefix}-status`}
            name="status"
            defaultValue={isEdit ? row._status : "DRAFT"}
          >
            <option value="DRAFT">Taslak</option>
            <option value="ISSUED">Kesildi</option>
            <option value="PAID">Ödendi</option>
            <option value="CANCELLED">İptal</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-notlar`}>Notlar</Label>
          <Textarea
            id={`${idPrefix}-notlar`}
            name="notlar"
            rows={2}
            placeholder="Ödeme koşulları, irsaliye no vb."
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
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
          Mevcut toplam:{" "}
          <span className="font-semibold tabular-nums">{formatCurrency(row._totalAmount)}</span>
          <span className="mx-2 text-blue-300">·</span>
          KDV dahil:{" "}
          <span className="font-semibold tabular-nums">
            {formatCurrency(row._vatIncludedAmount)}
          </span>
        </div>
      )}

      {isEdit && <EntityAttachments entityName="Invoice" entityId={row.id} />}
    </FormModal>
  );
}
