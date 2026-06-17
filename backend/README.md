# CRM Backend

This folder contains a dedicated API layer for the CRM project.

## Endpoints

- `GET /api/health` — checks if the backend is running
- `GET /api/summary` — returns counts and totals for products, partners, sales, purchases, and expenses
- `GET /api/products` — lists products
- `GET /api/partners` — lists partners/suppliers
- `GET /api/purchases` — lists purchase records
- `GET /api/sales` — lists sales records
- `GET /api/expenses` — lists expense records

## Development

```bash
cd backend
npm install
npm run dev
```

The API expects the Prisma SQLite database to be available at the root project level.
