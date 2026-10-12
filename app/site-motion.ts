import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function mountSiteMotion(root: HTMLElement) {
 gsap.registerPlugin(ScrollTrigger);
 const media = gsap.matchMedia();
 const listeners: Array<() => void> = [];
 media.add('(prefers-reduced-motion: no-preference)', () => {
  const context = gsap.context(() => {
   const hero = root.querySelector('main > section');
   if (hero) {
    gsap.from(hero.querySelectorAll('h1, h1 + div, img[src*="hero-phone"]'), {
     y: 24, opacity: 0, duration: .85, stagger: .12, ease: 'power2.out', clearProps: 'transform,opacity',
    });
   }
   root.querySelectorAll<HTMLElement>('section').forEach(section => {
    if (section === hero) return;
    const headings = section.querySelectorAll('h2');
    if (headings.length) gsap.from(headings, {
     y: 20, opacity: 0, duration: .7, ease: 'power2.out', clearProps: 'transform,opacity',
     scrollTrigger: { trigger: section, start: 'top 85%', once: true },
    });
   });
   root.querySelectorAll<HTMLElement>('.payam-benefit-icon-large').forEach(icon => {
    const card = icon.parentElement?.parentElement;
    if (card) gsap.from(card, {
     y: 30, opacity: 0, duration: .75, ease: 'power2.out', clearProps: 'transform,opacity',
     scrollTrigger: { trigger: card, start: 'top 88%', once: true },
    });
   });
   const steps = root.querySelectorAll('#how-it-works img');
   if (steps.length) gsap.from(steps, {
    y: 35, opacity: 0, duration: .8, stagger: .16, ease: 'power2.out', clearProps: 'transform,opacity',
    scrollTrigger: { trigger: '#how-it-works', start: 'top 70%', once: true },
   });
   // Keep slider tracks and fixed illustration placements under their own animation controllers.
   root.querySelectorAll<HTMLElement>('a[role="button"], .payam-campaign-button').forEach(button => {
    if (button.getAttribute('href') === '#') return;
    const enter = () => gsap.to(button, { y: -3, duration: .2, ease: 'power2.out', overwrite: 'auto' });
    const leave = () => gsap.to(button, { y: 0, duration: .25, ease: 'power2.out', overwrite: 'auto', clearProps: 'transform' });
    button.addEventListener('mouseenter', enter); button.addEventListener('mouseleave', leave);
    button.addEventListener('focus', enter); button.addEventListener('blur', leave);
    listeners.push(() => {
     button.removeEventListener('mouseenter', enter); button.removeEventListener('mouseleave', leave);
     button.removeEventListener('focus', enter); button.removeEventListener('blur', leave);
     gsap.killTweensOf(button); button.style.removeProperty('transform');
    });
   });
  }, root);
  return () => { listeners.splice(0).forEach(cleanup => cleanup()); context.revert(); };
 });
 return () => media.revert();
}
