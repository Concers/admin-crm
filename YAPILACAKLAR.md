# Yapılacaklar — Ürün/Materyal Detay & Belge Genişletmesi

> Kaynak: kullanıcı spesifikasyonu (2026-07-24).
> `[x]` = projede **mevcut**, `[ ]` = **eksik / yapılacak**, `[~]` = **kısmen var, genişletilmeli**.
> Mevcut durum kod taramasıyla doğrulandı: `backend/prisma/schema.prisma`, `backend/src/routes/*`, `frontend/src/app/*`.

---

## 1. ÜRÜN DETAY SEÇENEĞİ ✅ TAMAMLANDI (2026-07-24)

Yeni **`/urun-detay`** modülü: liste ([page.tsx](frontend/src/app/urun-detay/page.tsx)) + kart detay/düzenle
([\[id\]/page.tsx](frontend/src/app/urun-detay/[id]/page.tsx)). Backend: genişletilmiş `Product` + `ProductLink` +
`ProductPartnerLink` modelleri, `/products/:id` detay ucu, link & cari-bağ CRUD ([masterData.ts](backend/src/routes/masterData.ts)).
DB migration `add_product_detail` uygulandı; smoke test geçti.

### 1.1 Ürün kartı alanları
- [x] Ürün Sektörü — **çoklu seçim** (Gıda / Kozmetik / Ticari Emtia / Takviye Edici Gıda), CSV olarak saklanır *(sabit liste; "panelden sonradan seçenek ekleme" admin paneli sonraki tur)*
- [x] Ürün Kodu (`productCode`) — barkoddan ayrı iç kod
- [x] Barkod
- [x] GTİP / HS / UN Kodu
- [x] Ürün Botanik Adı / İngilizce Adı
- [x] CAS No / INCI No
- [x] Menşei / Kemotip / Genotip / Varyete / Coğrafi Popülasyon / Bitkinin Hangi Bölümü / Üretim Şekli / DER
- [x] Tarihçe / Kullanım Alanları / Açıklamalar (uzun metin)

### 1.2 Ürün kartı — dosya / içerik alanları
`Attachment` modeline `category` eklendi; kategorili yükleme kutuları detay sayfasında.
- [x] Teknik Analizler (ANALIZ) — URL/dosya adı, listelenir, tek tıkla açılır/indirilir
- [x] Ürün Sertifikaları (SERTIFIKA)
- [x] Ürün Görselleri (GORSEL)
- [x] Nihai Etiket Formu (ETIKET)
- [x] Bilimsel Makaleler — `ProductLink` (kind=ARTICLE): başlık + URL + **kişisel not**
- [x] Blog Yazıları — `ProductLink` (kind=BLOG)
- [x] Instagram İçerik Bilgileri — `ProductLink` (kind=INSTAGRAM)
- [ ] Ambalaj Bilgileri — **Materyal Detay** kartından çekilecek (bkz. §2 — Materyal modülü henüz yok)
- [~] Not: dosya "yükleme" gerçek upload değil; URL + dosya adı kaydı (mevcut altyapı gereği). Gerçek upload sonraki tur.

### 1.3 Ürün kartı — ilişkiler
- [x] Ürün Tedarikçileri — `ProductPartnerLink` rolü SUPPLIER **ve** POTENTIAL_SUPPLIER (potansiyel tedarikçi)
- [x] Müşteriler — `ProductPartnerLink` rolü CUSTOMER (B2B/B2C)
- [x] **BFM ÜRÜN** — `isBfm` bayrağı (ayrı kart tipi olarak işaretlenir). *(Ayrı BFM reçete ekranı §4 ile bağlanacak.)*

### 1.4 Entegrasyon + akış kolaylaştırma ✅
Gerçek alım formu `AlimModal` ([alim-modal.tsx](frontend/src/app/urun-alim/alim-modal.tsx)); eski `alim-form.tsx` kullanılmıyor (ölü kod).
- [x] "Ürün Adı" artık yazılabilir combobox (native `datalist`): mevcut karttan seç **veya** yeni ad yaz (yeni ürün kartı kayıtta otomatik açılır)
- [x] Alan altında **canlı durum**: "Yeni ürün" / "Kart var ama detaylar eksik · Kartı aç" / "✓ Detaylar tam"
- [x] Kayıttan sonra yeni/eksik üründe modal kapanmaz; **"Kartı Tamamla →"** bandı doğrudan `/urun-detay/{id}`'ye götürür (üç ekran arasında gezinme derdi biter)
- [x] Ürün Detay listesinde **"Detay eksik"** rozeti + eksikler üstte + sayaç uyarısı — alımda açılan boş kartlar kolayca bulunup tamamlanır

---

## 2. MATERYAL DETAY SEÇENEĞİ ✅ TAMAMLANDI (2026-07-24)

Yeni **`/materyal`** modülü: kategoriye göre gruplu liste ([page.tsx](frontend/src/app/materyal/page.tsx)) +
kart detay/düzenle ([\[id\]/page.tsx](frontend/src/app/materyal/[id]/page.tsx)). Backend: `Material` +
`MaterialPartnerLink` + `MaterialPriceBreak` modelleri, materials CRUD + cari-bağ + kademeli fiyat uçları
([masterData.ts](backend/src/routes/masterData.ts)). Migration `add_material` uygulandı; smoke test geçti.

- [x] Ana başlıklar: Ambalaj / Etiket / Sticker / Materyal (Diğer) — kategori bazlı gruplama
- [x] Ambalaj alt türleri serbest metin + öneri listesi (Doypack, Şişe, Tüp, Kartuş, Şase, Kutu, Poşet…); **panelden yenisi yazılabilir**
- [x] Liste kategoriye göre gruplu; Ambalaj içinde alt türe göre ayrık; her kartta **kullanım rozeti** (Kendi Markamız / B2B / Her İkisi)
- [x] Alt türe/karta tıklayınca detay sayfası açılır; kart Ürün Detay'da ve Termin formlarında kullanılabilir *(bağlama sonraki tur — §1 Ambalaj Bilgileri ve §6 Termin ile)*
- [x] Materyal kartı alanları: Model, Renk, Ölçü, Malzemesi, Birim Fiyatı, Kullanım Alanları, Notlar, Kullanım (OWN/B2B/BOTH)
  - [x] Tedarikçileri / Müşterileri — `MaterialPartnerLink` (SUPPLIER/CUSTOMER)
  - [x] Sertifikaları / Görseli — kategorili `Attachment` (SERTIFIKA/GORSEL)
  - [x] X Adet Fiyatı (kademeli fiyat) — `MaterialPriceBreak` (minQty → price)
- [~] Not: şimdilik tüm türlerde ortak alan seti; tür-bazlı özel alanlar (Şişe/Kartuş farkları) sonraki tur

---

## 3. BELGE İÇE/DIŞA AKTARMA (Import/Export)

### 3.2 Dışa aktarma ✅ TAMAMLANDI (2026-07-24)
Format-genel export altyapısı: [export.ts](backend/src/routes/export.ts) → `/export/:type?format=csv|xlsx|xml|doc`.
`xlsx` kütüphanesiyle **gerçek .xlsx**, XML dökümü, Word-uyumlu **.doc** (HTML tablo), BOM'lu CSV.
Frontend proxy ([export/\[type\]/route.ts](frontend/src/app/export/[type]/route.ts)) binary (xlsx) dahil formatları
session token ile aktarıyor; [ExportButton](frontend/src/components/export-button.tsx) artık **format seçmeli dropdown**.
- [x] Ürün Alım — CSV / **XLSX** / **XML** / **Word** (runtime doğrulandı: `file` → "Microsoft Excel 2007+")
- [x] Ürün Satış — aynı (satış temsilcisine maliyet/kâr kolonları gizli)
- [x] Gider Girişi — aynı (ADMIN-only guard korundu)
- [~] Raporlar — mevcut ExportButton'lar (Gider Raporu vb.) otomatik 4 formatı aldı; rapor-özel tablolar (KDV, gelir tablosu…) aynı `sendExport` deseniyle sonraki tur
- [ ] PDF: gerçek sunucu-PDF için lib yok; şimdilik tarayıcıdan "Yazdır → PDF" (rapor ekstrelerinde mevcut). Sunucu-PDF sonraki tur.

### 3.1 İçe aktarma (veri okuma) ✅ TAMAMLANDI (2026-07-24)
Backend: `multer` + [import.ts](backend/src/routes/import.ts) → `POST /import/:type` (ADMIN-only).
XLSX/CSV/XML parse; Türkçe **veya** İngilizce başlık kabulü; `?commit=true` yoksa **yan etkisiz önizleme**.
Frontend: [proxy route](frontend/src/app/import/[type]/route.ts) + [ImportButton](frontend/src/components/import-button.tsx)
(dosya seç → **Önizle** → hata/geçerli özeti → **Kaydet**). Alım/Satış/Gider sayfalarına bağlı.
- [x] Ürün Alım / Satış / Gider — **XLSX / CSV / XML** içe aktarma (yükle → önizle → kaydet)
- [x] Round-trip doğrulandı: export .xlsx (81 satır) → preview 81 geçerli/0 hata (yazma yok); 1-satır CSV → commit 1 kayıt
- [~] **PDF / WORD içe aktarma kapsam dışı**: serbest formatlı belgeden güvenilir tablo çıkarımı OCR/heuristik ister; şablon-XLSX ile ikame.

---

## 4. ÜRETİM / TEDARİK EMRİ

- [x] Üretim Emri modülü mevcut ([uretim-emri](frontend/src/app/uretim-emri), `ProductionOrder`)
- [ ] Üretim Emri → **Talep Formu** üretmeli: ne üretileceği + kime ürettirileceği; hazır/satıştaki ürün için çalıştırılabilmeli
- [ ] **TEDARİK EMRİ (Yeni)** — hammaddeyi biz satın alacağımızda tedarikçilere **talep formu** oluşturmalı (şu an yok)

---

## 5. TANIMLAMA & CARİ

Mevcut `Partner` alanları: `name, type, contactInfo, phone, email, address, priceTier`
([schema.prisma:72](backend/prisma/schema.prisma#L72)). Tip: CUSTOMER / SUPPLIER / SERVICE_PROVIDER / OWNER / OTHER.

- [x] Tanımlama'da Müşteri / Tedarikçi / Hizmet Veren mevcut ([tanimlama](frontend/src/app/tanimlama))
- [~] "Yeni cari ekle" — cari ekleme formları var ama aşağıdaki alanlar **yok**; genişletilecek:
  - [ ] Firma İsmi
  - [ ] Mersis No
  - [ ] Vergi No
  - [ ] Adres *(var)*
  - [ ] İletişim *(var)*
  - [ ] Web Site

### 5.1 Tedarikçi Detay Seçeneği (Yeni)
- [ ] Firma İsmi / Mersis No / Vergi No / Adres / İletişim / Web Site
- [ ] Talep Formu Oluştur
- [ ] Tedarikçinin Ürünleri — Ürün Detay'dan tıkla-çek liste

### 5.2 Müşteri Detay Seçeneği (Yeni)
- [ ] Adı Soyadı / TC / Adres / Telefon / Mail
- [ ] Sosyal Medya (Instagram, YouTube, LinkedIn)
- [ ] Dükkan Bilgileri / Dükkan Adresi
- [ ] Alınan Ürünler
- [ ] Teklif Formu Oluştur

### 5.3 Hizmet Veren Detay Seçeneği (Yeni)
- [ ] Adı Soyadı / TC / Adres / Telefon / Mail
- [ ] Sosyal Medya / Firma İsmi / Firma Adresi / Web Sitesi / VKN / Mersis
- [ ] Sektörü / Hizmet Alanları / Alınan Hizmetler
- [ ] Talep Oluştur

---

## 6. FORMLAR (başlıklar açılacak, içerik sonra)

Mevcut belgeler: Order, Quote (Teklif), Invoice, DeliveryNote, Return, BOM, ProductionOrder
([documents.ts](backend/src/routes/documents.ts)). Aşağıdaki form tipleri **yok**.

- [ ] Hizmet Sözleşmesi Formu (karma nitelikli / vekâlet usulü / eser sözleşmesi)
- [ ] Talep Formu
- [ ] Termin Formu
- [~] Teklif Formu — `Quote` modeli var, "Teklif Formu" çıktısı standartlaştırılacak
- [ ] İş Başvuru Formu
- [ ] Çerezler İçin Form
- [ ] E-Katalog / Tanıtım Formu

---

## Öncelik önerisi (taslak)
1. Ürün Detay kartı (§1) — modeli ve UI'yi kur; Ürün Alım autocomplete entegrasyonu (§1.4)
2. Cari alan genişletme + detay sayfaları (§5)
3. Materyal Detay (§2)
4. Import/Export standardı (§3)
5. Tedarik Emri + Üretim/Talep formu bağı (§4)
6. Form başlıkları (§6)
