import 'server-only';
import { randomInt } from 'node:crypto';
import type { InValue, Transaction } from '@libsql/client';
import { database } from './turso';
export type JoinInput = {
 phoneE164: string; phoneHash: string; city: string; cityIsOther: boolean; roles: string[];
 email: string | null; emailOptIn: boolean; ref: string | null; utmSource: string | null;
 utmMedium: string | null; utmCampaign: string | null; ipHash: string | null; userAgent: string;
};
type Filters = { q?: string; city?: string; role?: string; status?: string; includeUnsubscribed?: boolean; limit?: number; offset?: number };
async function result<T>(work: () => Promise<T>): Promise<{ data: T | null; error: { code: string } | null }> {
 try { return { data: await work(), error: null }; }
 catch { return { data: null, error: { code: 'storage_unavailable' } }; }
}
async function transaction<T>(work: (tx: Transaction) => Promise<T>) {
 const tx = await database().transaction('write');
 try { const value = await work(tx); await tx.commit(); return value; }
 catch (error) { await tx.rollback(); throw error; }
 finally { tx.close(); }
}
async function log(tx: Transaction, action: string, detail: string | null, ipHash: string | null) {
 await tx.execute({ sql: 'INSERT INTO admin_audit_log(action,detail,ip_hash) VALUES(?,?,?)', args: [action, detail, ipHash] });
}
export function join(input: JoinInput) {
 return result(() => transaction(async tx => {
  if ((await tx.execute({ sql: 'SELECT id FROM waitlist_signups WHERE phone_e164=?', args: [input.phoneE164] })).rows.length) return { status: 'duplicate' };
  const ref = input.ref ? await tx.execute({ sql: 'SELECT id FROM waitlist_signups WHERE referral_code=?', args: [input.ref.toUpperCase()] }) : null;
  const alphabet = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  for (let attempt = 0; attempt < 8; attempt++) {
   const code = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
   if ((await tx.execute({ sql: 'SELECT id FROM waitlist_signups WHERE referral_code=?', args: [code] })).rows.length) continue;
   await tx.execute({ sql: `INSERT INTO waitlist_signups(phone_e164,phone_hash,city,city_is_other,roles,email,email_opt_in,wa_consent,consent_text_version,referral_code,referred_by_id,utm_source,utm_medium,utm_campaign,ip_hash,user_agent) VALUES(?,?,?,?,?,?,?,1,?,?,?,?,?,?,?,?)`, args: [input.phoneE164,input.phoneHash,input.city,Number(input.cityIsOther),JSON.stringify(input.roles),input.email,Number(input.emailOptIn && Boolean(input.email)),'wa-2026-11-v1',code,ref?.rows[0]?.id ?? null,input.utmSource,input.utmMedium,input.utmCampaign,input.ipHash,input.userAgent.slice(0,255)] });
   return { status: 'joined', referral_code: code, city: input.city };
  }
  throw new Error('Referral allocation failed');
 }));
}
export function referralCount(code: string) {
 return result(async () => Number((await database().execute({ sql: 'SELECT count(*) n FROM waitlist_signups s JOIN waitlist_signups r ON s.referred_by_id=r.id WHERE r.referral_code=?', args: [code.toUpperCase()] })).rows[0].n));
}
export function summary() {
 return result(async () => {
  const sets = await database().batch([
   `SELECT count(*) total,coalesce(sum(status='confirmed'),0) confirmed,coalesce(sum(status='joined'),0) not_confirmed,coalesce(sum(status='unsubscribed'),0) unsubscribed,coalesce(sum(EXISTS(SELECT 1 FROM json_each(roles) WHERE value IN ('sell','serve','drive'))),0) businesses FROM waitlist_signups`,
   'SELECT city,count(*) count FROM waitlist_signups GROUP BY city ORDER BY count DESC,city',
   'SELECT value role,count(*) count FROM waitlist_signups,json_each(roles) GROUP BY value',
   'SELECT r.referral_code code,count(*) count FROM waitlist_signups s JOIN waitlist_signups r ON s.referred_by_id=r.id GROUP BY r.referral_code ORDER BY count DESC,code LIMIT 10',
  ], 'read');
  return { totals: sets[0].rows[0], by_city: sets[1].rows, by_role: Object.fromEntries(sets[2].rows.map(row => [row.role, row.count])), top_referrers: sets[3].rows };
 });
}
function where(filters: Filters) {
 const clauses: string[] = []; const args: InValue[] = [];
 if (filters.city) { clauses.push('s.city=?'); args.push(filters.city); }
 if (filters.role) { clauses.push('EXISTS(SELECT 1 FROM json_each(s.roles) WHERE value=?)'); args.push(filters.role); }
 if (filters.status) { clauses.push('s.status=?'); args.push(filters.status); }
 else if (!filters.includeUnsubscribed) clauses.push("s.status <> 'unsubscribed'");
 if (filters.q) {
  const digits = filters.q.replace(/\D/g, '');
  clauses.push('(instr(lower(coalesce(s.email,\'\')),lower(?))>0 OR s.referral_code=? OR (? AND instr(s.phone_e164,?)>0))');
  args.push(filters.q, filters.q.toUpperCase(), Number(digits.length >= 3), digits);
 }
 return { sql: clauses.length ? ' WHERE '+clauses.join(' AND ') : '', args };
}
function normalise(row: Record<string, unknown>): Record<string, unknown> {
 return { ...row, roles: JSON.parse(String(row.roles)), email_opt_in: Boolean(row.email_opt_in), wa_consent: Boolean(row.wa_consent), city_is_other: Boolean(row.city_is_other) };
}
export function list(filters: Filters) {
 return result(async () => {
  const filter = where(filters);
  const sets = await database().batch([
   { sql: 'SELECT count(*) n FROM waitlist_signups s'+filter.sql, args: filter.args },
   { sql: `SELECT s.id,substr(s.phone_e164,1,4)||' '||substr(s.phone_e164,5,3)||' ••• '||substr(s.phone_e164,-4) phone_masked,s.city,s.city_is_other,s.roles,s.email,s.email_opt_in,s.wa_consent,s.consent_text_version,s.referral_code,r.referral_code referred_by_code,s.utm_source,s.status,s.created_at FROM waitlist_signups s LEFT JOIN waitlist_signups r ON s.referred_by_id=r.id${filter.sql} ORDER BY s.created_at DESC,s.id DESC LIMIT ? OFFSET ?`, args: [...filter.args,Math.min(100,Math.max(1,filters.limit || 50)),Math.max(0,filters.offset || 0)] },
  ], 'read');
  return { total: Number(sets[0].rows[0].n), rows: sets[1].rows.map(normalise) };
 });
}
export function exportRows(filters: Filters) {
 return result(async () => {
  const filter = where(filters);
  const rows = await database().execute({ sql: `SELECT s.*,r.referral_code referred_by_code FROM waitlist_signups s LEFT JOIN waitlist_signups r ON s.referred_by_id=r.id${filter.sql} ORDER BY s.created_at DESC,s.id DESC LIMIT ? OFFSET ?`, args: [...filter.args,1000,Math.max(0,filters.offset || 0)] });
  return rows.rows.map(normalise);
 });
}
export function reveal(id: number, ipHash: string) {
 return result(() => transaction(async tx => {
  const row = (await tx.execute({ sql: 'SELECT phone_e164 FROM waitlist_signups WHERE id=?', args: [id] })).rows[0];
  if (!row) return null;
  await log(tx,'reveal_phone',`id=${id}`,ipHash); return String(row.phone_e164);
 }));
}
export function setStatus(id: number, status: string, ipHash: string) {
 return result(() => transaction(async tx => {
  const now = new Date().toISOString();
  const change = await tx.execute({ sql: `UPDATE waitlist_signups SET status=?,updated_at=?,whatsapp_confirmed_at=CASE WHEN ?='confirmed' THEN coalesce(whatsapp_confirmed_at,?) ELSE whatsapp_confirmed_at END,unsubscribed_at=CASE WHEN ?='unsubscribed' THEN ? ELSE NULL END WHERE id=?`, args: [status,now,status,now,status,now,id] });
  if (!change.rowsAffected) return false;
  await log(tx,'set_status',`id=${id} status=${status}`,ipHash); return true;
 }));
}
export function remove(id: number, reason: string, ipHash: string) {
 return result(() => transaction(async tx => {
  const row = (await tx.execute({ sql: 'SELECT phone_hash FROM waitlist_signups WHERE id=?', args: [id] })).rows[0];
  if (!row) return false;
  await tx.execute({ sql: 'INSERT INTO waitlist_deletions(phone_hash,reason) VALUES(?,?)', args: [row.phone_hash,reason] });
  await tx.execute({ sql: 'UPDATE waitlist_signups SET referred_by_id=NULL WHERE referred_by_id=?', args: [id] });
  await tx.execute({ sql: 'DELETE FROM waitlist_signups WHERE id=?', args: [id] });
  await log(tx,'delete_signup',`id=${id}`,ipHash); return true;
 }));
}
export function audit(action: string, detail: string | null, ipHash: string | null) {
 return database().execute({ sql: 'INSERT INTO admin_audit_log(action,detail,ip_hash) VALUES(?,?,?)', args: [action,detail,ipHash] });
}
