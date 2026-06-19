import { Info, Users, Package, Receipt, Tags } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import {
  getPartners,
  getProducts,
  getExpenseCategories,
  getShelves,
  type PartnerType,
} from "@/lib/api";
import {
  GenelGiderEkleForm,
  TedarikciEkleForm,
  UrunEkleForm,
  UrunGiderEkleForm,
} from "./tanimlama-forms";
import { TanimlamaPanel, TanimlamaStats } from "./tanimlama-panel";
import {
  GenelGiderListClient,
  TedarikciListClient,
  UrunGiderListClient,
  UrunListClient,
} from "./tanimlama-sections";

export const dynamic = "force-dynamic";

export default async function TanimlamaPage() {
  const [partnerler, urunlerData, genelGiderData, urunGiderData, shelvesData] = await Promise.all([
    getPartners(),
    getProducts(),
    getExpenseCategories("GENERAL"),
    getExpenseCategories("PRODUCT"),
    getShelves(),
  ]);

  const sortByName = <T extends { name: string }>(arr: T[]) =>
    [...arr].sort((a, b) => a.name.localeCompare(b.name, "tr"));

  // Raf seçimi: ürün rafı serbest metin yerine tanımlı raflardan seçilir.
  // Dolu raflar = bir ürüne atanmış kodlar; boş raflar bunların dışındakiler.
  const occupiedCodes = new Set(
    urunlerData.map((u) => u.shelfLocation?.trim()).filter((c): c is string => Boolean(c)),
  );
  const aktifRaflar = shelvesData
    .filter((s) => s.isActive)
    .map((s) => ({ code: s.code, location: s.location }))
    .sort((a, b) => a.code.localeCompare(b.code, "tr"));
  const bosRaflar = aktifRaflar.filter((s) => !occupiedCodes.has(s.code));

  const tedarikciler = sortByName(partnerler).map((p) => ({
    id: p.id,
    tip: p.type as PartnerType,
    ad: p.name,
    priceTier: p.priceTier ?? "",
  }));
  const urunler = sortByName(urunlerData).map((u) => ({ id: u.id, ad: u.name, raf: u.shelfLocation ?? "" }));
  const genelGiderler = sortByName(genelGiderData).map((g) => ({
    id: g.id,
    ad: g.name,
  }));
  const urunGiderleri = sortByName(urunGiderData).map((g) => ({
    id: g.id,
    ad: g.name,
  }));

  return (
    <PageShell title="Tanımlama">
      <div className="space-y-6">
        <div className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3.5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
          <div className="text-sm leading-relaxed text-indigo-950/80">
            <p className="font-medium text-indigo-950">Temel tanımlar</p>
            <p className="mt-0.5 text-indigo-900/70">
              Tedarikçi, ürün ve gider türlerini buradan yönetin. Düzenlemek için
              listedeki satıra veya kalem ikonuna tıklayın — açılan pencereden
              kaydedin. Ad değişiklikleri ilgili gider, alım ve satış kayıtlarına
              otomatik yansır.
            </p>
          </div>
        </div>

        <TanimlamaStats
          items={[
            { label: "Tedarikçi", value: tedarikciler.length, accent: "indigo" },
            { label: "Ürün", value: urunler.length, accent: "emerald" },
            { label: "Genel Gider", value: genelGiderler.length, accent: "amber" },
            { label: "Ürün Gideri", value: urunGiderleri.length, accent: "rose" },
          ]}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TanimlamaPanel
            icon={Users}
            title="Müşteri / Tedarikçi / Hizmet Veren"
            description="Alım, satış ve ödeme kayıtlarında kullanılacak firma ve kişiler."
            count={tedarikciler.length}
            accent="indigo"
          >
            <TedarikciEkleForm />
            <TedarikciListClient rows={tedarikciler} />
          </TanimlamaPanel>

          <TanimlamaPanel
            icon={Package}
            title="Ürün Tanımlama"
            description="Stok, alım ve satış işlemlerinde seçilecek ürün listesi."
            count={urunler.length}
            accent="emerald"
          >
            <UrunEkleForm bosRaflar={bosRaflar} />
            <UrunListClient rows={urunler} raflar={aktifRaflar} doluRaflar={[...occupiedCodes]} />
          </TanimlamaPanel>

          <TanimlamaPanel
            icon={Receipt}
            title="Genel Giderler"
            description="Kira, personel gibi genel işletme gider kategorileri."
            count={genelGiderler.length}
            accent="amber"
          >
            <GenelGiderEkleForm />
            <GenelGiderListClient rows={genelGiderler} />
          </TanimlamaPanel>

          <TanimlamaPanel
            icon={Tags}
            title="Ürün Giderleri"
            description="Ambalaj, dolum gibi ürüne özel gider türleri."
            count={urunGiderleri.length}
            accent="rose"
          >
            <UrunGiderEkleForm />
            <UrunGiderListClient rows={urunGiderleri} />
          </TanimlamaPanel>
        </div>
      </div>
    </PageShell>
  );
}
