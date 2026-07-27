// Tanıtım sayfasının içeriği. Sayılar ve başlıklar `lib/navigation.ts`
// içindeki gerçek menü bölümlerinden türetilmiştir — pazarlama metni değil,
// sistemde gerçekten var olan ekranların dökümüdür.

export type WallCell = {
  /** Raf kodu — duvardaki hücrenin adresi. */
  code: string;
  title: string;
  /** Bu bölümdeki ekran sayısı (navigation.ts ile birebir). */
  count: number;
  detail: string;
};

export const WALL: WallCell[] = [
  { code: "A", title: "Giriş", count: 11, detail: "Gider, alım, satış, tahsilat, ürün ve materyal künyeleri" },
  { code: "B", title: "Belgeler", count: 6, detail: "Teklif, sipariş, fatura, iade, formlar, mutabakat" },
  { code: "C", title: "Stok & Kasa", count: 3, detail: "Raf takibi, stok hareketleri, depolar" },
  { code: "D", title: "Üretim & Fiyat", count: 6, detail: "Reçete, üretim ve tedarik emri, fiyat listesi, iskonto" },
  { code: "E", title: "Raporlar", count: 13, detail: "Gelir tablosu, KDV, alacak yaşlandırma, stok, cari" },
  { code: "F", title: "Analizler", count: 9, detail: "ABC, ölü stok, kârlılık, nakit akış, bütçe, kur farkı" },
  { code: "G", title: "Sistem", count: 3, detail: "Kullanıcılar, dönem kapatma, işlem geçmişi" },
];

export const SCREEN_COUNT = WALL.reduce((sum, c) => sum + c.count, 0);

/** Bir kaydın sistem içindeki gerçek yolculuğu — sıra bilgi taşır. */
export const FLOW: { step: string; title: string; detail: string }[] = [
  { step: "01", title: "Gider girişi", detail: "Fatura ve masraf, KDV'siyle birlikte kasadan düşer." },
  { step: "02", title: "Ürün alım", detail: "Tedarikçi, miktar ve birim maliyet girilir; stok artar." },
  { step: "03", title: "Üretim emri", detail: "Reçetedeki materyaller düşer, talep formu üretilir." },
  { step: "04", title: "Raf yerleşimi", detail: "Depo, raf ve göz bazında nerede durduğu kaydedilir." },
  { step: "05", title: "Satış", detail: "Fiyat listesi ve iskonto uygulanır, stok düşer." },
  { step: "06", title: "Tahsilat", detail: "Kasa veya banka hareketine işlenir, cari bakiye kapanır." },
];

export const ROLES: { title: string; detail: string }[] = [
  { title: "Yönetici", detail: "Tüm modüller: finans, raporlar, dönem kapatma ve kullanıcı yönetimi." },
  { title: "Depo Sorumlusu", detail: "Alım, ürün ve materyal künyeleri, raf takibi, stok raporları." },
  { title: "Satış Temsilcisi", detail: "Satış, teklif ve sipariş, müşteri tahsilatı." },
];
