// =============================================================================
// Auth routes: login + current-user.
// =============================================================================

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/http.js";
import { hashPassword, requireAuth, signToken, verifyPassword, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";

export const authRouter = Router();

authRouter.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const token = signToken({ userId: user.id, role: user.role, name: user.name });
    await recordAudit({ userId: user.id, action: "UPDATE", entityName: "Auth", entityId: user.id, details: "login" });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }),
);

authRouter.get(
  "/auth/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ error: "not_found" });
    res.json(user);
  }),
);

// Issue a fresh token for the current user (sliding session).
authRouter.post(
  "/auth/refresh",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user || !user.isActive) return res.status(401).json({ error: "unauthorized" });
    res.json({ token: signToken({ userId: user.id, role: user.role, name: user.name }) });
  }),
);

// Change your own password (requires the current password).
authRouter.post(
  "/auth/change-password",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const currentPassword = String(req.body?.currentPassword ?? "");
    const newPassword = String(req.body?.newPassword ?? "");
    if (newPassword.length < 6) return res.status(400).json({ error: "weak_password", message: "Yeni şifre en az 6 karakter olmalı." });

    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: "invalid_current_password" });
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
    await recordAudit({ userId: user.id, action: "UPDATE", entityName: "Auth", entityId: user.id, details: "change-password" });
    res.json({ ok: true });
  }),
);
