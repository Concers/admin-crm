// =============================================================================
// Audit logging (işlem geçmişi) — records who changed what and when.
// =============================================================================

import { prisma } from "./prisma.js";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

/**
 * Write an audit entry. Best-effort: logging must never break the main request,
 * so failures are swallowed (and logged to the console).
 */
export async function recordAudit(params: {
  userId?: number | null;
  action: AuditAction;
  entityName: string;
  entityId?: number | null;
  details?: unknown;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityName: params.entityName,
        entityId: params.entityId ?? null,
        details: params.details ? JSON.stringify(params.details) : null,
      },
    });
  } catch (error) {
    console.error("audit log failed", error);
  }
}
