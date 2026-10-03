const feedback=new WeakMap<Element,Animation>();
export function prefersReducedMotion(){return typeof window==='undefined'||window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function easing(token:string){return getComputedStyle(document.documentElement).getPropertyValue(token).trim()}
function onMotionChange(cancel:()=>void){const media=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>{if(media.matches)cancel()};media.addEventListener('change',change);return()=>media.removeEventListener('change',change)}
function pop(element:HTMLElement|SVGSVGElement|null,peak:number,duration:number,initial='scale(1)'){
 if(!element?.isConnected||prefersReducedMotion()||typeof element.animate!=='function')return;
 const previous=feedback.get(element),start=previous?getComputedStyle(element).transform:initial;previous?.cancel();
 const animation=element.animate([{transform:start==='none'?'scale(1)':start},{transform:`scale(${peak})`,offset:.45},{transform:'scale(1)'}],{duration,easing:easing('--ease-spring')});feedback.set(element,animation);
 const unsubscribe=onMotionChange(()=>animation.cancel()),finish=()=>{unsubscribe();if(feedback.get(element)===animation)feedback.delete(element)};void animation.finished.then(finish,finish);
}
export function popSavedHeart(icon:SVGSVGElement|null){pop(icon,1.15,240,'scale(.9)')}
function visible(element:HTMLElement|null):element is HTMLElement{
 if(!element?.isConnected||!element.getClientRects().length)return false;
 const rect=element.getBoundingClientRect(),style=getComputedStyle(element);return rect.width>0&&rect.height>0&&rect.bottom>0&&rect.right>0&&rect.top<window.innerHeight&&rect.left<window.innerWidth&&style.visibility!=='hidden'&&style.display!=='none';
}
export function flyToCart(img:HTMLImageElement|null){
 if(!img||prefersReducedMotion()||typeof img.animate!=='function'||!visible(img))return;
 const mobile=document.querySelector<HTMLElement>('.mobile-nav [data-cart-target]'),desktop=document.querySelector<HTMLElement>('.cart-control'),target=visible(mobile)?mobile:visible(desktop)?desktop:null;if(!target)return;
 const source=img.getBoundingClientRect(),destination=target.getBoundingClientRect(),style=getComputedStyle(img),clone=img.cloneNode(false) as HTMLImageElement;
 clone.removeAttribute('id');clone.removeAttribute('class');clone.removeAttribute('loading');clone.alt='';clone.setAttribute('aria-hidden','true');clone.dataset.cartFly='';
 Object.assign(clone.style,{position:'fixed',left:source.left+'px',top:source.top+'px',width:source.width+'px',height:source.height+'px',maxWidth:'none',margin:'0',padding:style.padding,objectFit:style.objectFit,objectPosition:style.objectPosition,borderRadius:style.borderRadius,transformOrigin:'center',pointerEvents:'none',zIndex:'100',viewTransitionName:'none'});
 document.body.appendChild(clone);
 const x=destination.left+destination.width/2-source.left-source.width/2,y=destination.top+destination.height/2-source.top-source.height/2;
 let animation:Animation;
 try{animation=clone.animate([{transform:'translate(0,0) scale(1)',opacity:.9},{transform:`translate(${x}px,${y}px) scale(.2)`,opacity:0}],{duration:650,easing:easing('--ease-in-out')})}catch{clone.remove();return}
 const unsubscribe=onMotionChange(()=>{animation.cancel();clone.remove()}),finish=()=>{unsubscribe();clone.remove()};
 void animation.finished.then(()=>{finish();if(visible(target))pop(target.querySelector<HTMLElement>('.count-badge'),1.25,300)},finish);
}
