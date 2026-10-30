import 'server-only';
import { createClient, type Client } from '@libsql/client';
let client: Client | undefined;
let connection = '';
export function storageConfigured() {
 const url = process.env.TURSO_DATABASE_URL;
 return Boolean(url && (url === ':memory:' && process.env.NODE_ENV === 'test' || (url.startsWith('file:') ? !process.env.VERCEL : process.env.TURSO_AUTH_TOKEN)));
}
export function database() {
 if (!storageConfigured()) throw new Error('Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN. File databases are not supported on Vercel.');
 const url = process.env.TURSO_DATABASE_URL!;
 const token = process.env.TURSO_AUTH_TOKEN;
 const key = `${url}|${token || ''}`;
 if (!client || connection !== key) {
  client?.close(); client = createClient({ url, authToken: token, intMode: 'number' }); connection = key;
 }
 return client;
}
