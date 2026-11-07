import { authorizedAdminRequest } from '../../../../lib/admin-request';
import { csvRow } from '../../../../lib/csv';
import { audit, exportRows } from '../../../../lib/waitlist-store';

export const runtime = 'nodejs';
const COLUMNS = ['created_at','phone_e164','city','city_is_other','roles','email','email_opt_in','wa_consent','consent_text_version','consented_at','referral_code','referred_by_code','utm_source','utm_medium','utm_campaign','status','whatsapp_confirmed_at','unsubscribed_at'] as const;

type ExportRow = Record<string, unknown> & { referred_by?: { referral_code?: string } | Array<{ referral_code?: string }> | null };

export async function GET(request: Request) {
  const auth = authorizedAdminRequest(request); if (!auth.ok) return Response.json({ error: 'unauthorized' }, { status: auth.status });
  const params = new URL(request.url).searchParams;
  const city = params.get('city') || ''; const role = params.get('role') || ''; const status = params.get('status') || '';
  const includeUnsubscribed = params.get('include_unsubscribed') === '1';
  let output = csvRow(COLUMNS.map((value) => ({ value })));
  for (let from = 0; ; from += 1000) {
    const { data, error } = await exportRows({ city, role, status, includeUnsubscribed, offset: from });
    if (error) return Response.json({ error: 'busy' }, { status: 503 });
    const rows = (data || []) as unknown as ExportRow[];
    for (const row of rows) {
      output += csvRow(COLUMNS.map((column) => ({
        value: row[column],
        phone: column === 'phone_e164',
      })));
    }
    if (rows.length < 1000) break;
  }
  await audit('export_csv', `city=${city || '-'} role=${role || '-'} status=${status || '-'}`, auth.ipHash);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date());
  return new Response(output, { headers: {
    'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="payam-waitlist-${date}.csv"`,
    'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow',
  } });
}
