# Moving the waitlist to Laravel

Keep Supabase running until the Laravel import has been verified. Export and transfer these files privately; they contain personal information.

## Option A: PostgreSQL export

Copy the connection string from Supabase → Connect, then run:

```sh
pg_dump --data-only --table=public.waitlist_signups --table=public.waitlist_deletions "<connection string>" > waitlist.sql
```

Export the whole schema instead if Laravel will use PostgreSQL and the existing functions are still useful.

## Option B: CSV

Download signups from `/waitlist-admin`. Export deletion proofs separately:

```sql
copy (select * from waitlist_deletions) to stdout csv header
```

The Laravel migration should retain the same columns: a unique `string('phone_e164', 16)`, `string('phone_hash', 64)`, JSON `roles`, booleans for `city_is_other`, `email_opt_in`, and `wa_consent`, unique `string('referral_code', 8)`, nullable `referred_by_id` with `nullOnDelete()`, nullable `string('ip_hash', 64)`, `string('status', 16)->default('joined')`, and timestamps. Convert PostgreSQL `text[]` roles with `to_jsonb(roles)` or split the CSV list.

Keep existing IDs during import or remap `referred_by_id` through `referred_by_code`. Import `waitlist_deletions` too, so an old export cannot re-add somebody whose data was erased.

All storage calls are isolated in `lib/waitlist-store.ts`. Replace that module with calls to the Laravel API while keeping its `join`, `referralCount`, `summary`, `list`, `reveal`, `setStatus`, and `remove` interface.
