import {afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';

const bundle=await build({entryPoints:[fileURLToPath(new URL('../src/lib/motion.ts',import.meta.url))],bundle:true,platform:'node',format:'esm',write:false});
const{flyToCart,popSavedHeart,prefersReducedMotion}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const original=Object.fromEntries(['window','document','getComputedStyle'].map(key=>[key,{present:key in globalThis,value:globalThis[key]}]));
afterEach(()=>{for(const[key,{present,value}]of Object.entries(original)){if(present)globalThis[key]=value;else delete globalThis[key]}});

function scene({reduced=false,mobileVisible=false,desktopVisible=true}={}){
 const animations=[],clones=[],listeners=new Set(),tokens={'--ease-in-out':'cubic-bezier(0.77,0,0.175,1)','--ease-spring':'cubic-bezier(0.34,1.56,0.64,1)'};
 const media={matches:reduced,addEventListener:(type,listener)=>listeners.add(listener),removeEventListener:(type,listener)=>listeners.delete(listener)};
 function element(rect,isVisible=true){
  const attributes=new Map();
  const el={isConnected:true,style:{},dataset:{},attributes,getBoundingClientRect:()=>({...rect,right:rect.left+rect.width,bottom:rect.top+rect.height}),getClientRects:()=>isVisible?[rect]:[],setAttribute:(name,value)=>attributes.set(name,value),removeAttribute:name=>attributes.delete(name),remove:()=>{el.isConnected=false},querySelector:()=>null};
  el.animate=(keyframes,options)=>{
   let resolve,reject;const finished=new Promise((yes,no)=>{resolve=yes;reject=no});
   const animation={finished,cancel:()=>{animation.cancelled=true;reject(new Error('cancelled'))},finish:resolve,cancelled:false};
   animations.push({element:el,keyframes,options,animation});return animation;
  };
  return el;
 }
 const image=element({left:80,top:100,width:100,height:120}),mobile=element({left:300,top:700,width:44,height:44},mobileVisible),desktop=element({left:900,top:20,width:44,height:44},desktopVisible),mobileBadge=element({left:325,top:700,width:20,height:20}),desktopBadge=element({left:925,top:20,width:20,height:20});
 mobile.querySelector=()=>mobileBadge;desktop.querySelector=()=>desktopBadge;
 image.cloneNode=()=>{const clone=element(image.getBoundingClientRect());clone.setAttribute('id','product-image');clone.setAttribute('class','product-image');clone.setAttribute('loading','lazy');clones.push(clone);return clone};
 globalThis.window={matchMedia:()=>media,innerWidth:1024,innerHeight:800};
 globalThis.document={documentElement:{},querySelector:selector=>selector.includes('.mobile-nav')?mobile:selector==='.cart-control'?desktop:null,body:{appendChild:el=>{el.isConnected=true;return el}}};
 globalThis.getComputedStyle=el=>({getPropertyValue:token=>tokens[token]??'',transform:el.renderedTransform??'none',padding:'0px',objectFit:'contain',objectPosition:'50% 50%',borderRadius:'12px',visibility:'visible',display:'block'});
 return{image,mobile,mobileBadge,desktop,desktopBadge,animations,clones,listeners,setReduced:value=>{media.matches=value;for(const listener of [...listeners])listener()}};
}

test('cart flight lands at the visible mobile target, removes its inaccessible clone and then bumps its badge',async()=>{
 const state=scene({mobileVisible:true,desktopVisible:false});
 flyToCart(state.image);
 assert.equal(state.clones.length,1);
 const clone=state.clones[0],flight=state.animations[0];
 assert.equal(clone.attributes.get('aria-hidden'),'true');
 assert.equal(clone.alt,'');
 assert.equal(clone.style.pointerEvents,'none');
 assert.equal(clone.style.position,'fixed');
 assert.equal(clone.style.viewTransitionName,'none');
 assert.equal(flight.keyframes.at(-1).transform,'translate(192px,562px) scale(.2)');
 assert.equal(flight.keyframes.at(-1).opacity,0);
 assert.ok(flight.options.duration>=600&&flight.options.duration<=700);
 assert.equal(state.animations.length,1);
 flight.animation.finish();await Promise.resolve();
 assert.equal(clone.isConnected,false);
 assert.equal(state.animations.length,2);
 assert.equal(state.animations[1].element,state.mobileBadge);
 assert.equal(state.animations[1].keyframes[1].transform,'scale(1.25)');
});

test('cart flight uses the desktop target when the mobile navigation is hidden',async()=>{
 const state=scene();
 flyToCart(state.image);
 const flight=state.animations[0];
 assert.equal(flight.keyframes.at(-1).transform,'translate(792px,-118px) scale(.2)');
 flight.animation.finish();await Promise.resolve();
 assert.equal(state.animations[1].element,state.desktopBadge);
});

test('reduced motion and unavailable visible targets never create a cart flight or heart pop',()=>{
 const reduced=scene({reduced:true});
 flyToCart(reduced.image);popSavedHeart(reduced.image);
 assert.equal(reduced.clones.length,0);
 assert.equal(reduced.animations.length,0);
 const unavailable=scene({desktopVisible:false});
 flyToCart(unavailable.image);
 assert.equal(unavailable.clones.length,0);
 assert.equal(unavailable.animations.length,0);
 delete globalThis.window;
 assert.equal(prefersReducedMotion(),true);
 assert.doesNotThrow(()=>flyToCart(unavailable.image));
});

test('enabling reduced motion during a flight removes the clone immediately without bumping the badge',async()=>{
 const state=scene();
 flyToCart(state.image);
 state.setReduced(true);
 assert.equal(state.animations[0].animation.cancelled,true);
 assert.equal(state.clones[0].isConnected,false);
 await Promise.resolve();
 assert.equal(state.animations.length,1);
 assert.equal(state.listeners.size,0);
});

test('a failed browser animation removes the clone without affecting cart feedback',()=>{
 const state=scene(),cloneNode=state.image.cloneNode;
 state.image.cloneNode=()=>{const clone=cloneNode();clone.animate=()=>{throw new Error('Animation unavailable')};return clone};
 assert.doesNotThrow(()=>flyToCart(state.image));
 assert.equal(state.clones.length,1);
 assert.equal(state.clones[0].isConnected,false);
 assert.equal(state.animations.length,0);
 assert.equal(state.listeners.size,0);
});

test('a second cart landing retargets the badge from its current scale',async()=>{
 const state=scene();
 flyToCart(state.image);
 state.animations[0].animation.finish();await Promise.resolve();
 const firstBump=state.animations[1];
 state.desktopBadge.renderedTransform='matrix(1.18, 0, 0, 1.18, 0, 0)';
 flyToCart(state.image);
 state.animations[2].animation.finish();await Promise.resolve();
 const secondBump=state.animations[3];
 assert.equal(firstBump.animation.cancelled,true);
 assert.equal(secondBump.element,state.desktopBadge);
 assert.equal(secondBump.keyframes[0].transform,state.desktopBadge.renderedTransform);
 assert.equal(secondBump.keyframes.at(-1).transform,'scale(1)');
 assert.ok(secondBump.options.duration<=300);
 secondBump.animation.finish();await Promise.resolve();
 assert.equal(state.listeners.size,0);
});

test('repeated saved-heart feedback retargets from its current scale and cancels the previous animation',async()=>{
 const state=scene(),heart=state.image;
 popSavedHeart(heart);
 assert.equal(state.animations[0].keyframes[0].transform,'scale(.9)');
 assert.equal(state.animations[0].keyframes[1].transform,'scale(1.15)');
 assert.ok(state.animations[0].options.duration<=250);
 heart.renderedTransform='matrix(1.08, 0, 0, 1.08, 0, 0)';
 popSavedHeart(heart);
 assert.equal(state.animations[0].animation.cancelled,true);
 assert.equal(state.animations[1].keyframes[0].transform,heart.renderedTransform);
 await Promise.resolve();
 state.animations[1].animation.finish();await Promise.resolve();
 assert.equal(state.listeners.size,0);
});
