import 'server-only';

import { supabaseAdmin } from './supabase-admin';

export async function rateLimit(key: string, windowSeconds: number, max: number): Promise<boolean> {
  const { data, error } = await supabaseAdmin().rpc('rate_limit_hit', {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max: max,
  });
  if (error) throw Object.assign(new Error('Rate limiter unavailable'), { code: error.code });
  return data === true;
}
