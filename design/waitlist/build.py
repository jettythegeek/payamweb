# Generates the waitlist mockup HTML (html/*.html). Render with render.py.
import os
OUT='html'
I={ # lucide-style inline icons (stroke)
'check':'<path d="M20 6 9 17l-5-5"/>',
'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
'store':'<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v8h14v-8"/>',
'wrench':'<path d="M14.7 6.3a4 4 0 0 0 5 5L22 13.6 13.6 22l-2.3-2.3a4 4 0 0 0-5-5L3 18"/><path d="M14.7 6.3 18 3l3 3-3.3 3.3"/>',
'car':'<path d="M5 17h14M6 17v2M18 17v2"/><path d="M3 13l2-6h14l2 6v4H3z"/><circle cx="7.5" cy="14" r="1"/><circle cx="16.5" cy="14" r="1"/>',
'pin':'<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
'chev':'<path d="m6 9 6 6 6-6"/>',
'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
'lock':'<rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
'shield':'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
'alert':'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
'wifi':'<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/><path d="M3 3l18 18"/>',
'copy':'<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
'link':'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
'arrow':'<path d="M7 17 17 7M8 7h9v9"/>',
'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
'users':'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.5 2.3 3.5 5.5"/>',
'vote':'<path d="M9 12l2 2 4-4"/><rect x="3" y="4" width="18" height="16" rx="3"/>',
'mail':'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
'back':'<path d="M15 18l-6-6 6-6"/>',
'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
}
def ic(n,w=22,sw=2): return f'<svg viewBox="0 0 24 24" width="{w}" height="{w}" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[n]}</svg>'
WA='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>'
XL='<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>'

def page(title, body, cls=''):
    return f'''<!doctype html><html lang="en-NG"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — Payam waitlist mockup</title><link rel="stylesheet" href="waitlist.css"></head><body class="{cls}">{body}</body></html>'''

NAV=f'''<header class="nav"><img class="logo" src="assets/img/logo.png" alt="Payam">
<ul><li><a>What is Payam</a></li><li><a>How it works</a></li><li><a>For businesses</a></li><li><a>FAQs</a></li></ul>
<a class="cta primary">Join the waitlist</a><span class="burger">{ic('menu')}</span></header>'''

PILL='<span class="pill"><span class="dot"></span>Launching city by city across Nigeria</span>'
H1='<h1 class="h1">Pay, buy and book help near you.<br><span class="blue">Without the wahala.</span></h1>'
SUB='<p class="t1 sub">Bills, airtime, food, market runs, a plumber or a braider, even a keke ride — in one app. Buying from a seller? Pay into escrow, and they only get paid when you confirm.</p>'
CONSENT_MICRO='We’ll only message you about Payam’s launch. We won’t share your number. Reply STOP anytime. <a>Privacy Policy</a>'
TRUST=f'''<div class="trust"><span class="chip">{ic('check',16)}Free to join</span><span class="chip">{ic('vote',16)}Your city choice is a vote</span><span class="chip">{ic('users',16)}Customers, sellers, providers and drivers</span></div>'''
ART='<img class="hero-art d" src="assets/img/hero-arch-desktop.jpg" alt="Payam app home screen with food, shopping and local help"><img class="hero-art m" src="assets/img/hero-arch-mobile.jpg" alt="Payam app home screen">'

def phone_form(value=None):
    v = f'<span class="in">{value}</span>' if value else '<span class="in ph">803 123 4567</span>'
    return f'''<div style="width:640px;max-width:100%"><label class="field-label">Your WhatsApp number</label>
<div class="phone-form"><span class="cc"><span class="flag"></span>+234</span>{v}<a class="btn btn-primary">Join the waitlist</a></div>
<p class="micro">{CONSENT_MICRO}</p></div>'''

# (a) hero
a = NAV+f'<main class="hero">{PILL}{H1}{SUB}{phone_form()}{TRUST}</main>{ART}'

CITIES=['Umuahia','Aba','Owerri','Port Harcourt']
def listbox():
    opts=''.join(f'<div class="opt{" sel" if c=="Umuahia" else ""}">{c}{ic("check",18) if c=="Umuahia" else ""}</div>' for c in CITIES)
    return f'''<div class="listbox"><div class="search">{ic('search',18)}<span class="ph" style="color:#98a2b3">Search cities</span></div>{opts}
<div class="sep"></div>
<div class="opt"><span>Other — type your city</span>{ic('pin',18)}</div></div>'''

def roles(on=('use',)):
    R=[('use','user','I want to use Payam','Pay bills, shop, book help, ride'),('sell','store','I sell things','Food, groceries, fashion, gadgets…'),
       ('serve','wrench','I offer a service','Plumbing, hair, cleaning, repairs…'),('drive','car','I drive','Keke, taxi or premium car')]
    return '<div class="roles">'+''.join(f'''<div class="role{' on' if k in on else ''}"><span class="ic">{ic(i)}</span><div><b>{t}</b><span>{s}</span></div><span class="tick">{ic('check',16,3) if k in on else ''}</span></div>''' for k,i,t,s in R)+'</div>'

CONSENT_TXT='Yes, Payam can send me WhatsApp messages about the waitlist and when Payam launches in my city. I can reply STOP or ask to be removed at any time. <a>Privacy Policy</a>'

def form_card(mobile=False, other=False):
    city = (f'''<div class="input">Other<span class="chev">{ic('chev')}</span></div>
<div class="input focus" style="margin-top:10px">Nsukka<span style="color:var(--payam-primary);margin-left:2px">|</span></div><p class="help">We’ll count this as a vote for your city.</p>''' if other else
            f'''<div class="input focus">Umuahia<span class="chev">{ic('chev')}</span></div>{'' if mobile else listbox()}''')
    phone=f'''<div class="field"><label class="field-label">WhatsApp number</label>
<div class="input ok"><span class="flag"></span><b style="font-weight:600">+234</b> 801 234 5678<span class="ok-ic">{ic('check',18,3)}<em>Looks good</em></span></div></div>'''
    cityf=f'<div class="field"><label class="field-label">Your city</label>{city}</div>'
    email=f'''<div class="field"><label class="field-label">Email <span style="font-weight:400;color:var(--payam-muted)">(optional)</span></label>
<div class="input"><span class="ph">you@example.com</span></div><p class="help">Only if you’d like launch news by email too.</p></div>'''
    rolef=f'''<div class="field"><label class="field-label">How will you use Payam? <span style="font-weight:400;color:var(--payam-muted)">Pick all that apply</span></label>{roles(('use','serve') if other else ('use',))}</div>'''
    body = (phone+cityf+rolef+email) if mobile else f'<div class="cols"><div>{phone}{cityf}</div><div>{rolef}{email}</div></div>'
    return f'''<section class="card form-card">
<div class="head"><div><p class="steps">Step 2 of 2</p><h2 class="h3">Almost done. Where should Payam open first?</h2>
<p class="t2" style="margin-top:8px">We open one city at a time. Your pick is a vote, not a launch date.</p></div></div>
{body}
<div class="consent"><span class="box on">{ic('check',16,3)}</span><p>{CONSENT_TXT}</p></div>
<div class="actions"><a class="btn btn-white btn-sm" style="box-shadow:none;background:var(--payam-canvas)">{ic('back',18)}Back</a><a class="btn btn-primary">Join the waitlist</a></div>
<p class="privacy-note">{ic('lock',16)}Your details are stored securely and used only for Payam’s launch.</p>
</section>'''

b_d = NAV+f'<main class="hero" style="padding-bottom:64px">{PILL}<h1 class="h1" style="font-size:56px;margin-bottom:28px">Pay, buy and book help near you.<br><span class="blue">Without the wahala.</span></h1>{form_card()}</main>'
b_m = NAV+f'<main class="hero" style="padding-bottom:40px">{form_card(mobile=True, other=True)}</main>'

# (c) success
c = NAV+f'''<main class="hero" style="padding-bottom:64px"><section class="card success">
<div class="badge-ok">{ic('check',46,3)}</div><span class="label">E don set</span>
<h2 class="h3">You’re on the list.</h2>
<p class="t2">We’ll message you on WhatsApp at <b style="color:var(--payam-text)">+234 801 ••• 5678</b> as soon as Payam opens in <b style="color:var(--payam-text)">Umuahia</b>. No queue numbers — we invite people city by city.</p>
<div class="panel"><div class="row"><span class="num">1</span><div style="flex:1"><h4>Confirm your number on WhatsApp</h4><p>Send us one quick message so we know this number is yours.  It takes one tap and you can skip it.</p></div></div>
<div class="share-row" style="margin-top:16px"><a class="btn btn-mint">{WA}Confirm on WhatsApp</a></div></div>
<div class="panel"><div class="row"><span class="num">2</span><div style="flex:1"><h4>Help Umuahia open sooner</h4><p>Cities with more sign-ups go live first. Share your link with family, friends and the people you buy from.</p></div></div>
<div class="link-row"><span class="link-box">{ic('link',18)}usepayam.vercel.app/?ref=K7Q2MA</span><a class="btn btn-white btn-sm">{ic('copy',18)}Copy link</a></div>
<div class="share-row"><a class="btn btn-primary btn-sm">{WA}Share on WhatsApp</a><a class="btn btn-white btn-sm">{XL}Share on X</a></div>
<p class="stat-line">{ic('users',16)}<span>People who joined with your link: <b>0</b> so far</span></p></div>
</section></main>'''

# (d) errors + duplicate
ERR=lambda t: f'<p class="error">{ic("alert",18)}<span>{t}</span></p>'
d_form=f'''<section class="card form-card" style="width:auto;flex:1">
<p class="steps" style="color:var(--danger)">Check 3 things</p><h2 class="h3" style="font-size:30px">Almost there — fix these and you’re in.</h2>
<div style="margin-top:24px" class="field"><label class="field-label">WhatsApp number</label>
<div class="input err"><span class="flag"></span><b style="font-weight:600">+234</b> 123 456</div>
{ERR('That doesn’t look like a Nigerian mobile number. Try 0803 123 4567 or +234 803 123 4567.')}</div>
<div class="field"><label class="field-label">Your city</label><div class="input err"><span class="ph">Choose your city</span><span class="chev">{ic('chev')}</span></div>
{ERR('Pick a city, or choose “Other” and type yours.')}</div>
<div class="consent err"><span class="box" style="border-color:var(--danger)"></span><p>{CONSENT_TXT}</p></div>
{ERR('Tick the box so we can message you on WhatsApp. Without it, we can’t tell you when we launch.')}
<div class="actions"><a class="btn btn-primary">Join the waitlist</a></div></section>'''
d_dup=f'''<div style="flex:1;display:flex;flex-direction:column;gap:20px">
<section class="card success" style="width:auto;padding:40px">
<div class="badge-ok badge-info">{ic('info',42,2.4)}</div>
<h2 class="h3">You’re already on the list</h2>
<p class="t2">This number has already joined the Payam waitlist — no need to sign up again. We’ll message you on WhatsApp when we launch in your city.</p>
<div class="share-row" style="margin-top:24px"><a class="btn btn-mint btn-sm">{WA}Change city or role on WhatsApp</a></div>
<p class="help" style="margin-top:14px">For your privacy we don’t show the details saved for a number.</p></section>
<div class="alert danger">{ic('wifi')}<div><b>Network wahala</b><span>We couldn’t save your details. Check your connection and try again — nothing was lost.</span></div></div>
<div class="alert info">{ic('clock')}<div><b>Too many tries</b><span>Please wait a minute, then try again.</span></div></div></div>'''
d = NAV+f'<main class="hero" style="padding-bottom:64px;align-items:stretch"><div class="stack-m" style="display:flex;gap:24px;max-width:1240px;margin:0 auto;width:100%;align-items:flex-start">{d_form}{d_dup}</div></main>'

# (e) business block
e = NAV+f'''<section class="section"><div class="container"><div class="biz"><div class="copy">
<span class="label white">Payam Business</span>
<h2 class="h2" style="margin-top:28px">Sell, fix or drive? Get ready before your city opens.</h2>
<p class="lead">Payam Business is for vendors, service providers and drivers. You can start once Payam is live in your city — join now and we’ll reach out to set you up before customers arrive.</p>
<div class="tiles">
<div class="tile"><span class="ic">{ic('store')}</span><div><b>Vendors</b><span>Restaurants, mama put, groceries, shops and online sellers</span></div></div>
<div class="tile"><span class="ic">{ic('wrench')}</span><div><b>Service providers</b><span>Plumbers, electricians, braiders, cleaners, mechanics</span></div></div>
<div class="tile"><span class="ic">{ic('car')}</span><div><b>Drivers</b><span>Keke, taxi and premium car drivers</span></div></div></div>
<a class="camp-btn">Join as a business<span>{ic('arrow',22)}</span></a>
<p class="note"><i></i>Same quick form · pick your city and what you do</p>
</div><div class="img" role="img" aria-label="A Payam vendor and a service provider"></div></div></div></section>'''

pages={'a-hero':a,'b-form-desktop':b_d,'b-form-mobile':b_m,'c-success':c,'d-errors':d,'e-business':e}
for k,v in pages.items():
    open(os.path.join(OUT,k+'.html'),'w').write(page(k,v))
print('wrote',list(pages))
