PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS waitlist_signups (
 id INTEGER PRIMARY KEY AUTOINCREMENT, phone_e164 TEXT NOT NULL UNIQUE, phone_hash TEXT NOT NULL,
 city TEXT NOT NULL CHECK(length(city) BETWEEN 2 AND 60), city_is_other INTEGER NOT NULL DEFAULT 0,
 roles TEXT NOT NULL CHECK(json_valid(roles)), email TEXT, email_opt_in INTEGER NOT NULL DEFAULT 0,
 wa_consent INTEGER NOT NULL CHECK(wa_consent = 1), consent_text_version TEXT NOT NULL,
 consented_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 referral_code TEXT NOT NULL UNIQUE, referred_by_id INTEGER REFERENCES waitlist_signups(id) ON DELETE SET NULL,
 utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, ip_hash TEXT, user_agent TEXT,
 status TEXT NOT NULL DEFAULT 'joined' CHECK(status IN ('joined','confirmed','unsubscribed')),
 whatsapp_confirmed_at TEXT, unsubscribed_at TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS waitlist_city ON waitlist_signups(city);
CREATE INDEX IF NOT EXISTS waitlist_referrer ON waitlist_signups(referred_by_id);
CREATE TABLE IF NOT EXISTS waitlist_deletions (
 id INTEGER PRIMARY KEY AUTOINCREMENT, phone_hash TEXT NOT NULL, reason TEXT NOT NULL,
 deleted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS admin_audit_log (
 id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, detail TEXT, ip_hash TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);
