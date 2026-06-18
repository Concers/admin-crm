"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatCurrency, toDateInputValue } from "@/lib/utils";
import { createIade, updateIade } from "./actions";
import type { IadeTableRow } from "./iade-rows";

export function IadeModal({
  mode,
  row,
  partners,
  products,
  onClose,
}: {
  mode: "create" | "edit";
  row?: IadeTableRow;
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "İade Kaydını Düzenle" : "Yeni İade Kaydı"}
      description={
        isEdit
          ? "İade bilgilerini güncelleyin."
          : "Satış veya alım iadesini kaydedin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "İade Ekle"}
      maxWidth="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateIade(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "İade kaydı güncellendi." });
        } else {
          run(async () => {
            const result = await createIade(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "İade kaydı eklendi." });
        }
      }}
    >
      <FormSection title="İade bilgileri">
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
          <Label htmlFor={`${idPrefix}-type`}>Tür *</Label>
          <Select
            id={`${idPrefix}-type`}
            name="type"
            required
            defaultValue={isEdit ? row._type : "SALES_RETURN"}
          >
            <option value="SALES_RETURN">Satış İadesi</option>
            <option value="PURCHASE_RETURN">Alım İadesi</option>
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
          <Label htmlFor={`${idPrefix}-productId`}>Ürün *</Label>
          <Select
            id={`${idPrefix}-productId`}
            name="productId"
            required
            defaultValue={isEdit ? String(row._productId) : ""}
          >
            <option value="" disabled>
              Seçin
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-quantity`}>Miktar *</Label>
          <Input
            id={`${idPrefix}-quantity`}
            name="quantity"
            type="number"
            step="1"
            min="1"
            required
            defaultValue={isEdit ? String(row._quantity) : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-amount`}>Tutar</Label>
          <Input
            id={`${idPrefix}-amount`}
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            defaultValue={isEdit ? String(row._amount) : ""}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-sebep`}>Sebep</Label>
          <Input
            id={`${idPrefix}-sebep`}
            name="sebep"
            placeholder="Hasarlı ürün, yanlış sevkiyat vb."
            defaultValue={isEdit ? row._reason : ""}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-notlar`}>Notlar</Label>
          <Textarea
            id={`${idPrefix}-notlar`}
            name="notlar"
            rows={2}
            placeholder="Ek açıklama"
            defaultValue={isEdit ? row._notes : ""}
          />
        </div>
      </FormSection>

      {isEdit && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
          Mevcut tutar:{" "}
          <span className="font-semibold tabular-nums">{formatCurrency(row._amount)}</span>
          <span className="mx-2 text-amber-300">·</span>
          Miktar: <span className="font-semibold tabular-nums">{row._quantity}</span>
        </div>
      )}
    </FormModal>
  );
}
