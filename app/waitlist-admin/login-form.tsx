'use client';
import { useState } from 'react';

export function LoginForm() {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
    const response = await fetch('/api/waitlist-admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) });
    if (response.ok) { window.location.reload(); return; }
    const result = await response.json().catch(() => ({}));
    setError(result.error === 'locked' ? 'Too many attempts. Wait 15 minutes and try again.' : result.error === 'not_configured' ? 'Admin is not configured.' : response.status >= 500 ? 'Sign-in is temporarily unavailable. Please try again later.' : 'That email or password didn’t work.');
    } catch { setError('Could not connect. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className="wa-login"><section className="wa-login-card"><div className="wa-mark">P</div><p className="wa-kicker">PRIVATE ACCESS</p><h1>Waitlist admin</h1><p>Sign in to view and manage Payam’s launch list.</p><form onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p className="wa-error" role="alert">{error}</p>}<button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></section></main>;
}
