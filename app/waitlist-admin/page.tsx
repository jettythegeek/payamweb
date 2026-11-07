import { list, summary } from '../../lib/waitlist-store';
import { DashboardClient, type AdminRow } from './dashboard-client';
import { AdminFilters } from './filters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Summary = {
  totals?: Record<string, number>;
  by_city?: Array<{ city: string; count: number }>;
  by_role?: Record<string, number>;
  top_referrers?: Array<{ code: string; count: number }>;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '');
  const page = Math.max(1, Number(one('page')) || 1);

  let summaryData: Summary = {};
  let rows: AdminRow[] = [];
  let total = 0;
  let unavailable = false;

  try {
    const [s, l] = await Promise.all([
      summary(),
      list({
        q: one('q'),
        city: one('city'),
        role: one('role'),
        status: one('status'),
        includeUnsubscribed: one('include_unsubscribed') === '1',
        offset: (page - 1) * 50,
      }),
    ]);
    if (s.error || l.error) throw new Error();
    summaryData = (s.data || {}) as Summary;
    const data = (l.data || {}) as { rows?: AdminRow[]; total?: number };
    rows = data.rows || [];
    total = data.total || 0;
  } catch {
    unavailable = true;
  }

  const totals = summaryData.totals || {};

  return (
    <main className="wa-shell">
      <header>
        <div>
          <p className="wa-kicker">PAYAM OPERATIONS</p>
          <h1>Waitlist dashboard</h1>
          <p>Saved to your private CSV file · counts refresh every minute · times in WAT (UTC+1)</p>
        </div>
      </header>
      {unavailable ? (
        <p className="wa-error">The waitlist file is temporarily unavailable.</p>
      ) : (
        <>
          <section className="wa-stats">
            {(
              [
                ['Total signups', totals.total || 0],
                ['Confirmed on WhatsApp', totals.confirmed || 0],
                ['Not confirmed', totals.not_confirmed || 0],
                ['Businesses', totals.businesses || 0],
              ] as const
            ).map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>
          <section className="wa-panels">
            <article>
              <h2>By city</h2>
              {(summaryData.by_city || []).length ? (
                (summaryData.by_city || []).map((v) => (
                  <p key={v.city}>
                    {v.city}
                    <b>{v.count}</b>
                  </p>
                ))
              ) : (
                <p>No signups yet.</p>
              )}
            </article>
            <article>
              <h2>By role</h2>
              {Object.entries(summaryData.by_role || {}).map(([key, value]) => (
                <p key={key}>
                  {key}
                  <b>{value}</b>
                </p>
              ))}
            </article>
            <article>
              <h2>Top referrers</h2>
              {(summaryData.top_referrers || []).length ? (
                (summaryData.top_referrers || []).map((v) => (
                  <p key={v.code}>
                    {v.code}
                    <b>{v.count}</b>
                  </p>
                ))
              ) : (
                <p>No referrals yet.</p>
              )}
            </article>
          </section>
          <section className="wa-list">
            <AdminFilters cities={(summaryData.by_city || []).map((v) => v.city)} />
            <div>
              <h2>Signups</h2>
              <p>{total} matching records</p>
            </div>
            <DashboardClient rows={rows} />
            {!rows.length && <p className="wa-empty">No signups match these filters.</p>}
          </section>
        </>
      )}
    </main>
  );
}
