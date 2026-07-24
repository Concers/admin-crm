// =============================================================================
// Formlar (§6) — genel belge iskeleti: Hizmet Sözleşmesi, Termin, İş Başvuru,
// Çerez, E-Katalog… Başlık + serbest içerik (sonradan doldurulur). CRUD + PDF.
// Teklif (Quote) ve Talep (RequestForm) ayrı modüllerde.
// =============================================================================

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, parseId } from "../lib/http.js";
import { requireRole, type AuthedRequest } from "../lib/auth.js";
import { recordAudit } from "../lib/audit.js";
import { documentToPdf } from "../lib/pdf.js";

export const formsRouter = Router();

const KINDS = new Set(["SERVICE_CONTRACT", "TERMIN", "JOB_APPLICATION", "COOKIE_CONSENT", "ECATALOG", "OTHER"]);
const STATUSES = new Set(["DRAFT", "ACTIVE", "ARCHIVED"]);

const KIND_LABEL: Record<string, string> = {
  SERVICE_CONTRACT: "Hizmet Sözleşmesi",
  TERMIN: "Termin Formu",
  JOB_APPLICATION: "İş Başvuru Formu",
  COOKIE_CONSENT: "Çerezler İçin Form",
  ECATALOG: "E-Katalog / Tanıtım Formu",
  OTHER: "Form",
};

const opt = (v: unknown) => {
  if (v === undefined) return undefined;
  const s = String(v ?? "").trim();
  return s || null;
};

formsRouter.get(
  "/forms",
  asyncHandler(async (req, res) => {
    const kind = typeof req.query.kind === "string" && KINDS.has(req.query.kind) ? req.query.kind : undefined;
    res.json(
      await prisma.genericForm.findMany({
        where: kind ? { kind: kind as never } : undefined,
        include: { partner: true },
        orderBy: { date: "desc" },
      }),
    );
  }),
);

formsRouter.get(
  "/forms/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const form = await prisma.genericForm.findUnique({ where: { id }, include: { partner: true } });
    if (!form) return res.status(404).json({ error: "not_found" });
    res.json(form);
  }),
);

formsRouter.post(
  "/forms",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = req.body ?? {};
    const kind = String(body.kind ?? "").toUpperCase();
    if (!KINDS.has(kind)) return res.status(400).json({ error: "invalid kind" });
    const title = opt(body.title) ?? KIND_LABEL[kind];
    const form = await prisma.genericForm.create({
      data: {
        kind: kind as never,
        subtype: opt(body.subtype) ?? null,
        title: title as string,
        partnerId: body.partnerId ? parseId(body.partnerId) : null,
        body: opt(body.body) ?? null,
      },
      include: { partner: true },
    });
    await recordAudit({ userId: req.auth?.userId, action: "CREATE", entityName: "GenericForm", entityId: form.id });
    res.status(201).json(form);
  }),
);

formsRouter.put(
  "/forms/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const existing = await prisma.genericForm.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "not_found" });
    const body = req.body ?? {};
    const status = body.status !== undefined ? String(body.status).toUpperCase() : undefined;
    if (status !== undefined && !STATUSES.has(status)) return res.status(400).json({ error: "invalid status" });
    const form = await prisma.genericForm.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: opt(body.title) ?? existing.title } : {}),
        ...(body.subtype !== undefined ? { subtype: opt(body.subtype) } : {}),
        ...(body.body !== undefined ? { body: opt(body.body) } : {}),
        ...(status ? { status } : {}),
        ...(body.partnerId !== undefined ? { partnerId: body.partnerId ? parseId(body.partnerId) : null } : {}),
      },
      include: { partner: true },
    });
    await recordAudit({ userId: req.auth?.userId, action: "UPDATE", entityName: "GenericForm", entityId: id });
    res.json(form);
  }),
);

formsRouter.delete(
  "/forms/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    await prisma.genericForm.delete({ where: { id } });
    await recordAudit({ userId: req.auth?.userId, action: "DELETE", entityName: "GenericForm", entityId: id });
    res.status(204).end();
  }),
);

formsRouter.get(
  "/forms/:id/pdf",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "invalid id" });
    const form = await prisma.genericForm.findUnique({ where: { id }, include: { partner: true } });
    if (!form) return res.status(404).json({ error: "not_found" });

    // Serbest içeriği paragraf satırlarına böl.
    const bodyLines = (form.body ?? "").split(/\r?\n/).filter((l) => l.trim());
    const pdf = await documentToPdf({
      title: form.title,
      subtitle: `${KIND_LABEL[form.kind] ?? "Form"}${form.subtype ? " · " + form.subtype : ""}`,
      info: [
        ["Tarih", new Date(form.date).toLocaleDateString("tr-TR")],
        ...(form.partner ? ([["İlgili Cari", form.partner.name]] as [string, string][]) : []),
        ["Durum", form.status],
      ],
      columns: ["İçerik"],
      rows: bodyLines.length ? bodyLines.map((l) => [l]) : [["(İçerik henüz doldurulmadı.)"]],
      footer: "Kadim Naturel ERP — Form belgesi.",
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="form-${form.id}.pdf"`);
    res.send(pdf);
  }),
);
