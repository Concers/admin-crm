"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AddModalButton } from "@/components/add-modal-button";
import { PARTNER_TYPE_OPTIONS } from "@/lib/partner-types";
import {
  createGenelGider,
  createTedarikci,
  createUrun,
  createUrunGider,
} from "./actions";

export function TedarikciEkleForm() {
  return (
    <div className="mb-4">
      <AddModalButton
        label="Yeni Cari Ekle"
        title="Yeni Cari Kaydı"
        description="Müşteri, tedarikçi veya hizmet veren ekleyin."
        successMessage="Cari eklendi."
        action={createTedarikci}
      >
        <div>
          <Label htmlFor="tedarikci-tip">Tip</Label>
          <Select id="tedarikci-tip" name="tip" defaultValue="SUPPLIER">
            {PARTNER_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tedarikci-ad">Ad *</Label>
          <Input id="tedarikci-ad" name="ad" required placeholder="Firma veya kişi adı" />
        </div>
        <div>
          <Label htmlFor="tedarikci-tier">Fiyat segmenti</Label>
          <Input id="tedarikci-tier" name="priceTier" placeholder="Örn. WHOLESALE, RETAIL" />
        </div>
      </AddModalButton>
    </div>
  );
}

export function UrunEkleForm({ bosRaflar }: { bosRaflar: { code: string; location: string | null }[] }) {
  return (
    <div className="mb-4">
      <AddModalButton
        label="Yeni Ürün Ekle"
        title="Yeni Ürün"
        description="Stok ve işlemlerde kullanılacak ürün tanımı."
        successMessage="Ürün eklendi."
        action={createUrun}
      >
        <div>
          <Label htmlFor="urun-ad">Ürün Adı *</Label>
          <Input id="urun-ad" name="ad" required placeholder="Örn. Zeytinyağı 500ml" />
        </div>
        <div>
          <Label htmlFor="urun-raf">Hangi Raf</Label>
          <Select id="urun-raf" name="raf" defaultValue="" disabled={bosRaflar.length === 0}>
            <option value="">Raf seçilmedi</option>
            {bosRaflar.map((s) => (
              <option key={s.code} value={s.code}>
                {s.location ? `${s.code} — ${s.location}` : s.code}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {bosRaflar.length === 0
              ? "Boş raf yok — Raf Takibi ekranından raf tanımlayın."
              : `${bosRaflar.length} boş raf · yalnızca boş raflar listelenir`}
          </p>
        </div>
      </AddModalButton>
    </div>
  );
}

export function GenelGiderEkleForm() {
  return (
    <div className="mb-4">
      <AddModalButton
        label="Yeni Gider Türü Ekle"
        title="Genel Gider Türü"
        successMessage="Genel gider türü eklendi."
        action={createGenelGider}
      >
        <div>
          <Label htmlFor="genel-gider-ad">Gider Türü *</Label>
          <Input id="genel-gider-ad" name="ad" required placeholder="Örn. Kira, Personel" />
        </div>
      </AddModalButton>
    </div>
  );
}

export function UrunGiderEkleForm() {
  return (
    <div className="mb-4">
      <AddModalButton
        label="Yeni Ürün Gideri Ekle"
        title="Ürün Gider Türü"
        successMessage="Ürün gider türü eklendi."
        action={createUrunGider}
      >
        <div>
          <Label htmlFor="urun-gider-ad">Gider Türü *</Label>
          <Input id="urun-gider-ad" name="ad" required placeholder="Örn. Ambalaj, Dolum" />
        </div>
      </AddModalButton>
    </div>
  );
}
