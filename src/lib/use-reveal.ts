import {useEffect,useRef} from 'react';

export function useReveal(content:unknown){
 const root=useRef<HTMLDivElement>(null),refresh=useRef<()=>void>(()=>{});
 useEffect(()=>{
  const page=root.current;if(!page)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(!motion.matches)page.dataset.homeMotion='true';
  let observer:IntersectionObserver|null=null;
  // A fully clipped heading never reports as intersecting, so headings are watched through their unclipped parent.
  const watched=new Map<Element,HTMLElement>(),target=(element:HTMLElement)=>element.dataset.reveal==='heading'&&element.parentElement||element;
  const reveal=(element:HTMLElement)=>{element.dataset.revealed='true';observer?.unobserve(target(element))};
  const enhance=()=>{
   page.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach(group=>group.querySelectorAll<HTMLElement>('.product-card').forEach((card,i)=>{card.dataset.reveal='card';card.style.setProperty('--i',String(Math.min(i,5)))}));
   const elements=page.querySelectorAll<HTMLElement>('[data-reveal]');
   if(motion.matches||typeof IntersectionObserver==='undefined'){
    observer?.disconnect();page.removeAttribute('data-reveal-ready');elements.forEach(reveal);return;
   }
   observer??=new IntersectionObserver(entries=>entries.forEach(entry=>{const element=watched.get(entry.target);if(element&&entry.isIntersecting&&entry.intersectionRatio>=.15)reveal(element)}),{threshold:.15,rootMargin:'0px 0px -10% 0px'});
   elements.forEach(element=>{
    if(element.dataset.revealed)return;
    const rect=element.getBoundingClientRect();
    if(rect.bottom>0&&rect.top<window.innerHeight&&rect.right>0&&rect.left<window.innerWidth)reveal(element);
    else{watched.set(target(element),element);observer?.observe(target(element))}
   });
   page.dataset.revealReady='true';
  };
  const preferenceChanged=()=>{if(motion.matches)page.removeAttribute('data-home-motion');enhance()};
  const focused=(event:FocusEvent)=>{const element=event.target instanceof Element?event.target.closest<HTMLElement>('[data-reveal]'):null;if(element&&page.contains(element)){element.dataset.revealImmediate='true';reveal(element)}};
  refresh.current=enhance;enhance();
  motion.addEventListener('change',preferenceChanged);page.addEventListener('focusin',focused);
  return()=>{observer?.disconnect();refresh.current=()=>{};motion.removeEventListener('change',preferenceChanged);page.removeEventListener('focusin',focused);page.removeAttribute('data-reveal-ready');page.removeAttribute('data-home-motion')};
 },[]);
 useEffect(()=>refresh.current(),[content]);
 return root;
}
