import { readFile } from 'node:fs/promises';
import { createClient } from '@libsql/client';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const url = process.env.TURSO_DATABASE_URL;
if (!url || (!url.startsWith('file:') && !process.env.TURSO_AUTH_TOKEN)) throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the server environment.');
if (process.env.VERCEL && url.startsWith('file:')) throw new Error('Use a hosted Turso database on Vercel.');
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
try {
 await client.executeMultiple(await readFile(new URL('../database/waitlist.sql', import.meta.url), 'utf8'));
 console.log('Waitlist schema ready. Existing records preserved.');
} finally { client.close(); }
