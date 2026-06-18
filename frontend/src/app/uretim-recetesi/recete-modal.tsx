"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { ComponentsEditor } from "./components-editor";
import { createRecete, updateRecete } from "./actions";
import type { ReceteTableRow } from "./recete-rows";

export function ReceteModal({
  mode,
  row,
  products,
  onClose,
}: {
  mode: "create" | "edit";
  row?: ReceteTableRow;
  products: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  return (
    <FormModal
      title={isEdit ? "Reçeteyi Düzenle" : "Yeni Üretim Reçetesi"}
      description={
        isEdit
          ? "Mamul, bileşenler ve durumu güncelleyin."
          : "Mamul ürün için hammadde bileşenlerini tanımlayın."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Reçete Ekle"}
      maxWidth="max-w-4xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateRecete(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Reçete güncellendi." });
        } else {
          run(async () => {
            const result = await createRecete(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Reçete eklendi." });
        }
      }}
    >
      <FormSection title="Reçete bilgileri">
        <div>
          <Label htmlFor={`${idPrefix}-name`}>Reçete Adı *</Label>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            required
            placeholder="Örn. Lavanta sabunu reçetesi"
            defaultValue={isEdit ? row._name : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-productId`}>Mamul *</Label>
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
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={isEdit ? row._isActive : true}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            Aktif reçete (üretim emrinde kullanılabilir)
          </label>
        </div>
      </FormSection>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 p-4">
        <ComponentsEditor
          key={isEdit ? row.id : "new"}
          products={products}
          initialComponents={isEdit ? row._components : undefined}
        />
      </div>

      {isEdit && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
          <span className="font-semibold">{row.bilesenSayisi}</span> bileşen tanımlı
        </div>
      )}
    </FormModal>
  );
}
