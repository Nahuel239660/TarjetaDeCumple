import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "nahuel_bday_admin";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 14;

interface SessionPayload {
  exp: number;
  nonce: string;
}

function getSessionSecret(): string | null {
  return process.env.SESSION_SECRET || null;
}

function encode(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function verify(token: string, secret: string): SessionPayload | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload, secret);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    return typeof value.exp === "number" && value.exp > Date.now() / 1000 && typeof value.nonce === "string" ? value : null;
  } catch {
    return null;
  }
}

export async function hasAdminSession(): Promise<boolean> {
  const secret = getSessionSecret();
  if (!secret) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(token && verify(token, secret));
}

export async function createAdminSession(): Promise<void> {
  const secret = getSessionSecret();
  if (!secret) throw new Error("SESSION_SECRET no está configurada.");
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = encode({ exp, nonce: crypto.randomUUID() });
  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp * 1000),
  });
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function requireAdminAction(): Promise<void> {
  if (!await hasAdminSession()) throw new Error("No autorizado.");
}
