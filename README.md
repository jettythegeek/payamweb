# Payam waitlist website

Standalone Next.js 16 website for Payam's city-by-city launch waitlist. It stores signups in a private Supabase Postgres project, offers a server-protected operations dashboard at `/waitlist-admin`, and runs on Vercel or a Node.js VPS without Laravel.

## Local setup

Use Node.js 22 or newer.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3005`. Apply `supabase/migrations/20261030120000_waitlist.sql` to a private Supabase project, then fill the server-only values in `.env.local`. Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable.

Generate the initial admin password hash interactively with `npm run admin:hash`, and create a random `WAITLIST_SESSION_SECRET` of at least 32 characters. The admin email defaults to `waitlist@payam.ng`; change the environment value if needed.

For a fresh local checkout, run `node scripts/setup-local-admin.mjs` from the website directory. It generates a password and writes the admin email, encoded password hash, session secret and privacy salt to ignored `.env.local`. It refuses to overwrite an existing admin password. Keep the printed credentials private. This does not create or connect a database.

Both signup completion and admin login require `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, with the SQL migration applied. Production also requires the matching Turnstile site/secret keys. Set these on the actual hosting environment as well as locally, and restart the server after configuration changes. Never commit credentials. Missing database configuration must not be replaced with fake signup success.

`WAITLIST_ADMIN_PASSWORD_HASH` accepts either the base64 output from `admin:hash` or a raw bcrypt hash; never put a plaintext password in this setting. The privacy salt and session secret must each be at least 32 characters.

## Validation

```bash
npm run typecheck
npm test
npm run build
npm run check:bundle
```

## Waitlist data

The database keeps consent evidence, referral attribution, rate-limit state and deletion audit hashes. Row-level security is enabled with no browser-facing policies or grants. Export current records from the admin dashboard as CSV. Deletion is available from the dashboard and records a non-reversible audit hash rather than the removed personal data.

Do not add sample signups or publish counts. Launch messages should be sent only to people who gave the relevant consent, and opt-out or deletion requests must be honoured promptly.

## Deployment

On Vercel, import this repository, set the environment values from `.env.example`, use Node.js 22, and deploy. On Webuzo or another VPS, follow `docs/DEPLOY-VPS.md`; `output: 'standalone'` produces the portable Node server.

See `docs/WAITLIST-MIGRATION.md` for database setup and operational checks.
