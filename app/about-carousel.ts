export function mountAboutCarousel(root: HTMLElement): () => void {
 const cleanups=Array.from(root.querySelectorAll<HTMLElement>('[data-about-carousel]')).map(mountOne);
 return () => cleanups.forEach(cleanup=>cleanup());
}
function mountOne(host: HTMLElement): () => void {
 const track = host.querySelector<HTMLElement>('.payam-about-track')!;
 const viewport = host.querySelector<HTMLElement>('.payam-about-viewport')!;
 const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
 let index=0, busy=false, hovered=false, focused=false, startY=0;
 let reset: ReturnType<typeof setTimeout> | undefined;
 function paint(animate: boolean) {
  track.style.transition=animate && !motion.matches ? 'transform 650ms cubic-bezier(.22,.68,0,1)' : 'none';
  track.style.transform=`translateY(-${(index+1)*180}px)`;
 }
 function move(direction: number) {
  if(busy) return;
  busy=true;index+=direction;paint(true);
  reset=setTimeout(()=>{ if(index===5) index=0; if(index===-1) index=4;paint(false);busy=false; },motion.matches?0:680);
 }
 const enter=()=>{hovered=true;};const leave=()=>{hovered=false;};
 const focus=()=>{focused=true;};const blur=(event: FocusEvent)=>{focused=host.contains(event.relatedTarget as Node);};
 const down=(event: PointerEvent)=>{startY=event.clientY;viewport.setPointerCapture(event.pointerId);};
 const up=(event: PointerEvent)=>{const distance=event.clientY-startY;if(Math.abs(distance)>30)move(distance<0?1:-1);};
 const key=(event: KeyboardEvent)=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();move(event.key==='ArrowDown'?1:-1);}};
 host.addEventListener('mouseenter',enter);host.addEventListener('mouseleave',leave);
 host.addEventListener('focusin',focus);host.addEventListener('focusout',blur);
 viewport.addEventListener('pointerdown',down);viewport.addEventListener('pointerup',up);viewport.addEventListener('keydown',key);
 paint(false);
 const interval=setInterval(()=>{const bounds=host.getBoundingClientRect();if(!motion.matches&&!hovered&&!focused&&!document.hidden&&bounds.bottom>0&&bounds.top<window.innerHeight)move(1);},4000);
 return ()=>{clearInterval(interval);clearTimeout(reset);host.removeEventListener('mouseenter',enter);host.removeEventListener('mouseleave',leave);host.removeEventListener('focusin',focus);host.removeEventListener('focusout',blur);viewport.removeEventListener('pointerdown',down);viewport.removeEventListener('pointerup',up);viewport.removeEventListener('keydown',key);};
}
