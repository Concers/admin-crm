"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { LineItemsEditor } from "../line-items";
import { createTeklif, updateTeklif } from "./actions";
import type { TeklifTableRow } from "./teklif-rows";

export function TeklifModal({
  mode,
  row,
  partners,
  products,
  onClose,
}: {
  mode: "create" | "edit";
  row?: TeklifTableRow;
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Teklifi Düzenle" : "Yeni Teklif"}
      description={
        isEdit
          ? "Teklif başlığı ve kalemlerini güncelleyin."
          : "Müşteriye sunulacak teklifi oluşturun; kalemleri ekleyin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Teklif Ekle"}
      maxWidth="max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateTeklif(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Teklif güncellendi." });
        } else {
          run(async () => {
            const result = await createTeklif(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Teklif eklendi." });
        }
      }}
    >
      <FormSection title="Teklif bilgileri">
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
          <Label htmlFor={`${idPrefix}-gecerlilik`}>Geçerlilik Tarihi</Label>
          <Input
            id={`${idPrefix}-gecerlilik`}
            name="gecerlilik"
            type="date"
            defaultValue={
              isEdit && row._validUntil ? toDateInputValue(row._validUntil) : ""
            }
          />
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
            <option value="SENT">Gönderildi</option>
            <option value="ACCEPTED">Kabul</option>
            <option value="REJECTED">Reddedildi</option>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-notlar`}>Notlar</Label>
          <Textarea
            id={`${idPrefix}-notlar`}
            name="notlar"
            rows={2}
            placeholder="Ödeme koşulları, teslim süresi vb."
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
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
          Mevcut toplam:{" "}
          <span className="font-semibold tabular-nums">{formatCurrency(row._totalAmount)}</span>
          <span className="mx-2 text-emerald-300">·</span>
          KDV dahil:{" "}
          <span className="font-semibold tabular-nums">
            {formatCurrency(row._vatIncludedAmount)}
          </span>
        </div>
      )}
    </FormModal>
  );
}
