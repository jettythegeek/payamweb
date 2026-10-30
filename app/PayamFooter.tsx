import Image from 'next/image'
import Link from 'next/link'
import { ArrowUp, Mail, MapPin, MessageCircle } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { PAYAM_LEGAL_ENTITY, PAYAM_WHATSAPP_NUMBER, SUPPORT_EMAIL } from './site-config'
import { PRIORITY_CITIES } from './waitlist/cities'
import { WaitlistForm } from './waitlist/WaitlistForm'

export function PayamFooter() {
  const whatsappHref = PAYAM_WHATSAPP_NUMBER
    ? `https://wa.me/${PAYAM_WHATSAPP_NUMBER.replace(/\D/g, '')}`
    : null

  return (
    <footer className="pf" aria-label="Payam footer">
      <section className="pf-cta" aria-labelledby="pf-cta-title">
        <span className="pf-cta-orb" aria-hidden="true" />
        <div className="pf-cta-copy">
          <h2 id="pf-cta-title">Want Payam in <strong>your city</strong> first?</h2>
          <p>We&apos;re opening one city at a time. Join with your WhatsApp number and vote — cities with the most sign-ups open first.</p>
          <div className="pf-vote-label"><MapPin aria-hidden="true" />Vote for your city</div>
          <div className="pf-cities">
            {PRIORITY_CITIES.map((city) => (
              <a key={city.slug} href={`/?city=${city.slug}#footer-join`}><MapPin aria-hidden="true" />{city.name}</a>
            ))}
            <a className="pf-other-city" href="/?city=other#footer-join">Other city</a>
          </div>
        </div>
        <div className="pf-cta-form" id="footer-join">
          <WaitlistForm variant="footer" legalEntity={PAYAM_LEGAL_ENTITY} whatsappNumber={PAYAM_WHATSAPP_NUMBER} />
        </div>
      </section>

      <section className="pf-main">
        <div className="pf-grid">
          <div className="pf-brand">
            <Image src="/payam/logo.png" alt="Payam" width={989} height={293} />
            <p>Bills, food, market runs, local help and rides in one app, with escrow when you buy from a seller. Launching city by city across Nigeria.</p>
            {whatsappHref && <a className="pf-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Chat with us on WhatsApp</a>}
          </div>

          <nav className="pf-nav" aria-label="Footer navigation">
            <div><h3>Payam</h3><a href="/#about-payam">About Payam</a><a href="/#how-it-works">How it works</a><a href="/#faq">FAQs</a><a href="/#join">Join the waitlist</a></div>
            <div><h3>For businesses</h3><a href="/?intent=business&role=sell#join">Sell on Payam<small>Vendors, mama put, shops</small></a><a href="/?intent=business&role=serve#join">Offer a service<small>Plumbers, braiders, cleaners</small></a><a href="/?intent=business&role=drive#join">Drive with Payam<small>Keke, taxi, premium</small></a></div>
            <div><h3>Trust</h3><a href="/#about-payam">How escrow protects you</a><Link href="/privacy-policy">Privacy Policy</Link><Link href="/terms-of-service">Terms</Link><a href={`mailto:${SUPPORT_EMAIL}?subject=Report%20a%20problem`}>Report a problem</a></div>
            <div className="pf-contact"><h3>Contact</h3>{whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp<small>Fastest reply</small></a>}<a href={`mailto:${SUPPORT_EMAIL}`}><Mail aria-hidden="true" /><span>{SUPPORT_EMAIL}</span></a><p><MapPin aria-hidden="true" /><span>10 Calabar Street,<br />Aba, Abia State</span></p></div>
          </nav>
        </div>

        <div className="pf-bottom"><span>© 2026 Payam Community Technologies · <svg className="pf-flag" role="img" aria-label="Nigerian flag" viewBox="0 0 3 2"><path fill="#008751" d="M0 0h1v2H0zm2 0h1v2H2z"/><path fill="#fff" d="M1 0h1v2H1z"/></svg>Made in Nigeria</span><div className="pf-bottom-actions"><div className="pf-socials" aria-label="Payam social media"><span role="img" aria-label="X"><FaXTwitter aria-hidden="true" /></span><span role="img" aria-label="Instagram"><FaInstagram aria-hidden="true" /></span><span role="img" aria-label="TikTok"><FaTiktok aria-hidden="true" /></span><span role="img" aria-label="Facebook"><FaFacebookF aria-hidden="true" /></span><span role="img" aria-label="YouTube"><FaYoutube aria-hidden="true" /></span></div><a className="pf-top" href="#top" aria-label="Back to top"><ArrowUp aria-hidden="true" /></a></div></div>
      </section>
    </footer>
  )
}
