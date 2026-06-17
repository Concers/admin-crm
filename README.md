# Kadim Naturel — Mini ERP

Excel'de tutulan cari/stok/gider kayıtlarını ilişkisel bir veritabanına taşıyan,
backend API + frontend arayüzünden oluşan Mini-ERP uygulaması.

## Mimari (monorepo)

```
crm-proje/
├── backend/      # Express + Prisma + SQLite — veritabanının TEK sahibi
│   ├── prisma/   # şema + migration + dev.db (kanonik veritabanı)
│   └── src/
│       ├── lib/        # prisma client, hesaplama & raporlama motoru
│       ├── routes/     # masterData / transactions / reports REST uçları
│       └── scripts/    # importFromExcel.ts (tek seferlik veri göçü)
└── frontend/     # Next.js (App Router) — yalnızca arayüz, Prisma YOK
    └── src/
        ├── app/        # sayfalar + server actions (backend API'yi çağırır)
        └── lib/api.ts  # tipli backend API istemcisi
```

Frontend kendi veritabanını tutmaz; tüm okuma/yazma işlemleri `backend` REST
API'si üzerinden yapılır.

## Kurulum

```bash
# 1) Backend
cd backend
npm install
npx prisma migrate deploy          # şemayı uygula
npm run db:import                  # Excel'den veriyi içe aktar (kök dizindeki .xlsx)
npm run dev                        # http://localhost:4000

# 2) Frontend (ayrı terminal)
cd frontend
npm install
npm run dev                        # http://localhost:3000  (API_URL .env'de)
```

## Teknolojiler

- **Backend:** Express, Prisma, SQLite, SheetJS (xlsx — yalnızca göç scripti)
- **Frontend:** Next.js (App Router) + TypeScript, Tailwind CSS

## Veri göçü notu

Kaynak Excel sayfalarında A sütunu boştur; gerçek veri B sütunundan başlar.
`backend/src/scripts/importFromExcel.ts` doğru kolon haritasıyla okur ve
maliyet/kâr ile amortisman alanlarını workbook'a sadık biçimde aktarır.
