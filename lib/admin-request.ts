import 'server-only';

import { getClientIp, hasSameOrigin, hashPrivateValue } from './request-security';

/** Auth is disabled so the waitlist admin page and APIs are openly readable/usable. */
export function authorizedAdminRequest(request: Request, csrf = false): { ok: true; ipHash: string } | { ok: false; status: number } {
  if (csrf && !hasSameOrigin(request)) return { ok: false, status: 403 };
  return { ok: true, ipHash: hashPrivateValue(getClientIp(request.headers)) };
}

export function adminJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
}
