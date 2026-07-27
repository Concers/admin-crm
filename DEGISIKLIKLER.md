# Değişiklikler & Yol Haritası

> Kaynak: [YAPILACAKLAR.md](YAPILACAKLAR.md) spesifikasyonu (§1–§6).
> Tümü `Concers/admin-crm` **master**'a push edildi; her modül runtime doğrulandı.
> Son güncelleme: 2026-07-24.

---

## Bölüm 1 — Tamamlanan İşler (§1–§6)

### §1 Ürün Detay
- **Öncesi:** `Product` sadece 7 temel alan; zengin ürün kartı yok.
- **Eklendi:**
  - `Product`'a 20+ künye alanı (GTİP/HS/UN, botanik/İngilizce ad, CAS/INCI, menşei, kemotip, genotip, varyete, coğrafi popülasyon, bitki bölümü, üretim şekli, DER, tarihçe, kullanım alanları, sektör-CSV, `isBfm`).
  - Yeni modeller: `ProductLink` (makale/blog/instagram), `ProductPartnerLink` (tedarikçi/potansiyel/müşteri). `Attachment`'a `category`.
  - `GET /products/:id` + link/cari-bağ CRUD.
  - `/urun-detay` liste + kart (künye formu, tedarikçi/müşteri, içerik linkleri, 4 kategorili dosya kutusu).
  - **Ürün Alım akışı:** yazılabilir combobox + canlı durum + "Kartı Tamamla →"; listede "detay eksik" rozeti.

### §2 Materyal Detay
- **Öncesi:** Model/sayfa yok.
- **Eklendi:** `Material` + `MaterialPartnerLink` + `MaterialPriceBreak` (kademeli fiyat). `/materyal` kategori/alt-tür gruplu liste + kart.

### §3 Export / Import
- **Öncesi:** Yalnızca CSV export (3 uç).
- **Eklendi:**
  - Export: `/export/:type?format=csv|xlsx|xml|doc|pdf` — gerçek .xlsx, XML, Word .doc, Türkçe fontlu PDF (pdfmake + Roboto). Format dropdown.
  - Import: `multer` + `/import/:type` — XLSX/CSV/XML parse, TR/EN başlık, önizleme + commit. Alım/Satış/Gider'e bağlı.

### §4 Üretim / Tedarik Emri
- **Öncesi:** Üretim Emri talep formu üretmiyor; Tedarik Emri yok.
- **Eklendi:** `RequestForm` + `RequestFormLine`. Üretim Emri → "Talep Formu Oluştur"; `/tedarik-emri` (PROCUREMENT); `/talep-formu` liste+detay; PDF çıktısı.

### §5 Cari alan genişletme + detay
- **Öncesi:** `Partner` 7 alan; detay sayfası yok.
- **Eklendi:** `Partner`'a VKN/Vergi No, Mersis, web, TC, firma/dükkan, sektör, hizmet alanları, sosyal medya. `GET /partners/:id`; `/cari/[id]` tip-bilinçli detay + ilişkili ürün/hizmet listeleri + Talep/Teklif aksiyonu.

### §6 Formlar
- **Öncesi:** Sözleşme/Termin/İş Başvuru/Çerez/E-Katalog yok.
- **Eklendi:** Esnek `GenericForm`; `/formlar` hub + `/formlar/[id]` detay (alt tür, içerik, durum, PDF).

### §7 Quora markası + tanıtım sayfası
- **Öncesi:** Marka "Kadim Naturel / Kadim ERP"; kök adres yalnızca panel, oturumsuz ziyaretçi doğrudan `/login`'e düşüyordu.
- **Eklendi:**
  - **Marka:** Panel, giriş ekranı, metadata, sidebar/mobil menü, cari ekstre çıktısı, tur ve backend log metinleri **Quora** oldu. Ortak logo: `components/brand/quora-mark.tsx` (raflı depo duvarı işareti).
  - **Tanıtım sayfası:** `components/landing/landing-page.tsx` — "modül duvarı" (7 bölüm / 51 ekran, `lib/navigation.ts` ile birebir), bir günün akışı (gider → alım → üretim → raf → satış → tahsilat), roller ve çıktı/aktarım bölümleri. Sunucu bileşeni; hareket tamamen CSS (`globals.css → .qr-*`), `prefers-reduced-motion` destekli.
  - **Yönlendirme:** Kök adres artık çift görevli — `app/page.tsx` oturum yoksa tanıtım, varsa panonun kendisi. `proxy.ts` `/` yolunu herkese açtı, `AppShell` oturumsuz kökte kabuğu gizliyor.
  - **Giriş ekranı:** Sunucu sayfası + `login-form.tsx` istemci bileşeni olarak ayrıldı; `?expired=1` için "oturum süresi doldu" uyarısı eklendi, ekrandaki demo hesap bilgisi kaldırıldı.

---

## Bölüm 2 — Teknik Envanter (bu turda eklenen)

**Migration'lar:** `add_product_detail`, `add_material`, `add_request_form`, `expand_partner`, `add_generic_form`
**Yeni modeller:** ProductLink, ProductPartnerLink, Material, MaterialPartnerLink, MaterialPriceBreak, RequestForm, RequestFormLine, GenericForm (+ Product/Partner/Attachment genişletmeleri)
**Yeni backend route:** `import.ts`, `requestForms.ts`, `forms.ts` (+ export/masterData genişletme, `lib/pdf.ts`)
**Yeni frontend modül:** `/urun-detay`, `/materyal`, `/talep-formu`, `/tedarik-emri`, `/cari`, `/formlar`
**Yeni bağımlılık:** `pdfmake@0.2.20`, `multer@2.2.0` + `backend/assets/fonts` (Roboto TTF)
**Commit'ler:** `0628ea4` (§1–3), `8bff113` (§3.1), `d6a51da` (§4), `2a9179f` (§5), `a5948ea` (§6)

---

## Bölüm 3 — Planlanan İşler (Yol Haritası)

Öncelik: **P1 (yüksek/iş değeri)** · **P2 (orta)** · **P3 (düşük/nice-to-have)**
Efor: **S** (birkaç saat) · **M** (1 gün) · **L** (birkaç gün)

### P1 — İş akışını tamamlayan bağlar
| # | İş | Efor | Not |
|---|----|------|-----|
| 1 | **Gerçek dosya upload** (analiz/sertifika/görsel/etiket) — şu an sadece URL+ad kaydı | L | `multer` var; dosya depolama (disk/S3) + statik servis + Attachment.url gerçek dosyaya bağlanır |
| 2 | **Materyal ↔ Ürün bağı** — Ürün Detay "Ambalaj Bilgileri" materyal kartından çekilsin | M | `ProductMaterialLink` modeli + Ürün Detay'da seçici |
| 3 | **Materyal ↔ Talep/Termin** — talep formu kaleminde materyal kartı seçilebilsin | M | RequestFormLine'a `materialId` opsiyonu |
| 4 | **BOM → Tedarik Emri otomatik doldurma** — reçete bileşenlerini tedarik talebine çek | M | Üretim emri/BOM'dan hammadde listesi → PROCUREMENT satırları |

### P2 — Zenginleştirme
| # | İş | Efor | Not |
|---|----|------|-----|
| 5 | **Seçenek admin paneli** — sektör / kullanım alanı / materyal alt-tür listelerini panelden yönet | M | Genel `OptionList` modeli (grup+değer), ExpenseCategory benzeri |
| 6 | **Tür-bazlı materyal alanları** — Şişe/Kartuş/Şase için ek alan setleri | M | Material'e `attributes Json` veya tür şablonları |
| 7 | **Rapor-özel PDF/XLSX** — KDV, gelir tablosu vb. raporlara çok-format çıktı | M | `sendExport` deseni rapor tablolarına genişletilir |
| 8 | **Termin Formu'nu yapılandır** — serbest metinden yapılandırılmış termin planına (tarih/aşama) | M | GenericForm yerine `TerminForm` + satırlar veya Json alanlar |
| 9 | **İş Başvuru Formu alanları** — aday bilgileri için yapılandırılmış form | S | Json alanlar + başvuru listesi |

### P3 — İleri seviye / opsiyonel
| # | İş | Efor | Not |
|---|----|------|-----|
| 10 | **BFM Ürün ayrı reçete ekranı** — çok bileşenli satış ürünü için özel akış | L | `isBfm` var; ayrı BOM/kompozisyon UI |
| 11 | **Nihai Etiket vektörel yönetimi** — SVG/vektör önizleme + tek tık indirme | M | Upload (#1) üstüne SVG render |
| 12 | **PDF/WORD içe aktarma** — serbest belgeden tablo çıkarımı | L | OCR/heuristik gerektirir; genelde şablon-XLSX tercih edilir |
| 13 | **Talep Formu şablonları** — sözleşme/çerez metinleri için hazır şablon kütüphanesi | S | Hazır body metinleri + "şablondan oluştur" |

---

## Önerilen sıra
1. **#1 Dosya upload** — diğer birçok özelliğin (etiket, görsel, sertifika) gerçek değeri buna bağlı.
2. **#2 + #3 + #4** — modüller arası bağları kurup veriyi tek akışta birleştir.
3. **#5 Seçenek admini** — "panelden sonradan eklenebilir" isteğini kapatır (birçok yerde geçiyor).
4. Kalanlar ihtiyaç sırasına göre.
