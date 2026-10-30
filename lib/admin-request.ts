import 'server-only';

import { ADMIN_COOKIE, verifyAdminSession } from './admin-auth';
import { getClientIp, hasSameOrigin, hashPrivateValue } from './request-security';

export function authorizedAdminRequest(request: Request, csrf = false): { ok: true; ipHash: string } | { ok: false; status: number } {
  if (csrf && !hasSameOrigin(request)) return { ok: false, status: 403 };
  const cookie = request.headers.get('cookie')?.split(';').map((v) => v.trim()).find((v) => v.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  if (!verifyAdminSession(cookie)) return { ok: false, status: 401 };
  return { ok: true, ipHash: hashPrivateValue(getClientIp(request.headers)) };
}

export function adminJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
}
