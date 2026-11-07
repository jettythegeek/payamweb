import { ArrowUpRight, CarFront, Circle, Store, Wrench } from 'lucide-react'

const audiences = [
  { icon: Store, title: 'Vendors', detail: 'Restaurants, mama put, groceries, shops and online sellers' },
  { icon: Wrench, title: 'Service providers', detail: 'Plumbers, electricians, braiders, cleaners, mechanics' },
  { icon: CarFront, title: 'Drivers', detail: 'Keke, taxi and premium car drivers' },
]

export function BusinessWaitlistSection() {
  return <section id="payam-join-business" className="business-waitlist-section">
    <div className="business-waitlist-panel">
      <div className="business-waitlist-copy">
        <span className="business-waitlist-label">Payam Business</span>
        <h2>Sell, fix or drive? Get ready before your city opens.</h2>
        <p>Payam Business is for vendors, service providers and drivers. You can start once Payam is live in your city — join now and we’ll reach out to set you up before customers arrive.</p>
        <div className="business-waitlist-audiences">
          {audiences.map(({ icon: Icon, title, detail }) => <div className="business-waitlist-audience" key={title}>
            <span className="business-waitlist-icon"><Icon aria-hidden="true" /></span>
            <span><strong>{title}</strong><small>{detail}</small></span>
          </div>)}
        </div>
        <a className="business-waitlist-button" href="/?intent=business#join">Join as a business <ArrowUpRight aria-hidden="true" /></a>
        <p className="business-waitlist-note"><Circle aria-hidden="true" />Same quick form · pick your city and what you do</p>
      </div>
      <div className="business-waitlist-visual">
        <img src="/payam/generated/business-invitation-v2.png" alt="A Nigerian shop owner and an electrician representing vendors and service providers" loading="lazy" width="1536" height="1024" />
      </div>
    </div>
  </section>
}
