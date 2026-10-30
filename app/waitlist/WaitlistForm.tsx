'use client'

import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ArrowLeft, BadgeCheck, CarFront, Check, CheckCircle2, ChevronDown, CircleCheckBig, Info, LockKeyhole, MapPin, MapPinned, Search, Store, UserRound, UsersRound, Wrench } from 'lucide-react'
import { cityFromSlug, WAITLIST_CITIES } from './cities'
import { waitlistConsentText } from './consent'
import { maskPhone, normaliseNigerianPhone, PHONE_ERROR } from './phone'
import type { JoinResponse, WaitlistRole, WaitlistVariant } from './types'
import { Turnstile } from './Turnstile'

const CITY_ERROR = 'Pick a city, or choose “Other” and type yours.'
const ROLE_ERROR = 'Pick at least one way you’ll use Payam.'
const CONSENT_ERROR =
  "Tick the box so we can message you on WhatsApp. Without it, we can't tell you when we launch."
const NETWORK_ERROR =
  "We couldn't save your details. Check your connection and try again — nothing was lost."

const ROLE_COPY: Record<WaitlistRole, { title: string; detail: string }> = {
  use: { title: 'I want to use Payam', detail: 'Pay bills, shop, book help, ride' },
  sell: { title: 'I sell things', detail: 'Food, groceries, fashion, gadgets…' },
  serve: { title: 'I offer a service', detail: 'Plumbing, hair, cleaning, repairs…' },
  drive: { title: 'I drive', detail: 'Keke, taxi or premium car' },
}

const ROLE_ICONS = { use: UserRound, sell: Store, serve: Wrench, drive: CarFront } as const

type Errors = Partial<Record<'phone' | 'city' | 'roles' | 'email' | 'consent' | 'turnstile', string>>
type Outcome =
  | { kind: 'joined'; code: string; city: string; count: number }
  | { kind: 'duplicate' }
  | { kind: 'network' | 'rate' | 'verification' }

function plausible(event: string) {
  if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return
  const w = window as Window & { plausible?: (name: string, options?: object) => void }
  w.plausible?.(event)
}

function currentSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || window.location.origin
}

function captureAttribution() {
  const params = new URLSearchParams(window.location.search)
  for (const key of ['ref', 'utm_source', 'utm_medium', 'utm_campaign']) {
    const value = params.get(key)
    if (value) sessionStorage.setItem(`payam_waitlist_${key}`, value.slice(0, 100))
  }
}

export function WaitlistForm({
  variant = 'hero',
  legalEntity = 'Payam',
  whatsappNumber,
}: {
  variant?: WaitlistVariant
  legalEntity?: string
  whatsappNumber?: string
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [otherCity, setOtherCity] = useState('')
  const [cityOpen, setCityOpen] = useState(false)
  const [activeCity, setActiveCity] = useState(0)
  const [roles, setRoles] = useState<WaitlistRole[]>([])
  const [email, setEmail] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [consent, setConsent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [businessIntent, setBusinessIntent] = useState(false)
  const renderedAt = useRef(Date.now())
  const phoneRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLButtonElement>(null)
  const rolesRef = useRef<HTMLDivElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const firedConfetti = useRef(false)

  const setToken = useCallback((token: string) => setTurnstileToken(token), [])

  useEffect(() => {
    captureAttribution()
    const params = new URLSearchParams(window.location.search)
    const selected = cityFromSlug(params.get('city'))
    if (selected) {
      setCity(selected.name)
      setCityQuery(selected.name)
    }
    if (params.get('intent') === 'business') {
      setBusinessIntent(true)
      window.setTimeout(() => phoneRef.current?.focus(), 0)
    }
  }, [])

  useEffect(() => {
    const focus = () => phoneRef.current?.focus()
    window.addEventListener('payam:focus-waitlist', focus)
    return () => window.removeEventListener('payam:focus-waitlist', focus)
  }, [])

  useEffect(() => {
    if (outcome?.kind !== 'joined' || firedConfetti.current) return
    firedConfetti.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    void import('canvas-confetti').then(({ default: confetti }) => {
      const end = Date.now() + 1500
      const burst = () => {
        confetti({
          particleCount: 22,
          spread: 70,
          startVelocity: 28,
          origin: { x: Math.random(), y: 0.65 },
          colors: ['#2851CB', '#20D46B', '#0C1425', '#FFFFFF'],
          disableForReducedMotion: true,
        })
        if (Date.now() < end) window.setTimeout(burst, 180)
      }
      burst()
    })
  }, [outcome])

  const roleOrder = useMemo<WaitlistRole[]>(() => {
    return businessIntent ? ['sell', 'serve', 'drive', 'use'] : ['use', 'sell', 'serve', 'drive']
  }, [businessIntent])

  const filteredCities = useMemo(() => {
    const query = cityQuery.trim().toLowerCase()
    return WAITLIST_CITIES.filter((item) => !query || item.name.toLowerCase().includes(query))
  }, [cityQuery])

  function startDetails(event: FormEvent) {
    event.preventDefault()
    const normalised = normaliseNigerianPhone(phone)
    if (!normalised) {
      setErrors({ phone: PHONE_ERROR })
      phoneRef.current?.focus()
      return
    }
    setErrors({})
    setPhone(normalised)
    setStep(2)
    plausible('waitlist_step1')
    window.setTimeout(() => cityRef.current?.focus(), 0)
  }

  function chooseCity(name: string) {
    setCity(name)
    setCityQuery(name === '__other__' ? '' : name)
    setCityOpen(false)
    setErrors((current) => ({ ...current, city: undefined }))
  }

  function cityKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const choices = [...filteredCities.map((item) => item.name), '__other__']
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCityOpen(true)
      setActiveCity((value) => Math.min(value + 1, choices.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveCity((value) => Math.max(value - 1, 0))
    } else if (event.key === 'Enter' && cityOpen) {
      event.preventDefault()
      chooseCity(choices[activeCity] || '__other__')
    } else if (event.key === 'Escape') {
      setCityOpen(false)
    }
  }

  function toggleRole(role: WaitlistRole) {
    setRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role],
    )
    setErrors((current) => ({ ...current, roles: undefined }))
  }

  function validate() {
    const next: Errors = {}
    if (!normaliseNigerianPhone(phone)) next.phone = PHONE_ERROR
    const finalCity = city === '__other__' ? otherCity.trim() : city
    if (!finalCity || (city === '__other__' && (finalCity.length < 2 || finalCity.length > 60))) next.city = CITY_ERROR
    if (!roles.length) next.roles = ROLE_ERROR
    if (email && (!/^\S+@\S+\.\S+$/.test(email) || email.length > 120)) next.email = 'Enter a valid email address.'
    if (!consent) next.consent = CONSENT_ERROR
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) next.turnstile = 'Please complete the security check.'
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first === 'phone') phoneRef.current?.focus()
    else if (first === 'city') cityRef.current?.focus()
    else if (first === 'roles') rolesRef.current?.focus()
    else if (first === 'consent') consentRef.current?.focus()
    return Object.keys(next).length === 0
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setOutcome(null)
    plausible('waitlist_submit')
    const finalCity = city === '__other__' ? otherCity.trim() : city
    const stored = (key: string) => sessionStorage.getItem(`payam_waitlist_${key}`) || undefined
    const payload = {
      phone: normaliseNigerianPhone(phone),
      city: finalCity,
      city_is_other: city === '__other__',
      roles,
      email: email || undefined,
      email_opt_in: Boolean(email && emailOptIn),
      consent_whatsapp: consent,
      turnstile_token: turnstileToken,
      company_website: new FormData(event.currentTarget).get('company_website') || '',
      form_rendered_at: renderedAt.current,
      ref: stored('ref'),
      utm_source: stored('utm_source'),
      utm_medium: stored('utm_medium'),
      utm_campaign: stored('utm_campaign'),
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = (await response.json()) as JoinResponse
      if (response.status === 201 && 'status' in body && body.status === 'joined') {
        setOutcome({ kind: 'joined', code: body.referral_code, city: body.city || finalCity, count: body.referrals_count || 0 })
        plausible('waitlist_success')
      } else if (response.status === 409) {
        setOutcome({ kind: 'duplicate' })
        plausible('waitlist_duplicate')
      } else if (response.status === 429) setOutcome({ kind: 'rate' })
      else if (response.status === 422 && 'error' in body && body.error === 'verification_failed') setOutcome({ kind: 'verification' })
      else setOutcome({ kind: 'network' })
    } catch {
      setOutcome({ kind: 'network' })
    } finally {
      setSubmitting(false)
      setTurnstileReset((value) => value + 1)
    }
  }

  if (outcome?.kind === 'joined') {
    return <SuccessState outcome={outcome} phone={phone} whatsappNumber={whatsappNumber} setCopied={setCopied} copied={copied} />
  }
  if (outcome?.kind === 'duplicate') return <DuplicateState whatsappNumber={whatsappNumber} />

  if (step === 1) {
    return (
      <form className={`wl wl--${variant} wl-step-one`} onSubmit={startDetails} noValidate>
        <label className="wl-label" htmlFor={`waitlist-phone-${variant}`}>Your WhatsApp number</label>
        <div className="wl-phone-row">
          <span className="wl-prefix" aria-hidden="true"><span className="wl-flag" />+234</span>
          <input ref={phoneRef} id={`waitlist-phone-${variant}`} value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel-national" placeholder="803 123 4567" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? `phone-error-${variant}` : undefined} />
          <button type="submit" className="wl-button">Join the waitlist</button>
        </div>
        {errors.phone && <p id={`phone-error-${variant}`} className="wl-error" aria-live="polite">{errors.phone}</p>}
        <p className="wl-micro">We&apos;ll only message you about Payam&apos;s launch. We won&apos;t share your number. Reply STOP anytime. <a href="/privacy-policy">Privacy Policy</a></p>
        {variant !== 'compact' && <div className="wl-chips" aria-label="Waitlist benefits"><span><BadgeCheck aria-hidden="true" />Free to join</span><span><MapPinned aria-hidden="true" />Your city choice is a vote</span><span><UsersRound aria-hidden="true" />Customers, sellers, providers and drivers</span></div>}
      </form>
    )
  }

  return (
    <form className={`wl wl--${variant} wl-card`} onSubmit={submit} noValidate>
      <p className="wl-step">Step 2 of 2</p>
      <h2>Almost done. Where should Payam open first?</h2>
      <p className="wl-subtitle">We open one city at a time. Your pick is a vote, not a launch date.</p>
      {outcome && <OutcomeAlert outcome={outcome} />}
      <div className="wl-columns">
        <div>
          <label className="wl-label" htmlFor={`details-phone-${variant}`}>WhatsApp number</label>
          <div className="wl-static-phone"><span className="wl-flag" />{maskPhone(normaliseNigerianPhone(phone) || phone)} <span><CheckCircle2 aria-hidden="true" />Looks good</span></div>
          <div className="wl-field">
            <label className="wl-label" id={`city-label-${variant}`}>Your city</label>
            <button ref={cityRef} id={`city-${variant}`} type="button" className="wl-input wl-city-trigger" aria-labelledby={`city-label-${variant} city-${variant}`} aria-haspopup="listbox" aria-expanded={cityOpen} aria-controls={`city-list-${variant}`} aria-invalid={Boolean(errors.city)} onClick={() => setCityOpen((open) => !open)}><span>{city === '__other__' ? 'Other — type your city' : city || 'Select your city'}</span><ChevronDown aria-hidden="true" /></button>
            {cityOpen && <div id={`city-list-${variant}`} role="listbox" className="wl-listbox">
              <div className="wl-city-search"><Search aria-hidden="true" /><input value={cityQuery} placeholder="Search cities" aria-label="Search cities" onChange={(event) => { setCityQuery(event.target.value); setActiveCity(0) }} onKeyDown={cityKeyDown} autoFocus /></div>
              {filteredCities.map((item, index) => <button type="button" role="option" aria-selected={city === item.name} className={index === activeCity ? 'is-active' : ''} key={item.slug} onClick={() => chooseCity(item.name)}>{item.name}{city === item.name && <Check aria-hidden="true" />}</button>)}
              <button type="button" role="option" aria-selected={city === '__other__'} className={`wl-other-option ${activeCity === filteredCities.length ? 'is-active' : ''}`} onClick={() => chooseCity('__other__')}><span>Other — type your city</span><MapPin aria-hidden="true" /></button>
            </div>}
            {city === '__other__' && <><input className="wl-input wl-other" value={otherCity} onChange={(event) => setOtherCity(event.target.value)} minLength={2} maxLength={60} placeholder="Type your city" aria-label="Type your city" /><p className="wl-help">We&apos;ll count this as a vote for your city.</p></>}
            {errors.city && <p className="wl-error" aria-live="polite">{errors.city}</p>}
          </div>
        </div>
        <div>
          <fieldset className="wl-fieldset"><legend>How will you use Payam? <span>Pick all that apply</span></legend><div ref={rolesRef} tabIndex={-1} className="wl-roles">
            {roleOrder.map((role) => { const RoleIcon = ROLE_ICONS[role]; return <button key={role} type="button" aria-pressed={roles.includes(role)} className={roles.includes(role) ? 'is-selected' : ''} onClick={() => toggleRole(role)}><span className="wl-role-icon"><RoleIcon aria-hidden="true" /></span><span className="wl-role-copy"><strong>{ROLE_COPY[role].title}</strong><small>{ROLE_COPY[role].detail}</small></span><span className="wl-check" aria-hidden="true">{roles.includes(role) && <Check aria-hidden="true" />}</span></button> })}
          </div></fieldset>
          {errors.roles && <p className="wl-error" aria-live="polite">{errors.roles}</p>}
          <div className="wl-field"><label className="wl-label" htmlFor={`email-${variant}`}>Email <span>(optional)</span></label><input id={`email-${variant}`} className="wl-input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} /><p className="wl-help">Only if you&apos;d like launch news by email too.</p>{email && <label className="wl-opt-in"><input type="checkbox" checked={emailOptIn} onChange={(event) => setEmailOptIn(event.target.checked)} /> Also send me launch news by email.</label>}{errors.email && <p className="wl-error" aria-live="polite">{errors.email}</p>}</div>
        </div>
      </div>
      <label className={`wl-consent ${errors.consent ? 'has-error' : ''}`}><input ref={consentRef} type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>{waitlistConsentText(legalEntity)} <a href="/privacy-policy">Privacy Policy</a></span></label>
      {errors.consent && <p className="wl-error" aria-live="polite">{errors.consent}</p>}
      <input className="wl-honeypot" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <Turnstile onToken={setToken} resetKey={turnstileReset} />
      {errors.turnstile && <p className="wl-error" aria-live="polite">{errors.turnstile}</p>}
      <div className="wl-actions"><button type="button" className="wl-back" onClick={() => { setStep(1); setOutcome(null); window.setTimeout(() => phoneRef.current?.focus(), 0) }}><ArrowLeft aria-hidden="true" />Back</button><button type="submit" className="wl-button" disabled={submitting}>{submitting ? 'Joining…' : 'Join the waitlist'}</button></div>
      <p className="wl-secure"><LockKeyhole aria-hidden="true" />Your details are stored securely and used only for Payam&apos;s launch.</p>
    </form>
  )
}

function OutcomeAlert({ outcome }: { outcome: Exclude<Outcome, { kind: 'joined' | 'duplicate' }> }) {
  if (outcome.kind === 'rate') return <div className="wl-alert" role="status"><strong>Too many tries</strong><span>Please wait a minute, then try again.</span></div>
  if (outcome.kind === 'verification') return <div className="wl-alert" role="status"><strong>Security check needed</strong><span>Please complete the security check and try again.</span></div>
  return <div className="wl-alert wl-alert--danger" role="status"><strong>Network wahala</strong><span>{NETWORK_ERROR}</span></div>
}

function DuplicateState({ whatsappNumber }: { whatsappNumber?: string }) {
  const href = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hi Payam, I want to change the city or role on my waitlist signup.')}` : undefined
  return <section className="wl wl-card wl-result" aria-live="polite"><div className="wl-result-icon wl-result-icon--info"><Info aria-hidden="true" /></div><h2>You&apos;re already on the list</h2><p>This number has already joined the Payam waitlist — no need to sign up again. We&apos;ll message you on WhatsApp when we launch in your city.</p>{href && <a className="wl-button wl-button--mint" href={href} target="_blank" rel="noopener noreferrer">Change city or role on WhatsApp</a>}<small>For your privacy we don&apos;t show the details saved for a number.</small></section>
}

function SuccessState({ outcome, phone, whatsappNumber, copied, setCopied }: { outcome: Extract<Outcome, { kind: 'joined' }>; phone: string; whatsappNumber?: string; copied: boolean; setCopied: (value: boolean) => void }) {
  const [count, setCount] = useState(outcome.count)
  const link = `${currentSiteUrl()}/?ref=${outcome.code}`
  const shareText = `I just joined the Payam waitlist — bills, food, market runs, services and rides in one app, with escrow when you buy online. Vote for our city: ${link}`
  useEffect(() => {
    if (!outcome.code) return
    fetch(`/api/waitlist/referrals/${encodeURIComponent(outcome.code)}`, { cache: 'no-store' }).then((response) => response.ok ? response.json() : null).then((body) => { if (typeof body?.count === 'number') setCount(body.count) }).catch(() => undefined)
  }, [outcome.code])
  async function copy() { await navigator.clipboard.writeText(link); setCopied(true); plausible('copy_link'); window.setTimeout(() => setCopied(false), 1800) }
  const confirmHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi Payam, confirming my waitlist signup. Code: ${outcome.code}`)}` : undefined
  return <section className="wl wl-card wl-result" aria-live="polite"><div className="wl-result-icon"><CircleCheckBig aria-hidden="true" /></div><span className="wl-success-pill">E don set</span><h2>You&apos;re on the list.</h2><p>We&apos;ll message you on WhatsApp at <strong>{maskPhone(phone)}</strong> as soon as Payam opens in <strong>{outcome.city}</strong>. No queue numbers — we invite people city by city.</p>{confirmHref && <div className="wl-panel"><span className="wl-panel-number">1</span><div><h3>Confirm your number on WhatsApp</h3><p>Send us one quick message so we know this number is yours. It takes one tap and you can skip it.</p><a className="wl-button wl-button--mint" href={confirmHref} target="_blank" rel="noopener noreferrer">Confirm on WhatsApp</a></div></div>}<div className="wl-panel"><span className="wl-panel-number">2</span><div><h3>Help {outcome.city} open sooner</h3><p>Cities with more sign-ups go live first. Share your link with family, friends and the people you buy from.</p><div className="wl-copy"><span>{link}</span><button type="button" onClick={() => void copy()}>{copied ? 'Copied' : 'Copy link'}</button></div><div className="wl-share"><a className="wl-button" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" onClick={() => plausible('share_whatsapp')}>Share on WhatsApp</a><a className="wl-secondary" href={`https://x.com/intent/post?text=${encodeURIComponent('I just joined the Payam waitlist. Vote for our city:')}&url=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" onClick={() => plausible('share_x')}>Share on X</a></div><p className="wl-referrals">People who joined with your link: <strong>{count}</strong> so far</p></div></div></section>
}
