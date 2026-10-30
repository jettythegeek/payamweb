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
