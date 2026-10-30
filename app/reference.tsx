'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { mountAboutCarousel } from './about-carousel';
import { mountCategoryArch } from './category-arch';
import { mountTestimonials } from './testimonial-carousel';
import { mountSiteMotion } from './site-motion';
import { WaitlistForm } from './waitlist/WaitlistForm';
import { BusinessWaitlistSection } from './waitlist/BusinessWaitlistSection';
import { PayamFooter } from './PayamFooter';
import { PAYAM_LEGAL_ENTITY, PAYAM_WHATSAPP_NUMBER } from './site-config';
export default function Reference({ markup, bodyClass }: { markup: string; bodyClass: string }) {
 const root = useRef<HTMLDivElement>(null);
 const [waitlistSlots, setWaitlistSlots] = useState<HTMLElement[]>([]);
 const [footerSlots, setFooterSlots] = useState<HTMLElement[]>([]);
 useEffect(() => {
  document.body.className = bodyClass;
  setWaitlistSlots(Array.from(root.current?.querySelectorAll<HTMLElement>('[data-waitlist-slot]') ?? []));
  setFooterSlots(Array.from(root.current?.querySelectorAll<HTMLElement>('[data-payam-footer-slot]') ?? []));
  const unmountCarousel = root.current ? mountAboutCarousel(root.current) : () => {};
  const unmountArch = root.current ? mountCategoryArch(root.current) : () => {};
  const unmountTestimonials = root.current ? mountTestimonials(root.current) : () => {};
  const unmountMotion = root.current ? mountSiteMotion(root.current) : () => {};
  function click(event: MouseEvent) {
   const target = (event.target as Element).closest('button');
   if (!target || !root.current?.contains(target)) return;
   if (target.closest('.wl')) return;
   const label = target.getAttribute('aria-label') || '';
   if (label === 'Scroll to top') window.scrollTo({ top:0, behavior:'smooth' });
   if (label === 'Open menu') {
    const old = root.current.querySelector('.reference-menu');
    if (old) { old.remove(); target.setAttribute('aria-expanded','false'); return; }
    const menu = document.createElement('nav'); menu.className='reference-menu'; menu.setAttribute('aria-label','Navigation');
    root.current.querySelectorAll('header a[href]').forEach(a => menu.append(a.cloneNode(true)));
    if (!menu.children.length) menu.innerHTML='<a href="/">Home</a><a href="/deals">Deals</a><a href="/help">Help</a>';
    root.current.append(menu); target.setAttribute('aria-expanded','true');
   }
   const panelId=target.getAttribute('aria-controls');
   if (panelId) {
    const panel=document.getElementById(panelId);
    if(panel) { const open=target.getAttribute('aria-expanded')!=='true'; target.setAttribute('aria-expanded',String(open)); target.dataset.open=String(open); panel.hidden=!open; panel.style.display=open?'block':'none'; }
   }
  }
  document.addEventListener('click',click); return () => { document.removeEventListener('click',click); unmountMotion(); unmountCarousel(); unmountArch(); unmountTestimonials(); };
 },[bodyClass, markup]);
 return <><div ref={root} dangerouslySetInnerHTML={{ __html: markup }} />{waitlistSlots.map((slot) => createPortal(slot.dataset.waitlistSlot === 'business' ? <BusinessWaitlistSection /> : <WaitlistForm variant="hero" legalEntity={PAYAM_LEGAL_ENTITY} whatsappNumber={PAYAM_WHATSAPP_NUMBER} />, slot))}{footerSlots.map((slot) => createPortal(<PayamFooter />, slot))}</>;
}
