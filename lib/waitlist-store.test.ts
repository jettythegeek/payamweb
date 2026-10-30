import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
vi.mock('server-only', () => ({}));
import { database } from './turso';
import { join, list, summary, referralCount, reveal, setStatus, remove, exportRows } from './waitlist-store';
import { rateLimit } from './rate-limit';
import { POST as signup } from '../app/api/waitlist/route';
import { POST as login } from '../app/api/waitlist-admin/login/route';
import { verifyAdminSession } from './admin-auth';
import bcrypt from 'bcryptjs';
beforeAll(async () => {
 vi.stubEnv('TURSO_DATABASE_URL', ':memory:');
 vi.stubEnv('VERCEL','');
 await database().executeMultiple(readFileSync('database/waitlist.sql','utf8'));
});
afterAll(() => { database().close(); vi.unstubAllEnvs(); });
const input = { phoneE164:'+2348030000001',phoneHash:'h'.repeat(64),city:'Aba',cityIsOther:false,roles:['use'],email:null,emailOptIn:false,ref:null,utmSource:null,utmMedium:null,utmCampaign:null,ipHash:'i'.repeat(64),userAgent:'storage integration test' };
describe('real SQLite waitlist lifecycle', () => {
 it('persists a signup, rejects duplicates and counts referrals', async () => {
  const first=await join(input); expect(first.error).toBeNull(); expect(first.data?.status).toBe('joined');
  expect((await join(input)).data?.status).toBe('duplicate');
  const code=first.data!.referral_code!;
  const second=await join({...input,phoneE164:'+2348030000002',ref:code,roles:['sell']}); expect(second.data?.status).toBe('joined');
  expect((await referralCount(code)).data).toBe(1);
  const stats=await summary();expect(stats.error).toBeNull();expect(Number(stats.data?.totals.total)).toBe(2);
 });
 it('masks phones, filters records and exports the complete row only for admin', async () => {
  const found=await list({role:'sell'});expect(found.data?.total).toBe(1);
  expect(found.data?.rows[0]).not.toHaveProperty('phone_e164');
  expect(String(found.data?.rows[0].phone_masked)).toContain('•••');
  const exported=await exportRows({role:'sell'});expect(exported.data?.[0].phone_e164).toBe('+2348030000002');
  expect((await list({q:"' OR 1=1 --"})).data?.total).toBe(0);
 });
 it('audits reveal/status/delete and preserves only deletion hash evidence', async () => {
  const row=(await list({role:'sell'})).data!.rows[0];const id=Number(row.id);
  expect((await reveal(id,'ip-hash')).data).toBe('+2348030000002');
  expect((await setStatus(id,'unsubscribed','ip-hash')).data).toBe(true);
  expect((await list({role:'sell'})).data?.total).toBe(0);
  expect((await list({status:'unsubscribed'})).data?.total).toBe(1);
  expect((await remove(id,'Owner request','ip-hash')).data).toBe(true);
  expect((await reveal(id,'ip-hash')).data).toBeNull();
  expect((await database().execute('SELECT phone_hash FROM waitlist_deletions')).rows).toHaveLength(1);
  expect((await database().execute('SELECT action FROM admin_audit_log')).rows).toHaveLength(3);
 });
 it('enforces atomic persistent rate limits and expiry', async () => {
  expect(await rateLimit('test',60,2)).toBe(true);expect(await rateLimit('test',60,2)).toBe(true);expect(await rateLimit('test',60,2)).toBe(false);
  await database().execute("UPDATE rate_limits SET expires_at=0 WHERE key='test'");expect(await rateLimit('test',60,2)).toBe(true);
 });
 it('completes the public signup handler only after saving, then authenticates an admin', async () => {
  vi.stubEnv('IP_HASH_SALT','s'.repeat(32)); vi.stubEnv('TURNSTILE_SECRET_KEY','');
  const body={phone:'08030000099',city:'Aba',city_is_other:false,roles:['use'],email:'',email_opt_in:false,consent_whatsapp:true,turnstile_token:'local-test',form_rendered_at:Date.now()-3000,company_website:''};
  const request=new Request('http://localhost/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const response=await signup(request);expect(response.status).toBe(201);
  expect((await response.json()).status).toBe('joined');
  expect((await list({q:'08030000099'.slice(1)})).data?.total).toBe(1);
  vi.stubEnv('WAITLIST_ADMIN_EMAIL','admin@example.test');
  vi.stubEnv('WAITLIST_ADMIN_PASSWORD_HASH',await bcrypt.hash('integration-test-password',4));
  vi.stubEnv('WAITLIST_SESSION_SECRET','k'.repeat(32));
  const signedIn=await login(new Request('http://localhost/api/waitlist-admin/login',{method:'POST',headers:{'Content-Type':'application/json',origin:'http://localhost',host:'localhost'},body:JSON.stringify({email:'admin@example.test',password:'integration-test-password'})}));
  expect(signedIn.status).toBe(200);
  const cookie=signedIn.headers.get('set-cookie')!;expect(cookie).toContain('HttpOnly');
  expect(verifyAdminSession(cookie.split(';')[0].slice('payam_admin='.length))).toBe(true);
 });
});
