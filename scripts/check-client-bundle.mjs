import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../.next/static/', import.meta.url));
const forbidden = ['TURSO_AUTH_TOKEN', 'TURSO_DATABASE_URL', 'WAITLIST_ADMIN', 'WAITLIST_SESSION_SECRET'];
const keyPrefix = process.env.TURSO_AUTH_TOKEN?.slice(0, 24);
if (keyPrefix) forbidden.push(keyPrefix);

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : join(dir, entry.name)))).flat();
}

let found = false;
try {
  for (const file of await files(root)) {
    const content = await readFile(file);
    for (const needle of forbidden) if (content.includes(Buffer.from(needle))) { console.error(`Forbidden server value found in client bundle: ${needle} (${file})`); found = true; }
  }
} catch (error) {
  console.error('Could not inspect .next/static. Run npm run build first.');
  process.exitCode = 1;
}
if (found) process.exitCode = 1; else if (!process.exitCode) console.log('Client bundle contains no waitlist server secrets.');
