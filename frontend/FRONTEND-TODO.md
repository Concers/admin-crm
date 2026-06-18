# Frontend Yapılacaklar — Backend Boşlukları Kapatıldı (2026-06-18)

Backend tarafında kapatılan eksiklerin **arayüz (UI) karşılıkları**. Backend uçları hazır ve API smoke testleriyle doğrulandı; aşağıdaki maddeler bu uçları kullanıcı arayüzüne bağlamak içindir.

Backend uç referansı için bkz. `backend/src/routes/*.ts`. Frontend API katmanı: `src/lib/api.ts`.

---

## 1. İade Düzenleme (PUT /returns/:id)
- [ ] `src/lib/api.ts` → `updateReturn(id, body)` ekle (`apiSend("PUT", \`/returns/${id}\`, body)`).
- [ ] `src/app/belgeler/iade/` → liste satırına **Düzenle** aksiyonu + mevcut değerlerle dolu form (tip, cari, ürün, miktar, tutar, sebep).
- **Backend:** `PUT /returns/:id` hazır.

## 2. Depo / Hesap / Kişi Düzenleme (PUT eklendi)
- [ ] `src/lib/api.ts` → `updateWarehouse`, `updateAccount`, `updateContact` ekle.
- [ ] `src/app/depolar/` → depo satırına düzenleme (ad, lokasyon).
- [ ] `src/app/kasa-banka/` → hesap satırına düzenleme (ad, tür, para birimi, açılış bakiyesi).
- [ ] Partner Contact UI → kişi düzenleme (ad, ünvan, telefon, e-posta). (Contact UI henüz yoksa önce onu ekle.)
- **Backend:** `PUT /warehouses|accounts|contacts/:id` hazır.

## 3. Yeni Ürün Takip — Yazma Arayüzü (POST/PUT/DELETE /product-developments)
- [ ] `src/lib/api.ts` → `createProductDevelopment`, `updateProductDevelopment`, `deleteProductDevelopment` ekle.
- [ ] `src/app/yeni-urun-takip/page.tsx` şu an **salt-okunur**. Ekleme formu + satır düzenleme/silme ekle.
- [ ] Alanlar: ürün adı, tedarikçi, sipariş adedi, sınıf, hammadde mi + aşama checkbox'ları (sipariş verildi / fiyat alındı / numune alındı / numune onaylandı / üretim başladı / üretim bitti), not.
- **Backend:** `POST|PUT|DELETE /product-developments` hazır (ADMIN, otomatik audit).

## 4. CashFlow Hesap Filtresi & Hesap Kolonu (?accountId=)
- [ ] `src/lib/api.ts` → `getCashFlows` çağrısına opsiyonel `accountId` query desteği.
- [ ] `src/app/musteri-tahsilat/`, `src/app/tedarikci-odeme/`, `src/app/kasa-banka/` → "Hesaba göre" filtre (dropdown) + listede **Hesap** kolonu (artık `account` ilişki olarak dönüyor).
- [ ] Tahsilat/ödeme formuna "Hesap" seçimi (POST artık `accountId` kabul ediyor).
- **Backend:** `GET /cashflows?accountId=` + yanıtta `account` dahil; `POST /cashflows` `accountId` kabul eder.

## 5. Belge Listesi Durum Filtreleri (enum doğrulama)
- [ ] Sipariş/Teklif/Fatura/Üretim Emri listelerine **durum** ve **belge türü** filtreleri (dropdown).
- [ ] Backend artık geçersiz değerde **400** dönüyor — UI yalnızca geçerli enum değerleri göndermeli (boş = filtre yok).
- **Backend:** `GET /orders|quotes|invoices|production-orders?status=&docType=`.

## 6. Stok Tutarlılığı (bilgilendirme)
- [x] Stok raporu / düşük stok artık **stok hareketleri + iadeler + TAMAMLANDI üretim emirlerini** içeriyor (tek kaynak: `costing.getStockBreakdownMap`).
- [ ] Stok ekranlarında bu kalemlerin etkisini gösteren kısa açıklama/tooltip eklenebilir (opsiyonel).

## 7. Önceki Bekleyenler (geçmiş notlardan)
- [ ] CashFlow düzenleme formu (kasa/banka hareketleri).
- [ ] Attachment (dosya eki) UI — yükleme + listeleme.
- [ ] Yazdırılabilir / PDF cari hesap ekstresi (mutabakat).

## 8. Raf Takibi eklendi
- [x] Sol menüde sayfa oluşturulması → `/raf-takibi` (Stok & Kasa bölümü; sidebar + proxy role-gate eklendi).
- [x] Tanımlamalar sekmesinde raf bilgileri → ürün ekleme formuna "Hangi Raf" alanı + satır içi düzenleme (`UrunList`).
- [x] Stok raporuna "Hangi Raf" kolonu + rafa göre arama; rafa göre gruplı görünüm (rafsız ürünler "Rafsız" altında).
- [ ] **Boş rafların gösterilmesi**: şu an raf, ürünün serbest-metin alanı; tanımlı boş rafları göstermek için backend'de ayrı bir `Shelf` modeli gerekir (opsiyonel). Mevcut görünüm yalnızca dolu rafları listeler.

---

# İleri Düzey ERP Özellikleri (2026-06-18)

Backend kısımları **hazırlandı ve API testleriyle doğrulandı**; her madde frontend (UI) işini listeler. `[backend ✓]` = uç hazır, `[backend ⏳]` = önce backend modeli gerekiyor.

## 9. Veri Girişi ve Güvenlik Ağları
- **Mükerrer Belge Engelleme** `[backend ✓]` — `POST/PUT /invoices` aynı `number` ile **409 duplicate_number** döner.
  - [ ] Fatura formunda 409 mesajını göster (apiSend zaten backend mesajını yüzeye çıkarıyor — doğrula).
  - [ ] (Opsiyonel) Alım/Satış için "Belge No" + benzersizlik istenirse backend'e `documentNo` eklenmeli `[backend ⏳]`.
- **Dönem Kapatma (Tarih Kilidi)** `[backend ✓]` — `GET/POST/DELETE /period-locks`; kapalı döneme kayıt/güncelleme/silme **423 period_locked** (satış/alım/gider/tahsilat).
  - [ ] `lib/api.ts` → `getPeriodLocks/createPeriodLock/deletePeriodLock`.
  - [ ] Yeni sayfa `/donem-kapatma` (Sistem bölümü, ADMIN) — yıl/ay kilitle, kilit listesi, kaldır.
  - [ ] İşlem formlarında 423 mesajını net göster.
- **Akıllı Zorunlu Alanlar** (örn. "Araç Gideri" → "Plaka" zorunlu) — çoğunlukla frontend koşullu doğrulama; yapılandırılmış alanlar (plaka vb.) saklanacaksa `Expense` şemasına alan gerekir `[backend ⏳]`.

## 10. Fiyatlama ve Ticari Otomasyon
- **Dinamik Vade / Ödeme Tarihi** `[backend ✓]` — satış/alımda `termDays` → `dueDate = tarih + gün` otomatik.
  - [ ] Satış/Alım formuna "Vade (gün)" (30/60/90/özel) + hesaplanan vade tarihini göster.
- **Müşteri Tipine Göre Fiyat** `[backend ✓]` — `Partner.priceTier` + `PriceList.tier`; `GET /price-resolve?partnerId=&productId=`.
  - [ ] Cari formuna "Fiyat Segmenti", Fiyat Listesi formuna "Segment (tier)" alanı.
  - [ ] Satış formunda ürün+müşteri seçilince `/price-resolve` ile birim fiyatı otomatik doldur.
- **Dövizli İşlem (TCMB)** `[backend ✓]` — `GET /exchange-rates/tcmb?currency=USD` günün kurları.
  - [ ] Para birimi ≠ TRY seçilince TCMB kurunu çekip `exchangeRate`'i doldur + TL karşılığını göster.

## 11. Gelişmiş Stok ve Depo Disiplini
- **Parti (Lot) ve SKT Takibi (FEFO)** `[backend ⏳]` — yeni model gerekiyor.
  - [ ] Backend: `StockBatch { productId, lotNo, expiryDate, quantity, warehouseId }`; alımda parti girişi, çıkışta FEFO uyarısı; `getStockBreakdownMap`'e parti kırılımı.
  - [ ] Frontend: alım formunda Parti No + SKT; SKT yaklaşan uyarısı.
- **Sanal (Rezerve) Stok** `[backend ⏳]` — sipariş "Rezerve", irsaliye kesilince düşer.
  - [ ] Backend: rezerve mantığı; `getStockBreakdownMap`'e `reserved` ve `available = stock − reserved`.
  - [ ] Frontend: "Fiziksel / Rezerve / Kullanılabilir" kolonları; sipariş→irsaliye akışı.

## 12. Finansal Derinlik
- **Alacak Yaşlandırma** `[backend ✓ mevcut]` — `/reports/aging` (0-30/31-60/61-90/90+) zaten var; UI'da "geçen vs gelmeyen" vurgusu eklenebilir.
- **Parçalı Tahsilat / Fatura Eşleştirme** `[backend ✓ mevcut]` — `/reconciliation` + `PaymentAllocation`, tam ödenince otomatik "Ödendi"; `/mutabakat` UI'ı cilalanabilir.

## 13. Stratejik Raporlama
- **Müşteri Kârlılık / ABC** `[backend ✓ mevcut]` — `/reports/abc`, `/reports/customer-profitability` + sayfaları var.
- **Ölü (Hareketsiz) Stok** `[backend ✓ mevcut]` — `/reports/dead-stock` + `/raporlar/olu-stok` var.
- **Satış Temsilcisi Performansı** `[backend ✓ yeni]` — `GET /reports/sales-rep-performance?start=&end=`; satışlar girişi yapan kullanıcıya (`salesRepId`) atanıyor.
  - [ ] Yeni sayfa `/raporlar/satis-temsilcisi` (ADMIN) — temsilci bazında ciro/maliyet/net kâr/sipariş adedi + tarih filtresi.
  - [ ] Not: geçmiş (import) satışların temsilcisi yok ("Atanmamış"); sonraki girişler otomatik atanır.

---

# Notlar / Bilinen Sorunlar (2026-06-19)

## `/yeni-urun-takip` sayfası açılmıyordu (ÇÖZÜLDÜ)
- **Belirti:** Sayfa açılmıyordu; `GET /product-developments` → **500** (frontend digest `275667567`).
- **Sebep:** Pull ile gelen `29cc090` commit'i `schema.prisma`'ya `ProductDevelopment.attributes` (Json) kolonunu **migration üretmeden** eklemiş → DB'de kolon yok (`P2022: column main.ProductDevelopment.attributes does not exist`). (Aynısı daha önce `Expense.invoiceNo/excelRow` için de olmuştu.)
- **Çözüm:** Eksik migration eklendi → `backend/prisma/migrations/20260619100000_add_product_development_attributes/` (additive, nullable → veri kaybı yok). `prisma migrate deploy` ile uygulandı; uç artık **200**.
- **Dikkat:** `29cc090` şema↔migration tutarsızlığı bırakmıştı; bu repoyu klonlayan biri benzer P2022 hataları alabilir — `prisma migrate status` "güncel" dese de şema-DB drift'i olabilir.

---
_Bu dosya backend boşlukları kapatıldıktan sonra üretildi; tamamlanan maddeleri işaretleyip silebilirsiniz._
