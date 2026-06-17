// =============================================================================
// Session helpers (server-side). The JWT issued by the backend is stored in an
// httpOnly cookie; here we read it and decode its (already-trusted) payload to
// learn the current user's role/name. Signature verification is the backend's
// job — these helpers are only for UI/routing decisions.
// =============================================================================

import { cookies } from "next/headers";
import type { UserRole } from "./roles";

export type { UserRole } from "./roles";
export { ROLE_LABELS } from "./roles";

export interface Session {
  userId: number;
  role: UserRole;
  name: string;
}

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("token")?.value ?? null;
}

/** Decode the JWT payload (no verification) into a Session, or null. */
export function decodeSession(token: string | null): Session | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64").toString("utf8");
    const data = JSON.parse(json) as Session;
    if (!data.role) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  return decodeSession(await getToken());
}
