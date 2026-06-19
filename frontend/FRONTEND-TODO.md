# Frontend Yapılacaklar — Backend Boşlukları Kapatıldı (2026-06-18)

Backend tarafında kapatılan eksiklerin **arayüz (UI) karşılıkları**. Tamamlanan maddeler `[x]` ile işaretlendi.

---

## 1. İade Düzenleme (PUT /returns/:id)
- [x] `src/lib/api.ts` → `updateReturn(id, body)`
- [x] `src/app/belgeler/iade/` → Düzenle aksiyonu + form

## 2. Depo / Hesap / Kişi Düzenleme (PUT eklendi)
- [x] `updateWarehouse`, `updateAccount`, `updateContact` API
- [x] `src/app/depolar/` → depo düzenleme
- [x] `src/app/kasa-banka/` → hesap düzenleme + nakit hareketleri
- [x] Tanımlama → cari kişi (Contact) UI (`kisi-modal.tsx`)

## 3. Yeni Ürün Takip — Yazma Arayüzü
- [x] API + CRUD UI (`yeni-urun-takip`)

## 4. CashFlow Hesap Filtresi & Hesap Kolonu
- [x] `getCashFlows(type?, accountId?)`
- [x] `musteri-tahsilat`, `tedarikci-odeme`, `kasa-banka` → hesap kolonu + form `accountId`

## 5. Belge Listesi Durum Filtreleri
- [x] Client-side durum/tür filtreleri (mevcut workspace'ler)
- [x] API: `getOrders|getQuotes|getInvoices|getProductionOrders` query param desteği

## 6. Stok Tutarlılığı (bilgilendirme)
- [x] Stok raporu backend tek kaynak
- [x] Stok raporu sayfasında iade + üretim emri açıklaması

## 7. Önceki Bekleyenler
- [x] CashFlow düzenleme (tahsilat/ödeme + kasa-banka hareket düzenleme)
- [x] Attachment (dosya eki) UI — fatura düzenleme, URL/metadata (`entity-attachments.tsx`)
- [x] Yazdırılabilir / PDF cari hesap ekstresi — `/raporlar/musteri/yazdir`, `/raporlar/tedarikci/yazdir`

## 8. Raf Takibi
- [x] Raf takibi sayfası ve tanımlamalar
- [x] Boş raflar — `Shelf` modeli + `/shelves` API + raf-takibi UI

---

## 9. Veri Girişi ve Güvenlik
- [x] Fatura 409 → `friendlyApiError` ile kullanıcı mesajı
- [x] Dönem kapatma API + `/donem-kapatma` sayfası
- [x] İşlem formlarında 423 `period_locked` mesajı (`lib/action-errors.ts`)
- [ ] (Opsiyonel) Alım/Satış belge no benzersizliği — backend ⏳

## 10. Fiyatlama ve Ticari Otomasyon
- [x] Satış/alım → vade (gün) + hesaplanan vade (`VadeFields`)
- [x] Cari → fiyat segmenti (`priceTier`)
- [x] Fiyat listesi → segment (tier) — zaten vardı
- [x] Satış formu → `/price-resolve` ile birim fiyat (`lookupUnitPrice`)
- [x] TCMB kur + döviz alanları (`FxFields`, `getTcmbRate`)

## 11. Gelişmiş Stok — backend ⏳
- [ ] Parti/SKT (FEFO)
- [ ] Sanal (rezerve) stok

## 12. Finansal Derinlik
- [x] Alacak yaşlandırma, mutabakat — mevcut

## 13. Stratejik Raporlama
- [x] Müşteri kârlılık, ABC, ölü stok, gider merkezi, nakit akış
- [x] `/raporlar/satis-temsilcisi` — temsilci performansı + dönem filtresi

---

_Bu dosya 2026-06-19 güncellendi._
