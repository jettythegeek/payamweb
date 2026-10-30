import 'server-only';
import { database } from './turso';
export async function rateLimit(key: string, windowSeconds: number, max: number) {
 const now = Math.floor(Date.now()/1000);
 const result = await database().execute({ sql: `INSERT INTO rate_limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN expires_at<=? THEN 1 ELSE hits+1 END,expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING hits`, args: [key,now+windowSeconds,now,now] });
 return Number(result.rows[0].hits) <= max;
}
