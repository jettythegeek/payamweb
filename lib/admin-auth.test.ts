import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
vi.mock('server-only',()=>({}));
let auth: typeof import('./admin-auth');
beforeAll(async()=>{auth=await import('./admin-auth')});
afterEach(()=>{delete process.env.WAITLIST_SESSION_SECRET;delete process.env.WAITLIST_ADMIN_EMAIL;delete process.env.WAITLIST_ADMIN_PASSWORD_HASH;delete process.env.IP_HASH_SALT});
describe('admin sessions',()=>{
  it('rejects missing configuration',()=>{expect(auth.adminConfigured()).toBe(false);expect(auth.verifyAdminSession('x.y')).toBe(false)});
  it('accepts a signed session and rejects tampering and expiry',()=>{process.env.WAITLIST_SESSION_SECRET='s'.repeat(32);const token=auth.createAdminSession(100);expect(auth.verifyAdminSession(token,101)).toBe(true);expect(auth.verifyAdminSession(`${token}x`,101)).toBe(false);expect(auth.verifyAdminSession(token,100+auth.SESSION_SECONDS)).toBe(false)});
  it('requires a valid hash and privacy salt as well as session settings',()=>{process.env.WAITLIST_SESSION_SECRET='s'.repeat(32);process.env.WAITLIST_ADMIN_EMAIL='admin@example.test';process.env.WAITLIST_ADMIN_PASSWORD_HASH='$2b$12$'+'a'.repeat(53);expect(auth.adminConfigured()).toBe(false);process.env.IP_HASH_SALT='s'.repeat(32);expect(auth.adminConfigured()).toBe(true)});
  it('accepts raw and base64 bcrypt without weakening validation',()=>{const hash='$2b$12$'+'a'.repeat(53);process.env.WAITLIST_ADMIN_PASSWORD_HASH=hash;expect(auth.adminPasswordHash()).toBe(hash);process.env.WAITLIST_ADMIN_PASSWORD_HASH=Buffer.from(hash).toString('base64');expect(auth.adminPasswordHash()).toBe(hash);process.env.WAITLIST_ADMIN_PASSWORD_HASH='plain-password';expect(auth.adminPasswordHash()).toBe(null)});
});
