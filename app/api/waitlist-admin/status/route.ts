import { revalidatePath } from 'next/cache';
import { adminJson, authorizedAdminRequest } from '../../../../lib/admin-request';
import { setStatus } from '../../../../lib/waitlist-store';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const auth = authorizedAdminRequest(request, true); if (!auth.ok) return adminJson({ error: 'unauthorized' }, auth.status);
  let body: { id?: unknown; status?: unknown }; try { body = await request.json(); } catch { return adminJson({ error: 'invalid' }, 400); }
  const id = Number(body.id); const status = body.status;
  if (!Number.isSafeInteger(id) || id < 1 || !['joined','confirmed','unsubscribed'].includes(String(status))) return adminJson({ error: 'invalid' }, 422);
  const { data, error } = await setStatus(id, String(status), auth.ipHash); if (error) return adminJson({ error: 'busy' }, 503);
  if (!data) return adminJson({ error: 'not_found' }, 404); revalidatePath('/waitlist-admin'); return adminJson({ ok: true });
}
