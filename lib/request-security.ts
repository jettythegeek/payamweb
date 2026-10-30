import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

export function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || 'unknown';
}

export function hashPrivateValue(value: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt || salt.length < 32) throw new Error('IP_HASH_SALT must contain at least 32 characters.');
  return createHmac('sha256', salt).update(value).digest('hex');
}

export function safeEqualText(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
