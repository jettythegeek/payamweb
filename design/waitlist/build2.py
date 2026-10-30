# Admin (/waitlist-admin) + original footer mockups. Example data lives ONLY here (mockup), never in app code.
from build import ic, I, WA, XL, page, NAV, OUT, CONSENT_MICRO
import os
I.update({
'eye':'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
'trash':'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
'download':'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
'logout':'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
'filter':'<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
'up':'<path d="M12 19V5M6 11l6-6 6 6"/>',
'flask':'<path d="M9 3h6M10 3v6L4 19a1.5 1.5 0 0 0 1.3 2h13.4A1.5 1.5 0 0 0 20 19l-6-10V3"/>',
'phone':'<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M11 18h2"/>',
'ig':'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
})
FB='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg>'
TT='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.4 2.4 1.9 4 4.5 4.2v3.5A8 8 0 0 1 16 9.4v6.4A6 6 0 1 1 10 9.8v3.6a2.5 2.5 0 1 0 2.5 2.4V3z"/></svg>'
YT='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3z"/></svg>'

def top():
    return f'''<header class="adm-top"><img class="logo" src="assets/img/logo.png" alt="Payam"><span class="ttl">Waitlist admin</span>
<span class="priv">{ic('lock',14)}Private · not indexed</span><span class="priv" style="margin-left:8px">{ic('user',14)}waitlist@payam.ng</span><a class="out">{ic('logout',18)}Log out</a></header>'''

# ---------- login ----------
login = f'''<div class="login-wrap"><div class="login"><img class="logo" src="assets/img/logo.png" alt="Payam">
<p class="steps">Private</p><h1 class="h3" style="margin-bottom:8px">Waitlist admin</h1>
<p class="t2" style="font-size:16px;margin-bottom:24px">Sign in with the waitlist admin account to see who has joined.</p>
<div class="field"><label class="field-label">Admin email</label><div class="input">waitlist@payam.ng</div></div>
<div class="field"><label class="field-label">Password</label><div class="input focus">••••••••••••••••••<span class="chev">{ic('eye',20)}</span></div>
<p class="error">{ic('alert',18)}<span>That email or password didn't work. 3 tries left, then wait 15 minutes.</span></p></div>
<a class="btn btn-primary" style="width:100%">Sign in</a>
<p class="privacy-note">{ic('lock',16)}Session ends after 8 hours or when you log out.</p></div></div>'''

# ---------- data ----------
ROWS=[ # EXAMPLE DATA (mockup only)
 ('0001','Umuahia',['use'],'—',True,'K7Q2MA','—','whatsapp','30 Oct 2026, 13:52'),
 ('0002','Aba',['use','sell'],'ada@example.com',True,'P4XN8R','K7Q2MA','whatsapp','30 Oct 2026, 12:10'),
 ('0003','Owerri',['serve'],'—',False,'W2HT6D','—','x','30 Oct 2026, 11:41'),
 ('0004','Umuahia',['drive'],'—',True,'Z9MV3K','K7Q2MA','whatsapp','30 Oct 2026, 10:05'),
 ('0005','Port Harcourt',['use'],'tobe@example.com',False,'C5RJ7Q','—','instagram','29 Oct 2026, 21:30'),
 ('0006','Aba',['sell'],'—',True,'H8DK2W','P4XN8R','whatsapp','29 Oct 2026, 18:02'),
 ('0007','Nsukka (Other)',['use','serve'],'—',False,'M3QA9T','—','—','29 Oct 2026, 15:47'),
 ('0008','Umuahia',['use'],'—',True,'R6YB4N','K7Q2MA','whatsapp','29 Oct 2026, 09:20'),
]
RL={'use':'Customer','sell':'Seller','serve':'Service','drive':'Driver'}
tot=len(ROWS); conf=sum(r[4] for r in ROWS); biz=sum(1 for r in ROWS if set(r[2])&{'sell','serve','drive'})
from collections import Counter
cc=Counter(r[1] for r in ROWS); rc=Counter(x for r in ROWS for x in r[2]); refc=Counter(r[6] for r in ROWS if r[6]!='—')

def stats(t,c,b):
    return f'''<div class="stats">
<div class="stat"><div class="k"><i style="background:var(--payam-primary)"></i>Total signups</div><div class="v">{t}</div><div class="s">All cities</div></div>
<div class="stat"><div class="k"><i style="background:var(--payam-growth)"></i>Confirmed on WhatsApp</div><div class="v">{c}</div><div class="s">Sent the confirm message</div></div>
<div class="stat"><div class="k"><i style="background:#c4cad6"></i>Not confirmed</div><div class="v">{t-c}</div><div class="s">Opted in, not confirmed yet</div></div>
<div class="stat"><div class="k"><i style="background:#a5530b"></i>Businesses</div><div class="v">{b}</div><div class="s">Sell, service or drive</div></div></div>'''

def panels(empty):
    if empty:
        e='<div class="empty-mini">No signups yet</div>'
        return f'<div class="panels"><div class="pcard"><h3>By city <small>votes</small></h3>{e}</div><div class="pcard"><h3>By role</h3>{e}</div><div class="pcard"><h3>Top referrers</h3>{e}</div></div>'
    m=max(cc.values())
    city=''.join(f'<div class="bar"><span>{k}</span><span class="tr"><b style="width:{v/m*100:.0f}%"></b></span><span class="n">{v}</span></div>' for k,v in cc.most_common(5))
    m2=max(rc.values())
    role=''.join(f'<div class="bar"><span>{RL[k]}</span><span class="tr"><b class="g" style="width:{rc[k]/m2*100:.0f}%"></b></span><span class="n">{rc[k]}</span></div>' for k in ['use','sell','serve','drive'])
    refs=''.join(f'<div class="ref-row"><span class="code">{k}</span><span>{v} joined</span></div>' for k,v in refc.most_common(3))
    return f'<div class="panels"><div class="pcard"><h3>By city <small>top 5 of {len(cc)}</small></h3>{city}</div><div class="pcard"><h3>By role <small>multi-select</small></h3>{role}</div><div class="pcard"><h3>Top referrers</h3>{refs}</div></div>'

FILTERS=f'''<div class="filters"><span class="f-in grow">{ic('search',16)}<span class="ph">Search phone, email or referral code</span></span>
<span class="f-in">City: All {ic('chev',16)}</span><span class="f-in">Role: All {ic('chev',16)}</span><span class="f-in">Confirmed: All {ic('chev',16)}</span>
<a class="btn btn-soft">{ic('download',16)}Export CSV</a></div>'''

def rolechips(rs): return ''.join(f'<span class="rchip {r}">{RL[r]}</span>' for r in rs)
def yes(b,t='Yes'): return f'<span class="yes">{ic("check",14,3)}{t}</span>' if b else '<span class="no">No</span>'

def table(rows, reveal_idx=1):
    th='<tr><th>Phone</th><th>City</th><th>Roles</th><th>Email</th><th>Consent</th><th>Confirmed</th><th>Code</th><th>Referred by</th><th>UTM</th><th>Joined (WAT)</th><th></th></tr>'
    tr=''
    for i,(p,c,rs,em,cf,code,rb,utm,at) in enumerate(rows):
        ph = f'+234 801 234 {p[-4:]}' if i==reveal_idx else f'+234 801 ••• {p}'
        eye = 'Hide' if i==reveal_idx else ''
        tr+=f'''<tr><td><span class="mask">{ph}<button title="{'Hide' if eye else 'Reveal'}">{ic('eye',16)}</button></span></td><td>{c}</td><td>{rolechips(rs)}</td><td>{em}</td>
<td>WA {yes(True,'v1')}{'' if em=='—' else (' · Email ✓' if i%2==1 else ' · Email —')}</td><td>{yes(cf)}</td><td><span class="code">{code}</span></td><td>{rb}</td><td>{utm}</td><td>{at}</td><td><button class="del" title="Delete on request">{ic('trash',16)}</button></td></tr>'''
    mc=''
    for i,(p,c,rs,em,cf,code,rb,utm,at) in enumerate(rows[:4]):
        mc+=f'''<div class="mc"><div class="top"><span class="mask"><b style="font-weight:600">+234 801 ••• {p}</b><button>{ic('eye',16)}</button></span><button class="del">{ic('trash',16)}</button></div>
<div>{c} · {rolechips(rs)}</div><div class="meta">Confirmed: {'Yes' if cf else 'No'} · Code <span class="code">{code}</span>{' · via '+rb if rb!='—' else ''}<br>{at} WAT · utm: {utm}</div></div>'''
    return f'<table class="wl">{th}{tr}</table><div class="mcards">{mc}</div><div class="pager"><span>Showing {len(rows)} of {len(rows)}</span><span>Phone numbers are masked until you tap the eye</span></div>'

def dash(empty):
    head=f'''<div class="adm-h"><div><h1>Waitlist</h1><p>Live from the database · counts refresh every minute · times in WAT (UTC+1).</p></div><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-soft btn-sm">{ic('link',18)}Open in Supabase</a><a class="btn btn-primary btn-sm">{ic('download',18)}Export all (CSV)</a></div></div>'''
    ex='' if empty else f'<div class="example">{ic("flask",18)}EXAMPLE DATA — mockup only. These are not real signups; the app never ships sample rows.</div>'
    if empty:
        tbl=f'''<div class="tcard">{FILTERS}<div class="empty-state"><div class="badge-ok badge-info">{ic('users',40,2)}</div><h3>No signups yet</h3>
<p>When people join from the website they'll show up here, newest first. Share the site link on WhatsApp to get your first signups.</p><a class="btn btn-soft btn-sm">{ic('copy',18)}Copy site link</a></div></div>'''
    else:
        tbl=f'<div class="tcard">{FILTERS}{table(ROWS)}</div>'
    return f'<div class="adm">{top()}<main class="adm-body">{ex}{head}{stats(0,0,0) if empty else stats(tot,conf,biz)}{panels(empty)}{tbl}</main></div>'

delete_modal = dash(False) + f'''<div class="modal-bg"><div class="modal"><div class="badge-ok" style="background:var(--danger-soft);color:var(--danger);width:56px;height:56px;margin:0">{ic('trash',26)}</div>
<h3>Delete this signup?</h3><p>This permanently deletes <b style="color:var(--payam-text)">+234 801 ••• 0003</b> and their consent record, as asked under the NDPA. It can't be undone. The deletions log keeps only the date, the reason and a one-way hash, so you can prove it was done.</p>
<div class="field" style="margin-top:16px"><label class="field-label">Reason</label><div class="input">Person asked to be removed (WhatsApp)<span class="chev">{ic('chev')}</span></div></div>
<div class="actions"><a class="btn btn-white btn-sm" style="box-shadow:none;background:var(--payam-canvas)">Cancel</a><a class="btn btn-danger btn-sm">Delete permanently</a></div></div></div>'''

# ---------- footer ----------
CITIES9=['Umuahia','Aba','Owerri','Port Harcourt','Awka','Onitsha','Enugu','Abakaliki','Uyo']
chips=''.join(f'<a class="vchip">{ic("pin",15)}{c}</a>' for c in CITIES9)+f'<a class="vchip more">Other city</a>'
footer = f'''<div style="height:40px"></div><footer class="pf">
<section class="pf-band"><span class="ring"></span><div style="position:relative">
<h2>Want Payam in <em>your city</em> first?</h2>
<p class="lead">We're opening one city at a time. Join with your WhatsApp number and vote — cities with the most sign-ups open first.</p>
<div class="vote"><h4>{ic('vote',16)}Vote for your city</h4><div class="cities">{chips}</div></div></div>
<div style="position:relative;align-self:end"><label class="field-label">Your WhatsApp number</label>
<div class="phone-form"><span class="cc"><span class="flag"></span>+234</span><span class="in ph">803 123 4567</span><a class="btn btn-mint">Join the waitlist</a></div>
<p class="micro">{CONSENT_MICRO}</p></div></section>
<section class="pf-main"><div class="pf-grid">
<div class="pf-brand"><img class="logo-w" src="assets/img/logo.png" alt="Payam"><p>Bills, food, market runs, local help and rides in one app, with escrow when you buy from a seller. Launching city by city across Nigeria.</p>
<a class="pf-wa">{WA}Chat with us on WhatsApp</a></div>
<div class="pf-col"><h5>Payam</h5><a>About Payam</a><a>How it works</a><a>FAQs</a><a>Join the waitlist</a></div>
<div class="pf-col"><h5>For businesses</h5><a>Sell on Payam<small>Vendors, mama put, shops</small></a><a>Offer a service<small>Plumbers, braiders, cleaners</small></a><a>Drive with Payam<small>Keke, taxi, premium</small></a></div>
<div class="pf-col"><h5>Trust</h5><a>How escrow protects you</a><a>Privacy Policy</a><a>Terms</a><a>Report a problem</a></div>
<div class="pf-col"><h5>Contact</h5><a>WhatsApp<small>Fastest reply</small></a><a>support@payam.ng<small>Email</small></a></div>
</div>
<div class="pf-safe">{ic('shield')}<span><b>Stay safe:</b> Payam will never ask for your PIN, OTP or password — not on WhatsApp, not on a call. If someone does, report it.</span></div>
<div class="pf-bottom"><span class="ng"><span class="flag"></span>© 2026 [Legal entity name] · Made in Nigeria</span>
<div class="pf-social"><a title="X">{XL}</a><a title="Instagram">{ic('ig',18)}</a><a title="TikTok">{TT}</a><a title="Facebook">{FB}</a><a title="YouTube">{YT}</a><a class="pf-top" title="Back to top">{ic('up',18)}</a></div></div>
</section></footer>'''

pages={'f-admin-login':login,'f-admin-empty':dash(True),'f-admin-populated':dash(False),'f-admin-delete':delete_modal,'g-footer':footer}
for k,v in pages.items(): open(os.path.join(OUT,k+'.html'),'w').write(page(k,v))
print('wrote',list(pages), 'tot',tot,'conf',conf,'biz',biz)
