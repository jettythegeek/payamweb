# Website checkpoint

Agent: Codex (`/root`). Task: WEBSITE-001.

- Removed remaining legacy brand strings from active content, anchors and reference CSS. Updated header navigation to existing homepage section IDs; mobile menu closes after selection.
- Removed the footer email sublabel and placed the Nigerian flag immediately before Made in Nigeria.
- Signup now distinguishes server/configuration failures from network failures and keeps the entries for retry. Completion still requires a successful database write.
- Admin accepts documented base64 or raw bcrypt hashes, validates the privacy salt before login, and handles connection/service failures without misreporting bad credentials or leaving the button stuck.
- Added an explicit local credential setup command. No credentials or customer records are committed.
- Verification: 47 tests pass, production build passes, client bundle secret scan passes; header anchors resolve and active source brand scan is clean.

## Remaining operational blocker

This checkout originally contained only `.env.example`, with no database or admin settings. Local admin credentials have now been generated in ignored `.env.local`. Supabase URL/service-role key and applied SQL migration are still required. Production must also have Turnstile configured. Owner has been asked whether the failing site is local/live and where its configuration resides. No live login or real signup completion is claimed until those settings are supplied and end-to-end persistence is verified.

The existing Next.js release reports a security update recommendation; dependency upgrade is not included in this patch.

## Turso migration

- Owner selected Turso. Supabase runtime dependency replaced by server-only libSQL storage; old SQL kept as historical migration reference.
- Implemented signups, duplicate protection, cryptographic referral allocation, dashboard filters/counts, phone masking/reveal, CSV export, status changes, atomic deletion audit evidence and persistent atomic rate limits.
- Added idempotent explicit `db:setup`; ignored database files and credentials. Local SQLite supported explicitly; Vercel rejects local files.
- Owner supplied hosted database URL and added its auth token privately. Applied schema successfully to the hosted database. No sample signup records inserted into the hosted database.
- 52 tests pass, including real isolated SQLite lifecycle tests and signup/admin-session handlers. Hosted deployment environment variables and production Turnstile still require hosting configuration; no deployment performed.


## CSV storage for VPS (supersedes Turso runtime)

Agent: Codex (`/root`), WEBSITE-001. Owner chose CSV on persistent VPS storage. Public signup, dashboard counts/list/status/reveal/delete, referrals, rate limits and admin login now use private file storage without database credentials. Records live in `.data/waitlist/waitlist.csv` unless `WAITLIST_DATA_DIR` selects a private persistent directory. Supporting operational evidence is in `operations.json`.

Cross-process locking, atomic file replacement and a recoverable private journal guard concurrent/interrupted writes. CSV parsing handles quoted fields/newlines; spreadsheet formula prefixes are protected on disk and round-trip correctly. Corrupt input fails without overwriting it. Files and credentials remain outside public assets and Git. Vercel refuses persistent CSV collection rather than pretending to save.

Existing hosted Turso data was checked with the explicit one-off import command: no signup records existed, so no customer data was changed. A non-overwriting import command remains available; the website runtime does not use Turso. Existing admin credentials remain valid. Fifty-five tests pass, including file-backed lifecycle, concurrent joins/duplicates, CSV edge cases, signup handler and admin session verification. Deploy requires a writable persistent private directory, existing admin settings and production Turnstile keys.
