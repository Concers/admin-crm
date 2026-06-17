// =============================================================================
// Admin routes: user management + audit-log viewing. Admin-only.
// =============================================================================

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId } from "../lib/http.js";
import { hashPassword, requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import { validateBody } from "../lib/validate.js";
import { parseListQuery, paginate } from "../lib/query.js";

export const adminRouter = Router();

// Guard each admin route individually (a blanket router.use would also block
// pass-through requests destined for routers mounted after this one).
const adminOnly = requireRole("ADMIN");

const USER_SELECT = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } as const;

// --- Users -------------------------------------------------------------------
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "SALES_REP", "WAREHOUSE_MANAGER"]),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "SALES_REP", "WAREHOUSE_MANAGER"]).optional(),
  isActive: z.boolean().optional(),
});

adminRouter.get(
  "/users",
  adminOnly,
  asyncHandler(async (_req, res) => {
    res.json(await prisma.user.findMany({ select: USER_SELECT, orderBy: { createdAt: "asc" } }));
  }),
);

adminRouter.post(
  "/users",
  adminOnly,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = validateBody(createUserSchema, req.body, res);
    if (!data) return;
    const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) return res.status(409).json({ error: "email_taken" });

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        passwordHash: await hashPassword(data.password),
      },
      select: USER_SELECT,
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "User", entityId: user.id });
    res.status(201).json(user);
  }),
);

adminRouter.put(
  "/users/:id",
  adminOnly,
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const data = validateBody(updateUserSchema, req.body, res);
    if (!data) return;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email?.toLowerCase(),
        role: data.role,
        isActive: data.isActive,
        ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
      },
      select: USER_SELECT,
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "User", entityId: id });
    res.json(user);
  }),
);

adminRouter.delete(
  "/users/:id",
  adminOnly,
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (id === req.auth?.userId) return res.status(400).json({ error: "cannot_delete_self" });
    await prisma.user.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "User", entityId: id });
    res.status(204).end();
  }),
);

// --- Audit logs --------------------------------------------------------------
adminRouter.get(
  "/audit-logs",
  adminOnly,
  asyncHandler(async (req, res) => {
    const q = parseListQuery(req);
    const where = q.q ? { entityName: { contains: q.q } } : {};
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, role: true } } },
    });
    res.json(paginate(logs, q, res));
  }),
);
