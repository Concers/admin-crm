// =============================================================================
// Kadim Naturel ERP — REST API
//
// This service is the single owner of the database and Prisma schema; the
// frontend consumes these endpoints rather than importing Prisma directly.
// =============================================================================

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import { prisma } from "./lib/prisma.js";
import { requireAuth } from "./lib/auth.js";
import { authRouter } from "./routes/auth.js";
import { masterDataRouter } from "./routes/masterData.js";
import { transactionsRouter } from "./routes/transactions.js";
import { reportsRouter } from "./routes/reports.js";
import { adminRouter } from "./routes/admin.js";
import { inventoryRouter } from "./routes/inventory.js";
import { documentsRouter } from "./routes/documents.js";
import { exportRouter } from "./routes/export.js";
import { importRouter } from "./routes/import.js";
import { requestFormsRouter } from "./routes/requestForms.js";
import { reconciliationRouter } from "./routes/reconciliation.js";
import { financeRouter } from "./routes/finance.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Allow the frontend origin and cookie credentials.
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Kadim Naturel ERP backend is running" });
});

// Public auth endpoints (login). Everything below requires a valid token.
app.use("/api", authRouter);
app.use("/api", requireAuth);

app.use("/api", masterDataRouter);
app.use("/api", transactionsRouter);
app.use("/api", reportsRouter);
app.use("/api", adminRouter);
app.use("/api", inventoryRouter);
app.use("/api", documentsRouter);
app.use("/api", exportRouter);
app.use("/api", importRouter);
app.use("/api", requestFormsRouter);
app.use("/api", reconciliationRouter);
app.use("/api", financeRouter);

// Centralised error handler.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  console.log(`Kadim Naturel ERP backend listening on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
