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
