# CRM (Firma Kayıtları)

Bir firmanın Excel'de tuttuğu kayıtları birebir dijital ortama taşımak için geliştirilen CRM uygulaması.

## Teknolojiler

- Next.js (App Router) + TypeScript
- Tailwind CSS (özel hafif UI bileşenleri)
- Prisma + SQLite (yerel veritabanı)
- SheetJS (xlsx) — Excel okuma/içe aktarma

## Kurulum

```bash
npm install
npx prisma migrate dev   # veritabanını oluşturur
npm run db:seed          # örnek verileri ekler (opsiyonel)
npm run dev              # http://localhost:3000
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run db:seed` | Örnek müşteri/fırsat verisi ekler |
| `npm run db:reset` | Veritabanını sıfırlar ve yeniden kurar |
| `npm run import:excel -- <dosya.xlsx>` | Excel yapısını analiz eder |
| `npm run import:excel -- <dosya.xlsx> --apply` | Excel verisini içe aktarır |

## Yapı

- `src/app/page.tsx` — Genel bakış (dashboard)
- `src/app/musteriler/` — Müşteri listesi, ekleme, düzenleme, detay (CRUD)
- `src/app/firsatlar/` — Fırsat (deal) yönetimi
- `src/components/` — UI ve layout bileşenleri
- `prisma/schema.prisma` — Veri modeli
- `scripts/import-excel.ts` — Excel analiz/içe aktarma aracı

## Excel'den Birebir Aktarım (Sonraki Adım)

Şu an uygulama, örnek bir `Customer` ve `Deal` modeliyle uçtan uca çalışan bir CRM iskeletidir.
Firmanın gerçek Excel dosyası proje klasörüne eklendiğinde:

1. `npm run import:excel -- firma.xlsx` ile tüm sayfa ve sütunlar analiz edilir.
2. `prisma/schema.prisma`, Excel'deki sayfa/sütunlara birebir karşılık gelecek şekilde güncellenir.
3. Migration çalıştırılır ve `--apply` ile veriler içe aktarılır.
4. İlgili CRUD sayfaları yeni modele göre genişletilir.
