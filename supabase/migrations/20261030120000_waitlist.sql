-- Payam waitlist schema (Supabase / Postgres).
-- RLS is ON for every table with NO policies, and anon/authenticated have no grants:
-- the public Data API can't read or write anything. Only the Next.js server (service role key) can.
-- No sample rows. Column names match the future Laravel `waitlist_signups` table.

-- ---------------------------------------------------------------- tables

create table public.waitlist_signups (
  id                    bigint generated always as identity primary key,
  phone_e164            varchar(16)  not null unique check (phone_e164 ~ '^\+234[789][01][0-9]{8}$'),
  phone_hash            char(64)     not null,                 -- HMAC-SHA256(IP_HASH_SALT, phone_e164), hex
  city                  varchar(60)  not null check (char_length(city) between 2 and 60),
  city_is_other         boolean      not null default false,
  roles                 text[]       not null check (cardinality(roles) between 1 and 4
                                                     and roles <@ array['use','sell','serve','drive']),
  email                 varchar(120),
  email_opt_in          boolean      not null default false,
  wa_consent            boolean      not null check (wa_consent),
  consent_text_version  varchar(32)  not null,
  consented_at          timestamptz  not null default now(),
  referral_code         varchar(8)   not null unique check (referral_code ~ '^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$'),
  referred_by_id        bigint       references public.waitlist_signups(id) on delete set null,
  utm_source            varchar(100),
  utm_medium            varchar(100),
  utm_campaign          varchar(100),
  ip_hash               char(64),                              -- HMAC-SHA256(IP_HASH_SALT, ip); never the raw IP
  user_agent            varchar(255),
  status                varchar(16)  not null default 'joined' check (status in ('joined','confirmed','unsubscribed')),
  whatsapp_confirmed_at timestamptz,
  unsubscribed_at       timestamptz,
  created_at            timestamptz  not null default now(),
  updated_at            timestamptz  not null default now()
);
create index waitlist_signups_city_idx        on public.waitlist_signups (city);
create index waitlist_signups_created_idx     on public.waitlist_signups (created_at desc);
create index waitlist_signups_referred_by_idx on public.waitlist_signups (referred_by_id);
create index waitlist_signups_roles_idx       on public.waitlist_signups using gin (roles);

create table public.waitlist_deletions (               -- NDPA erasure proof: no personal data
  id          bigint generated always as identity primary key,
  phone_hash  char(64)     not null,
  reason      varchar(120) not null,
  deleted_at  timestamptz  not null default now()
);

create table public.admin_audit_log (                  -- single admin: records the action only
  id      bigint generated always as identity primary key,
  action  varchar(40)  not null,                         -- login_ok, login_fail, logout, reveal_phone, export_csv, set_status, delete
  detail  varchar(200),                                  -- e.g. "id=42 status=confirmed"; never a full phone number
  ip_hash char(64),
  at      timestamptz  not null default now()
);
create index admin_audit_log_at_idx on public.admin_audit_log (at desc);

create table public.rate_limits (
  key          text        not null,                     -- e.g. "join:ip:<ip_hash>", "admin-login:ip:<ip_hash>"
  window_start timestamptz not null,
  count        integer     not null default 0,
  primary key (key, window_start)
);

-- ---------------------------------------------------------------- lock down

alter table public.waitlist_signups   enable row level security;
alter table public.waitlist_deletions enable row level security;
alter table public.admin_audit_log    enable row level security;
alter table public.rate_limits        enable row level security;
-- (intentionally no policies)
revoke all on public.waitlist_signups, public.waitlist_deletions, public.admin_audit_log, public.rate_limits
  from anon, authenticated;

-- ---------------------------------------------------------------- functions (service_role only)

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
create trigger waitlist_signups_touch before update on public.waitlist_signups
  for each row execute function public.touch_updated_at();

-- Fixed-window limiter. Returns true when the call is allowed.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns boolean language plpgsql set search_path = public as $$
declare
  v_start timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  insert into rate_limits (key, window_start, count) values (p_key, v_start, 1)
  on conflict (key, window_start) do update set count = rate_limits.count + 1
  returning count into v_count;
  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '1 day';
  end if;
  return v_count <= p_max;
end $$;

-- Atomic join: duplicate phone -> {status:'duplicate'}; referral code generated here and retried on collision.
create or replace function public.waitlist_join(
  p_phone_e164 text, p_phone_hash text, p_city text, p_city_is_other boolean, p_roles text[],
  p_email text, p_email_opt_in boolean, p_consent_text_version text, p_ref text,
  p_utm_source text, p_utm_medium text, p_utm_campaign text, p_ip_hash text, p_user_agent text)
returns jsonb language plpgsql set search_path = public as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  v_code text; v_ref_id bigint; v_id bigint;
begin
  if p_ref is not null and p_ref <> '' then
    select id into v_ref_id from waitlist_signups where referral_code = upper(p_ref);
  end if;
  for attempt in 1..8 loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    begin
      insert into waitlist_signups (phone_e164, phone_hash, city, city_is_other, roles, email, email_opt_in,
        wa_consent, consent_text_version, referral_code, referred_by_id, utm_source, utm_medium, utm_campaign,
        ip_hash, user_agent)
      values (p_phone_e164, p_phone_hash, p_city, coalesce(p_city_is_other, false), p_roles, nullif(p_email, ''),
        coalesce(p_email_opt_in, false) and coalesce(p_email, '') <> '', true, p_consent_text_version, v_code,
        v_ref_id, nullif(p_utm_source, ''), nullif(p_utm_medium, ''), nullif(p_utm_campaign, ''),
        p_ip_hash, left(p_user_agent, 255))
      on conflict (phone_e164) do nothing
      returning id into v_id;
      if v_id is null then
        return jsonb_build_object('status', 'duplicate');
      end if;
      return jsonb_build_object('status', 'joined', 'referral_code', v_code, 'city', p_city);
    exception when unique_violation then
      null;  -- referral_code collision (phone conflicts are absorbed by ON CONFLICT): try another code
    end;
  end loop;
  return jsonb_build_object('status', 'error');
end $$;

create or replace function public.waitlist_referral_count(p_code text)
returns integer language sql stable set search_path = public as $$
  select count(*)::int from waitlist_signups s
  join waitlist_signups r on s.referred_by_id = r.id
  where r.referral_code = upper(p_code);
$$;

create or replace function public.waitlist_summary()
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'totals', (select jsonb_build_object(
        'total', count(*),
        'confirmed', count(*) filter (where status = 'confirmed'),
        'unsubscribed', count(*) filter (where status = 'unsubscribed'),
        'not_confirmed', count(*) filter (where status = 'joined'),
        'businesses', count(*) filter (where roles && array['sell','serve','drive']))
      from waitlist_signups),
    'by_city', coalesce((select jsonb_agg(jsonb_build_object('city', city, 'count', n) order by n desc, city)
      from (select city, count(*) n from waitlist_signups group by city) c), '[]'::jsonb),
    'by_role', (select jsonb_build_object(
        'use',   count(*) filter (where 'use'   = any(roles)),
        'sell',  count(*) filter (where 'sell'  = any(roles)),
        'serve', count(*) filter (where 'serve' = any(roles)),
        'drive', count(*) filter (where 'drive' = any(roles)))
      from waitlist_signups),
    'top_referrers', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'count', n) order by n desc, code)
      from (select r.referral_code code, count(*) n from waitlist_signups s
            join waitlist_signups r on s.referred_by_id = r.id
            group by r.referral_code order by count(*) desc limit 10) t), '[]'::jsonb));
$$;

-- Admin list: phones are masked inside the database, so the full number never leaves it here.
create or replace function public.waitlist_admin_list(
  p_q text default null, p_city text default null, p_role text default null, p_status text default null,
  p_include_unsubscribed boolean default false, p_limit integer default 50, p_offset integer default 0)
returns jsonb language sql stable set search_path = public as $$
  with f as (
    select s.*, r.referral_code as referred_by_code
    from waitlist_signups s left join waitlist_signups r on r.id = s.referred_by_id
    where (p_city is null or s.city = p_city)
      and (p_role is null or p_role = any(s.roles))
      and (p_status is null or s.status = p_status)
      and (p_status is not null or p_include_unsubscribed or s.status <> 'unsubscribed')
      and (p_q is null or p_q = ''
           or (length(regexp_replace(p_q, '\D', '', 'g')) >= 3
               and regexp_replace(s.phone_e164, '\D', '', 'g') like '%' || regexp_replace(p_q, '\D', '', 'g') || '%')
           or s.email ilike '%' || p_q || '%'
           or s.referral_code = upper(p_q))
  )
  select jsonb_build_object(
    'total', (select count(*) from f),
    'rows', coalesce((select jsonb_agg(row_obj order by created_at desc) from (
      select created_at, jsonb_build_object(
        'id', id,
        'phone_masked', substr(phone_e164, 1, 4) || ' ' || substr(phone_e164, 5, 3) || ' ••• ' || right(phone_e164, 4),
        'city', city, 'city_is_other', city_is_other, 'roles', roles, 'email', email,
        'email_opt_in', email_opt_in, 'wa_consent', wa_consent, 'consent_text_version', consent_text_version,
        'referral_code', referral_code, 'referred_by_code', referred_by_code,
        'utm_source', utm_source, 'utm_medium', utm_medium, 'utm_campaign', utm_campaign,
        'status', status, 'created_at', created_at) as row_obj
      from f order by created_at desc limit least(greatest(p_limit, 1), 100) offset greatest(p_offset, 0)) x), '[]'::jsonb));
$$;

create or replace function public.waitlist_admin_reveal(p_id bigint, p_ip_hash text)
returns text language plpgsql set search_path = public as $$
declare v_phone text;
begin
  select phone_e164 into v_phone from waitlist_signups where id = p_id;
  if v_phone is not null then
    insert into admin_audit_log (action, detail, ip_hash) values ('reveal_phone', 'id=' || p_id, p_ip_hash);
  end if;
  return v_phone;
end $$;

create or replace function public.waitlist_admin_set_status(p_id bigint, p_status text, p_ip_hash text)
returns boolean language plpgsql set search_path = public as $$
begin
  update waitlist_signups set
    status = p_status,
    whatsapp_confirmed_at = case when p_status = 'confirmed' then coalesce(whatsapp_confirmed_at, now()) else whatsapp_confirmed_at end,
    unsubscribed_at = case when p_status = 'unsubscribed' then coalesce(unsubscribed_at, now()) else null end
  where id = p_id;
  if not found then return false; end if;
  insert into admin_audit_log (action, detail, ip_hash) values ('set_status', 'id=' || p_id || ' status=' || p_status, p_ip_hash);
  return true;
end $$;

create or replace function public.waitlist_admin_delete(p_id bigint, p_reason text, p_ip_hash text)
returns boolean language plpgsql set search_path = public as $$
declare v_hash text;
begin
  delete from waitlist_signups where id = p_id returning phone_hash into v_hash;
  if v_hash is null then return false; end if;
  insert into waitlist_deletions (phone_hash, reason) values (v_hash, left(p_reason, 120));
  insert into admin_audit_log (action, detail, ip_hash) values ('delete', 'id=' || p_id, p_ip_hash);
  return true;
end $$;

-- Only the server (service_role) may call these.
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.waitlist_join(text, text, text, boolean, text[], text, boolean, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.waitlist_referral_count(text) from public, anon, authenticated;
revoke all on function public.waitlist_summary() from public, anon, authenticated;
revoke all on function public.waitlist_admin_list(text, text, text, text, boolean, integer, integer) from public, anon, authenticated;
revoke all on function public.waitlist_admin_reveal(bigint, text) from public, anon, authenticated;
revoke all on function public.waitlist_admin_set_status(bigint, text, text) from public, anon, authenticated;
revoke all on function public.waitlist_admin_delete(bigint, text, text) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.waitlist_join(text, text, text, boolean, text[], text, boolean, text, text, text, text, text, text, text) to service_role;
grant execute on function public.waitlist_referral_count(text) to service_role;
grant execute on function public.waitlist_summary() to service_role;
grant execute on function public.waitlist_admin_list(text, text, text, text, boolean, integer, integer) to service_role;
grant execute on function public.waitlist_admin_reveal(bigint, text) to service_role;
grant execute on function public.waitlist_admin_set_status(bigint, text, text) to service_role;
grant execute on function public.waitlist_admin_delete(bigint, text, text) to service_role;
