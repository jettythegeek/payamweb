import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';

const file = '.env.local';
let env = existsSync(file) ? readFileSync(file, 'utf8') : '';
if (/^WAITLIST_ADMIN_PASSWORD_HASH=.+/m.test(env)) throw new Error('Admin already has a password. Use admin:hash to reset it explicitly.');
const password = randomBytes(18).toString('base64url');
const values = {
 WAITLIST_ADMIN_EMAIL: 'waitlist@payam.ng',
 WAITLIST_ADMIN_PASSWORD_HASH: Buffer.from(await bcrypt.hash(password, 12)).toString('base64'),
 WAITLIST_SESSION_SECRET: randomBytes(48).toString('hex'),
 IP_HASH_SALT: randomBytes(48).toString('hex'),
};
for (const [key, value] of Object.entries(values)) {
 const pattern = new RegExp(`^${key}=.*$`, 'm');
 if (pattern.test(env)) env = env.replace(pattern, `${key}=${value}`);
 else env += `\n${key}=${value}`;
}
writeFileSync(file, env.trim()+'\n', { mode: 0o600 });
console.log(`Local admin email: ${values.WAITLIST_ADMIN_EMAIL}\nLocal admin password: ${password}\nSaved settings to ignored .env.local. Set real Supabase settings before logging in; no signups are faked.`);
