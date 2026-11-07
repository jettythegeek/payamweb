# Payam waitlist website

Next.js website with a private CSV-backed waitlist and `/waitlist-admin` dashboard. No Turso or Supabase configuration is required for normal use.

## Run locally

Use Node.js 22 or newer. From this directory:

```sh
npm ci
node scripts/setup-local-admin.mjs
npm run dev
```

The setup command creates private admin credentials, a session secret and a privacy salt in ignored `.env.local`. It prints the generated password and refuses to overwrite an existing one. Existing credentials continue to work.

Signups are automatically saved to `.data/waitlist/waitlist.csv`. Dashboard records, counts, filters, status changes, phone reveals and exports use that file. Supporting rate-limit, audit and deletion evidence is stored in `operations.json` alongside it. Files are created on first use, outside `public/`, with private permissions.

## Deploy on your VPS

Install dependencies, copy your private `.env.local` to the server, build with `npm run build`, and run `npm start` under PM2 or systemd behind HTTPS. Set `WAITLIST_DATA_DIR` to a persistent **absolute private directory**, for example `/var/lib/payam/waitlist`, owned by the Node service account. Keep this directory across deployments and back it up privately. It must never be inside the web root, Git, or a deployment folder that gets replaced.

Use the same `WAITLIST_ADMIN_EMAIL`, `WAITLIST_ADMIN_PASSWORD_HASH`, `WAITLIST_SESSION_SECRET` and `IP_HASH_SALT`. Set `NEXT_PUBLIC_SITE_URL` to your domain. Turnstile is optional: leave both keys unset to use the built-in honeypot, timing checks and persistent rate limits. To enable the widget, configure matching `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` for your domain. Enabled protection always requires a verified token.

CSV storage requires one shared persistent disk. **Vercel is not supported for collecting persistent records in this mode.** Requests fail rather than pretend records were saved. Multiple Node processes on the same VPS share a cross-process lock. Atomic replacement and a private recovery journal protect interrupted writes. Do not manually edit the CSV while the site runs. For backup, stop writes and copy the entire data directory, including any pending journal. Deletion requests must also be honoured in backup retention.

## Existing Turso data

Optional `npm run waitlist:import-turso` reads your old `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to preserve existing signups and audit evidence in the CSV store. It refuses to overwrite an existing CSV. Hosted records are never deleted by this command. The import journal is completed by the next application request. Turso credentials are only needed for this one-off migration, not daily operation.

## Checks

```sh
npm test
npm run build
npm run check:bundle
```

File-backed integration tests cover persistence, concurrency, duplicate protection, CSV escaping, masked phones, referrals, dashboard filtering, audit/deletion, rate limits, public signup and admin sessions. Customer data and credentials are not committed.
