"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { toDateInputValue } from "@/lib/utils";
import { createEmir, updateEmir } from "./actions";
import type { EmirTableRow, ReceteOption } from "./emir-rows";

export function EmirModal({
  mode,
  row,
  products,
  receteler,
  onClose,
}: {
  mode: "create" | "edit";
  row?: EmirTableRow;
  products: { id: number; name: string }[];
  receteler: ReceteOption[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();
  const isEdit = mode === "edit" && row;
  const idPrefix = isEdit ? "edit" : "new";

  const [productId, setProductId] = useState(
    isEdit ? String(row._productId) : ""
  );

  const filteredReceteler = useMemo(() => {
    const pid = Number(productId);
    if (!pid) return receteler;
    return receteler.filter((r) => r.productId === pid);
  }, [productId, receteler]);

  return (
    <FormModal
      title={isEdit ? "Üretim Emrini Düzenle" : "Yeni Üretim Emri"}
      description={
        isEdit
          ? "Mamul, miktar, reçete ve durumu güncelleyin."
          : "Üretilecek mamul için emir oluşturun."
      }
      onClose={onClose}
      pending={pending}
      submitLabel={isEdit ? "Değişiklikleri Kaydet" : "Üretim Emri Ekle"}
      maxWidth="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (isEdit) {
          run(async () => {
            const result = await updateEmir(row.id, fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Üretim emri güncellendi." });
        } else {
          run(async () => {
            const result = await createEmir(fd);
            if (!result?.error) onClose();
            return result;
          }, { success: "Üretim emri eklendi." });
        }
      }}
    >
      <FormSection title="Emir bilgileri">
        <div>
          <Label htmlFor={`${idPrefix}-productId`}>Mamul *</Label>
          <Select
            id={`${idPrefix}-productId`}
            name="productId"
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
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
          <Label htmlFor={`${idPrefix}-bomId`}>Reçete</Label>
          <Select
            id={`${idPrefix}-bomId`}
            name="bomId"
            defaultValue={isEdit && row._bomId ? String(row._bomId) : ""}
          >
            <option value="">Seçilmedi</option>
            {filteredReceteler.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
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
            step="0.01"
            min="0.01"
            required
            defaultValue={isEdit ? String(row._quantity) : ""}
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-status`}>Durum</Label>
          <Select
            id={`${idPrefix}-status`}
            name="status"
            defaultValue={isEdit ? row._status : "PLANNED"}
          >
            <option value="PLANNED">Planlandı</option>
            <option value="IN_PROGRESS">Üretimde</option>
            <option value="DONE">Tamamlandı</option>
            <option value="CANCELLED">İptal</option>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-startDate`}>Başlangıç</Label>
          <Input
            id={`${idPrefix}-startDate`}
            name="startDate"
            type="date"
            defaultValue={
              isEdit && row._startDate ? toDateInputValue(row._startDate) : ""
            }
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-endDate`}>Bitiş</Label>
          <Input
            id={`${idPrefix}-endDate`}
            name="endDate"
            type="date"
            defaultValue={isEdit && row._endDate ? toDateInputValue(row._endDate) : ""}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-notes`}>Notlar</Label>
          <Textarea
            id={`${idPrefix}-notes`}
            name="notes"
            rows={2}
            placeholder="Üretim notları"
            defaultValue={isEdit ? row._notes : ""}
          />
        </div>
      </FormSection>
    </FormModal>
  );
}
