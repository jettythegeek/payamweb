import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '../../../../lib/admin-auth';
import { authorizedAdminRequest } from '../../../../lib/admin-request';
import { audit } from '../../../../lib/waitlist-store';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const auth = authorizedAdminRequest(request, true);
  if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: auth.status });
  await audit('logout', null, auth.ipHash);
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
