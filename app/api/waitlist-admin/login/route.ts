import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, SESSION_SECONDS, adminConfigured, createAdminSession, isSecureRequest } from '../../../../lib/admin-auth';
import { adminJson } from '../../../../lib/admin-request';
import { rateLimit } from '../../../../lib/rate-limit';
import { getClientIp, hasSameOrigin, hashPrivateValue, safeEqualText } from '../../../../lib/request-security';
import { audit } from '../../../../lib/waitlist-store';

export const runtime = 'nodejs';
const DUMMY_HASH = '$2b$12$Jqnhf6TQh7gGzAfnm4lUOektxckBxeGR5d5.puRLRfcFHmOXOCd6a';

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return adminJson({ error: 'forbidden' }, 403);
  if (!adminConfigured()) return adminJson({ error: 'not_configured' }, 503);
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return adminJson({ error: 'invalid' }, 400); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const ipHash = hashPrivateValue(getClientIp(request.headers));

  try {
    const [ipAllowed, globalAllowed] = await Promise.all([
      rateLimit(`admin-login:ip:${ipHash}`, 900, 5), rateLimit('admin-login:all', 900, 20),
    ]);
    if (!ipAllowed || !globalAllowed) return adminJson({ error: 'locked' }, 429);
  } catch {
    return adminJson({ error: 'busy' }, 503);
  }

  const configuredEmail = process.env.WAITLIST_ADMIN_EMAIL!.trim().toLowerCase();
  let configuredHash = DUMMY_HASH;
  try { configuredHash = Buffer.from(process.env.WAITLIST_ADMIN_PASSWORD_HASH!, 'base64').toString('utf8') || DUMMY_HASH; } catch { /* dummy comparison below */ }
  const emailMatches = safeEqualText(email.padEnd(Math.max(email.length, configuredEmail.length), '\0'), configuredEmail.padEnd(Math.max(email.length, configuredEmail.length), '\0'));
  const passwordMatches = await bcrypt.compare(password, emailMatches ? configuredHash : DUMMY_HASH);
  if (!emailMatches || !passwordMatches) {
    await audit('login_fail', null, ipHash);
    return adminJson({ error: 'credentials', tries_left: 4 }, 401);
  }

  await audit('login_ok', null, ipHash);
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true, secure: isSecureRequest(request), sameSite: 'strict', path: '/', maxAge: SESSION_SECONDS,
  });
  return response;
}
