"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { toDateInputValue } from "@/lib/utils";
import { createIskonto, updateIskonto } from "./actions";
import type { IskontoTableRow } from "./iskonto-rows";

export function IskontoModal({
  mode,
  row,
  partners,
  products,
  onClose,
}: {
  mode: "create" | "edit";
  row?: IskontoTableRow;
  partners: { id: number; name: string }[];
  products: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "İskontoyu Düzenle" : "Yeni İskonto"}
      description={
        isEdit
          ? "İskonto tanımını, geçerlilik süresini ve kapsamını güncelleyin."
          : "Yüzde veya tutar iskontosu tanımlayın; isteğe bağlı cari ve ürün kısıtı ekleyin."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "İskonto Ekle"}
      maxWidth="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateIskonto(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "İskonto güncellendi." });
        } else {
          run(async () => {
            const result = await createIskonto(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "İskonto eklendi." });
        }
      }}
    >
      <FormSection title="İskonto bilgileri">
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-name`}>İskonto Adı *</Label>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            required
            placeholder="Örn. Yıl sonu kampanyası"
            defaultValue={isEdit ? row._name : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-percent`}>Yüzde (%)</Label>
          <Input
            id={`${idPrefix}-percent`}
            name="percent"
            type="number"
            step="0.01"
            min="0"
            placeholder="Örn. 10"
            defaultValue={isEdit && row._percent != null ? row._percent : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-amount`}>Tutar (₺)</Label>
          <Input
            id={`${idPrefix}-amount`}
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Örn. 500"
            defaultValue={isEdit && row._amount != null ? row._amount : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-validFrom`}>Geçerlilik Başlangıç</Label>
          <Input
            id={`${idPrefix}-validFrom`}
            name="validFrom"
            type="date"
            defaultValue={isEdit && row._validFrom ? toDateInputValue(row._validFrom) : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-validTo`}>Geçerlilik Bitiş</Label>
          <Input
            id={`${idPrefix}-validTo`}
            name="validTo"
            type="date"
            defaultValue={isEdit && row._validTo ? toDateInputValue(row._validTo) : ""}
          />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={isEdit ? row._isActive : true}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            Aktif iskonto
          </label>
        </div>
      </FormSection>

      <FormSection title="Kapsam (isteğe bağlı)">
        <div>
          <Label htmlFor={`${idPrefix}-partnerId`}>Cari</Label>
          <Select
            id={`${idPrefix}-partnerId`}
            name="partnerId"
            defaultValue={isEdit && row._partnerId ? String(row._partnerId) : ""}
          >
            <option value="">Tüm cariler</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-productId`}>Ürün</Label>
          <Select
            id={`${idPrefix}-productId`}
            name="productId"
            defaultValue={isEdit && row._productId ? String(row._productId) : ""}
          >
            <option value="">Tüm ürünler</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </FormSection>
    </FormModal>
  );
}
