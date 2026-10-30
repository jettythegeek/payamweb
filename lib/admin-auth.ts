import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'payam_admin';
export const SESSION_SECONDS = 8 * 60 * 60;

type Payload = { sub: 'admin'; exp: number };

function sessionSecret(): string | null {
  const value = process.env.WAITLIST_SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function adminConfigured(): boolean {
  return Boolean(process.env.WAITLIST_ADMIN_EMAIL && process.env.WAITLIST_ADMIN_PASSWORD_HASH && sessionSecret());
}

export function createAdminSession(now = Math.floor(Date.now() / 1000)): string {
  const secret = sessionSecret();
  if (!secret) throw new Error('Admin session is not configured.');
  const body = Buffer.from(JSON.stringify({ sub: 'admin', exp: now + SESSION_SECONDS } satisfies Payload)).toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

export function verifyAdminSession(token: string | undefined, now = Math.floor(Date.now() / 1000)): boolean {
  const secret = sessionSecret();
  if (!token || !secret) return false;
  const [body, signature, ...extra] = token.split('.');
  if (!body || !signature || extra.length) return false;
  const expected = Buffer.from(sign(body, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Partial<Payload>;
    return payload.sub === 'admin' && typeof payload.exp === 'number' && payload.exp > now;
  } catch { return false; }
}

export async function hasAdminSession(): Promise<boolean> {
  return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

export function isSecureRequest(request: Request): boolean {
  const proto = request.headers.get('x-forwarded-proto');
  if (proto?.split(',')[0].trim() === 'https') return true;
  const hostname = new URL(request.url).hostname;
  return !['localhost', '127.0.0.1', '[::1]'].includes(hostname);
}
