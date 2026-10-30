# Payam waitlist website

Next.js visitor website, waitlist and private `/waitlist-admin` dashboard. Storage uses Turso/libSQL. No Supabase connection is required.

## Local setup

Use Node.js 22 or newer. From this directory:

```sh
npm ci
node scripts/setup-local-admin.mjs
```

The admin setup prints a random password and writes private settings to ignored `.env.local`. It refuses to overwrite an existing password. For local storage, create `.data` and add `TURSO_DATABASE_URL=file:.data/waitlist.db` to `.env.local`, then:

```sh
npm run db:setup
npm run dev
```

Open `http://127.0.0.1:3005`. The local database is ignored by Git. Back it up privately. Never store it in `public/`.

## Hosted Turso for Vercel and VPS

Create a libSQL database in your Turso account, obtain its URL and database auth token, and set server-only `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. See [Turso's SDK reference](https://docs.turso.tech/sdk/ts/reference).

Set the same values locally before running `npm run db:setup` once to initialise the remote database. Setup is idempotent and preserves records. It is explicit, not run during builds or requests. Vercel must use a remote database; local file storage is rejected there. Vercel and a VPS can use the same hosted Turso database. The VPS may alternatively use an explicit persistent `file:` path with private backups.

Configure these settings in the hosting dashboard as well as locally:

- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (token is unnecessary for explicit local files).
- `WAITLIST_ADMIN_EMAIL`, `WAITLIST_ADMIN_PASSWORD_HASH`, `WAITLIST_SESSION_SECRET`, `IP_HASH_SALT`.
- `NEXT_PUBLIC_SITE_URL` for the public domain.
- Production: matching `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.

The password hash may be raw bcrypt or base64-encoded bcrypt from `npm run admin:hash`. Session secret and privacy salt must each be at least 32 characters. Keep salts stable for existing data; never commit secrets. Restart/redeploy after configuration changes. Optional `TURSO_DASHBOARD_URL` adds an admin shortcut.

## Checks and data handling

```sh
npm test
npm run build
npm run check:bundle
```

Integration tests use an isolated SQLite database and cover duplicate protection, referrals, filters, masked phones, CSV data, status changes, deletion audit evidence and rate limits. The application does not fabricate signup success when storage fails. Admin actions require an authenticated server session; full phone reveals are audited. Exports contain personal data and must be transferred privately. Legacy Supabase schema is retained only as migration reference; existing remote records are not transferred automatically.
