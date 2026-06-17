// =============================================================================
// Authentication & RBAC helpers (spec D).
//
// Stateless JWT auth: login returns a signed token carrying the user's id and
// role; protected routes verify it via the requireAuth/requireRole middleware.
// =============================================================================

import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

// JWT secret is mandatory. In production a missing secret is a hard failure;
// in development we fall back to a clearly-marked insecure value with a warning.
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required (min 16 chars) in production.");
  }
  console.warn("⚠ JWT_SECRET not set — using an insecure development fallback. Set it in .env.");
  return "dev-only-insecure-secret-change-me";
})();
const TOKEN_TTL = "12h";

export interface AuthPayload {
  userId: number;
  role: UserRole;
  name: string;
}

/** Express request augmented with the authenticated user (set by requireAuth). */
export interface AuthedRequest extends Request {
  auth?: AuthPayload;
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  // Fallback to an httpOnly cookie (set by the frontend).
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return cookies?.token ?? null;
}

/** Reject the request unless it carries a valid token. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    req.auth = jwt.verify(token, JWT_SECRET) as AuthPayload;
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

/** Reject the request unless the authenticated user has one of the given roles. */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: "unauthorized" });
    if (!roles.includes(req.auth.role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}
