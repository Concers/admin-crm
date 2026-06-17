// =============================================================================
// Seed initial users (one per role). Idempotent — upserts by email.
//
//   npm run db:seed-users
//
// Credentials come from env (ADMIN_EMAIL / ADMIN_PASSWORD …) or fall back to
// documented defaults for local development. CHANGE THESE IN PRODUCTION.
// =============================================================================

import { PrismaClient, type UserRole } from "@prisma/client";
import { hashPassword } from "../lib/auth.js";

const prisma = new PrismaClient();

const SEED_USERS: { name: string; email: string; password: string; role: UserRole }[] = [
  {
    name: "Yönetici",
    email: process.env.ADMIN_EMAIL ?? "admin@kadim.local",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
    role: "ADMIN",
  },
  {
    name: "Satış Temsilcisi",
    email: process.env.SALES_EMAIL ?? "satis@kadim.local",
    password: process.env.SALES_PASSWORD ?? "satis123",
    role: "SALES_REP",
  },
  {
    name: "Depo Sorumlusu",
    email: process.env.WAREHOUSE_EMAIL ?? "depo@kadim.local",
    password: process.env.WAREHOUSE_PASSWORD ?? "depo123",
    role: "WAREHOUSE_MANAGER",
  },
];

async function main() {
  for (const u of SEED_USERS) {
    const passwordHash = await hashPassword(u.password);
    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: { name: u.name, role: u.role, passwordHash, isActive: true },
      create: { name: u.name, email: u.email.toLowerCase(), role: u.role, passwordHash },
    });
    console.log(`  seeded ${u.role}: ${u.email}`);
  }
  console.log("Done. Default passwords are for local dev — change them in production.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
