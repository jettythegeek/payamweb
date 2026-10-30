import 'server-only';

import { supabaseAdmin } from './supabase-admin';

export type JoinInput = {
  phoneE164: string; phoneHash: string; city: string; cityIsOther: boolean; roles: string[];
  email: string | null; emailOptIn: boolean; ref: string | null; utmSource: string | null;
  utmMedium: string | null; utmCampaign: string | null; ipHash: string | null; userAgent: string;
};

export async function join(input: JoinInput) {
  return supabaseAdmin().rpc('waitlist_join', {
    p_phone_e164: input.phoneE164, p_phone_hash: input.phoneHash, p_city: input.city,
    p_city_is_other: input.cityIsOther, p_roles: input.roles, p_email: input.email,
    p_email_opt_in: input.emailOptIn, p_consent_text_version: 'wa-2026-11-v1', p_ref: input.ref,
    p_utm_source: input.utmSource, p_utm_medium: input.utmMedium, p_utm_campaign: input.utmCampaign,
    p_ip_hash: input.ipHash, p_user_agent: input.userAgent,
  });
}

export async function referralCount(code: string) { return supabaseAdmin().rpc('waitlist_referral_count', { p_code: code }); }
export async function summary() { return supabaseAdmin().rpc('waitlist_summary'); }
export async function list(filters: { q?: string; city?: string; role?: string; status?: string; includeUnsubscribed?: boolean; limit?: number; offset?: number }) {
  return supabaseAdmin().rpc('waitlist_admin_list', {
    p_q: filters.q || null, p_city: filters.city || null, p_role: filters.role || null,
    p_status: filters.status || null, p_include_unsubscribed: filters.includeUnsubscribed || false,
    p_limit: filters.limit || 50, p_offset: filters.offset || 0,
  });
}
export async function reveal(id: number, ipHash: string) { return supabaseAdmin().rpc('waitlist_admin_reveal', { p_id: id, p_ip_hash: ipHash }); }
export async function setStatus(id: number, status: string, ipHash: string) { return supabaseAdmin().rpc('waitlist_admin_set_status', { p_id: id, p_status: status, p_ip_hash: ipHash }); }
export async function remove(id: number, reason: string, ipHash: string) { return supabaseAdmin().rpc('waitlist_admin_delete', { p_id: id, p_reason: reason, p_ip_hash: ipHash }); }
export async function audit(action: string, detail: string | null, ipHash: string | null) {
  return supabaseAdmin().from('admin_audit_log').insert({ action, detail, ip_hash: ipHash });
}
