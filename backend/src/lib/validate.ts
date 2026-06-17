// =============================================================================
// Request-body validation helper built on zod. Returns the parsed value or
// sends a 400 with field-level error details and returns null.
// =============================================================================

import type { Response } from "express";
import type { ZodType } from "zod";

export function validateBody<T>(schema: ZodType<T>, body: unknown, res: Response): T | null {
  const result = schema.safeParse(body);
  if (!result.success) {
    res.status(400).json({
      error: "validation_error",
      details: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return null;
  }
  return result.data;
}
