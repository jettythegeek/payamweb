export function mountCategoryArch(root: HTMLElement): () => void {
 const arch=root.querySelector<HTMLElement>('[data-category-arch]');
 if(!arch) return ()=>{};
 const tiles=Array.from(arch.querySelectorAll<HTMLElement>('.payam-arch-tile'));
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let width=arch.clientWidth,height=arch.clientHeight,phase=0,last=0,frame=0,visible=true;
 function draw() {
  const size=motion.matches?width/8:height*.66;
  const stride=size*.84,span=stride*tiles.length;
  tiles.forEach((tile,i)=>{
   const x=motion.matches?i*size:((i*stride+phase*span)%span)-size*1.15;
   const centre=x+size/2;
   const curve=(centre-width/2)/(width/2);
   const y=height*.015+height*.27*curve*curve;
   const edge=Math.min(centre,width-centre);
   const t=motion.matches?1:Math.max(0,Math.min(1,edge/(size*.8)));
   const fade=t*t*(3-2*t);
   tile.style.opacity=String(fade);
   tile.style.width=`${size}px`;tile.style.height=`${size}px`;
   tile.style.transform=`translate3d(${x}px,${y}px,0) rotate(${Math.max(-12,Math.min(12,curve*9))}deg) scale(${.92+.08*fade})`;
   tile.style.zIndex=String(10-Math.round(Math.abs(curve)*2));
  });
 }
 function tick(time:number) {
  const delta=last?Math.min((time-last)/1000,.1):0;last=time;
  if(visible&&!document.hidden&&!motion.matches)phase=(phase+delta/32)%1;
  if(visible)draw();
  frame=requestAnimationFrame(tick);
 }
 const resize=new ResizeObserver(()=>{width=arch.clientWidth;height=arch.clientHeight;draw();});resize.observe(arch);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});intersection.observe(arch);
 const change=()=>draw();motion.addEventListener('change',change);
 draw();frame=requestAnimationFrame(tick);
 return ()=>{cancelAnimationFrame(frame);resize.disconnect();intersection.disconnect();motion.removeEventListener('change',change);};
}
