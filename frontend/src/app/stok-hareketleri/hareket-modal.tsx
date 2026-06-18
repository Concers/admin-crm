"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormModal, FormSection } from "@/components/form-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { createHareket } from "./actions";

export function HareketModal({
  urunler,
  depolar,
  onClose,
}: {
  urunler: string[];
  depolar: { id: number; name: string }[];
  onClose: () => void;
}) {
  const { run, pending } = useActionToast();

  return (
    <FormModal
      title="Yeni Stok Hareketi"
      description="Giriş, çıkış, transfer veya düzeltme kaydı oluşturun."
      onClose={onClose}
      pending={pending}
      submitLabel="Hareket Ekle"
      maxWidth="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await createHareket(new FormData(e.currentTarget));
          if (!result?.error) onClose();
          return result;
        }, { success: "Stok hareketi eklendi." });
      }}
    >
      <FormSection title="Hareket bilgileri">
        <div>
          <Label htmlFor="new-tarih">Tarih</Label>
          <Input id="new-tarih" name="tarih" type="date" />
        </div>
        <div>
          <Label htmlFor="new-type">Tür *</Label>
          <Select id="new-type" name="type" required defaultValue="IN">
            <option value="IN">Giriş</option>
            <option value="OUT">Çıkış</option>
            <option value="ADJUSTMENT">Düzeltme</option>
            <option value="TRANSFER">Transfer</option>
            <option value="WASTE">Fire</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="new-productName">Ürün *</Label>
          <Select id="new-productName" name="productName" required defaultValue="">
            <option value="" disabled>
              Seçin
            </option>
            {urunler.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>
        {depolar.length > 0 && (
          <div>
            <Label htmlFor="new-warehouseId">Depo</Label>
            <Select id="new-warehouseId" name="warehouseId" defaultValue="">
              <option value="">Seçilmedi</option>
              {depolar.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="new-quantity">Miktar *</Label>
          <Input
            id="new-quantity"
            name="quantity"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="new-reason">Açıklama</Label>
          <Input
            id="new-reason"
            name="reason"
            placeholder="Sayım farkı, fire nedeni vb."
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="new-notlar">Notlar</Label>
          <Textarea id="new-notlar" name="notlar" rows={2} placeholder="Ek bilgi" />
        </div>
      </FormSection>
    </FormModal>
  );
}
