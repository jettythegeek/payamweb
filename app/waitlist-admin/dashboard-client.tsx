'use client';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type AdminRow = { id:number; phone_masked:string; city:string; roles:string[]; email:string|null; email_opt_in:boolean; wa_consent:boolean; consent_text_version:string; referral_code:string; referred_by_code:string|null; utm_source:string|null; status:string; created_at:string };

export function DashboardClient({ rows }: { rows: AdminRow[] }) {
  const router = useRouter(); const [revealed, setRevealed] = useState<Record<number,string>>({}); const [message,setMessage]=useState('');
  useEffect(() => {
    const interval = setInterval(() => { if (!document.hidden) router.refresh(); }, 60_000);
    return () => clearInterval(interval);
  }, [router]);
  async function post(path:string, body:unknown) { const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok) throw new Error('Request failed'); return r.json(); }
  async function revealPhone(id:number){try{const r=await post('/api/waitlist-admin/reveal',{id});setRevealed(v=>({...v,[id]:r.phone}));}catch{setMessage('Could not reveal that number.');}}
  async function status(id:number,next:string){try{await post('/api/waitlist-admin/status',{id,status:next});router.refresh();}catch{setMessage('Could not update that signup.');}}
  async function remove(id:number){const reason=window.prompt('Reason for deletion (required)');if(!reason)return;try{await post('/api/waitlist-admin/delete',{id,reason});router.refresh();}catch{setMessage('Could not delete that signup.');}}
  async function logout(){try{await post('/api/waitlist-admin/logout',{});window.location.reload();}catch{setMessage('Could not log out.');}}
  return <><div className="wa-top-actions"><a className="wa-button secondary" href="/api/waitlist-admin/export.csv">Export all (CSV)</a><button className="wa-button ghost" onClick={logout}>Log out</button></div>{message&&<p className="wa-error" role="alert">{message}</p>}{rows.length>0&&<div className="wa-table-wrap"><table><thead><tr><th>Phone</th><th>City</th><th>Roles</th><th>Email</th><th>Consent</th><th>Status</th><th>Referral</th><th>Joined (WAT)</th><th>Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{revealed[row.id]||row.phone_masked}<button className="wa-icon" onClick={()=>revealPhone(row.id)} aria-label="Reveal phone"><Eye aria-hidden="true" /></button></td><td>{row.city}</td><td>{row.roles.map(r=><span className="wa-chip" key={r}>{r}</span>)}</td><td>{row.email||'—'}</td><td>WA · {row.consent_text_version}<br/>Email {row.email_opt_in?'yes':'no'}</td><td><span className={`wa-status ${row.status}`}>{row.status}</span></td><td>{row.referral_code}{row.referred_by_code&&<small> via {row.referred_by_code}</small>}</td><td>{new Intl.DateTimeFormat('en-NG',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Lagos'}).format(new Date(row.created_at))}</td><td><select aria-label="Change status" value={row.status} onChange={e=>status(row.id,e.target.value)}><option value="joined">Joined</option><option value="confirmed">Confirmed</option><option value="unsubscribed">Unsubscribed</option></select><button className="wa-delete" onClick={()=>remove(row.id)}>Delete</button></td></tr>)}</tbody></table></div>}</>;
}
