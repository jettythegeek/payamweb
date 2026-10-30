import { revalidatePath } from 'next/cache';
import { adminJson, authorizedAdminRequest } from '../../../../lib/admin-request';
import { remove } from '../../../../lib/waitlist-store';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const auth = authorizedAdminRequest(request, true); if (!auth.ok) return adminJson({ error: 'unauthorized' }, auth.status);
  let body: { id?: unknown; reason?: unknown }; try { body = await request.json(); } catch { return adminJson({ error: 'invalid' }, 400); }
  const id = Number(body.id); const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (!Number.isSafeInteger(id) || id < 1 || !reason || reason.length > 120) return adminJson({ error: 'invalid' }, 422);
  const { data, error } = await remove(id, reason, auth.ipHash); if (error) return adminJson({ error: 'busy' }, 503);
  if (!data) return adminJson({ error: 'not_found' }, 404); revalidatePath('/waitlist-admin'); return adminJson({ ok: true });
}
