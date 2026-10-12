export function mountTestimonials(root: HTMLElement) {
 const viewport = root.querySelector<HTMLElement>('[data-testimonial-viewport]');
 const track = viewport?.querySelector<HTMLElement>('[data-testimonial-track]');
 if (!viewport || !track || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
 const originals = Array.from(track.children) as HTMLElement[];
 const copies = originals.map(card => {
  const copy = card.cloneNode(true) as HTMLElement;
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  track.append(copy);
  return copy;
 });
 let offset = 0, previous = 0, frame = 0, hovered = false, focused = false;
 function tick(now: number) {
  const delta = previous ? Math.min(now - previous, 64) : 0;
  previous = now;
  const distance = copies[0].offsetLeft - originals[0].offsetLeft;
  if (!hovered && !focused && !document.hidden && distance > 0) {
   offset = (offset + delta * 0.025) % distance;
   track!.style.transform = `translateX(${-offset}px)`;
  }
  frame = requestAnimationFrame(tick);
 }
 const enter = () => { hovered = true; };
 const leave = () => { hovered = false; };
 const focus = () => { focused = true; };
 const blur = (event: FocusEvent) => { focused = viewport.contains(event.relatedTarget as Node); };
 viewport.addEventListener('mouseenter', enter);
 viewport.addEventListener('mouseleave', leave);
 viewport.addEventListener('focusin', focus);
 viewport.addEventListener('focusout', blur);
 track.style.willChange = 'transform';
 frame = requestAnimationFrame(tick);
 return () => {
  cancelAnimationFrame(frame);
  copies.forEach(copy => copy.remove());
  track.style.transform = ''; track.style.willChange = '';
  viewport.removeEventListener('mouseenter', enter);
  viewport.removeEventListener('mouseleave', leave);
  viewport.removeEventListener('focusin', focus);
  viewport.removeEventListener('focusout', blur);
 };
}
