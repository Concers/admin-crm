import type { UserRole } from "@/lib/roles";

/**
 * Adım tanımları. `attach` verilen adımlar yalnızca hedef DOM'da varsa gösterilir
 * (role göre gizlenen menü bölümleri otomatik atlanır). `attach` boşsa adım
 * ekranın ortasında modal olarak çıkar (karşılama / kapanış).
 */
export type TourStepDef = {
  id: string;
  title: string;
  text: string;
  /** `[data-tour="..."]` seçicisinin değeri; verilmezse ortalı gösterilir. */
  attach?: string;
  on?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "right-start";
};

export const TOUR_STORAGE_KEY = "kadim-tour-done-v1";
/** Tur başka bir sayfadan tetiklendiğinde anasayfaya gidip orada başlatmak için. */
export const TOUR_PENDING_KEY = "kadim-tour-pending";

export function buildSteps(role: UserRole | null): TourStepDef[] {
  const roleAd =
    role === "ADMIN"
      ? "Yönetici"
      : role === "SALES_REP"
        ? "Satış Temsilcisi"
        : role === "WAREHOUSE_MANAGER"
          ? "Depo Sorumlusu"
          : "Kullanıcı";

  return [
    {
      id: "welcome",
      title: "Kadim ERP'ye Hoş Geldiniz 👋",
      text: `Merhaba <strong>${roleAd}</strong>! Bu kısa tur, panelin ana bölümlerini ve nereden ne yapacağınızı gösterecek. İstediğiniz an <em>Esc</em> ile çıkabilir, daha sonra menüden tekrar başlatabilirsiniz.`,
    },
    {
      id: "sidebar",
      title: "Sol Menü",
      text: "Tüm modüllere bu menüden ulaşırsınız. Menü, rolünüze göre yalnızca yetkili olduğunuz bölümleri gösterir.",
      attach: "sidebar",
      on: "right",
    },
    {
      id: "nav-giris",
      title: "Veri Girişi",
      text: "Günlük işlemlerinizi buradan girersiniz: tanımlamalar, ürün alım/satış, tahsilat ve ödemeler. Akış genelde <strong>Tanımlama → Alım → Satış</strong> şeklindedir.",
      attach: "nav-giris",
      on: "right",
    },
    {
      id: "nav-belgeler",
      title: "Belgeler",
      text: "Sipariş, teklif, fatura ve iade gibi resmi belgeleri buradan oluşturup yönetirsiniz. Belgeler satır kalemlerinden otomatik toplam ve KDV hesaplar.",
      attach: "nav-belgeler",
      on: "right",
    },
    {
      id: "nav-stok",
      title: "Stok & Kasa",
      text: "Stok hareketleri (sayım, fire, transfer) ve depo yönetimi burada. Stok, alım/satış ve bu hareketlerle anlık güncellenir.",
      attach: "nav-stok",
      on: "right",
    },
    {
      id: "nav-raporlar",
      title: "Raporlar & Analizler",
      text: "Gelir-gider, KDV, alacak yaşlandırma, ABC analizi ve kârlılık gibi raporlar burada. Veriler girildikçe raporlar otomatik dolar.",
      attach: "nav-raporlar",
      on: "right",
    },
    {
      id: "stats",
      title: "Özet Kartları",
      text: "Anasayfadaki bu kartlar toplam satış, gider, alım ve ürün/tedarikçi sayısını özetler — işletmenizin anlık nabzı.",
      attach: "stats",
      on: "bottom",
    },
    {
      id: "chart",
      title: "Karşılaştırma Grafiği",
      text: "Satış, alım ve giderlerinizi görsel olarak karşılaştırır. Aşağıda ise son işlemlerinizi görürsünüz.",
      attach: "chart",
      on: "top",
    },
    {
      id: "rehber",
      title: "Başlangıç Rehberi",
      text: "Her işlemin adım adım nasıl yapıldığını anlatan detaylı yazılı rehbere buradan ulaşırsınız. Tur sırasında takılırsanız ilk durağınız burası olsun.",
      attach: "nav-rehber",
      on: "right",
    },
    {
      id: "tour-button",
      title: "Turu Tekrar Başlat",
      text: "Bu turu istediğiniz zaman buradan yeniden başlatabilirsiniz. Hazırsanız çalışmaya başlayabilirsiniz — kolay gelsin! 🚀",
      attach: "tour-button",
      on: "right",
    },
  ];
}
