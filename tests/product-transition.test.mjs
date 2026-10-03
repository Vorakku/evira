import {afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

await mkdir('.sites-runtime',{recursive:true});
const outfile=resolve('.sites-runtime/product-transition-tests.mjs');
await build({entryPoints:[fileURLToPath(new URL('../src/lib/product-transition.ts',import.meta.url))],outfile,bundle:true,platform:'node',format:'esm',external:['react','react/*','react-dom','react-dom/*'],logLevel:'silent'});
const{productTransition,productPageReady}=await import(pathToFileURL(outfile).href);
const original=Object.fromEntries(['window','document'].map(key=>[key,{present:key in globalThis,value:globalThis[key]}]));
let current;
afterEach(async()=>{
 for(const transition of current?.transitions??[])transition.finish();
 await Promise.resolve();
 for(const[key,{present,value}]of Object.entries(original)){if(present)globalThis[key]=value;else delete globalThis[key]}
 current=null;
});

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject}}
function click(patch={}){return{button:0,detail:1,defaultPrevented:false,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,preventDefault(){this.defaultPrevented=true},...patch}}
function scene({supported=true,reduced=false,galleryName=''}={}){
 const transitions=[],navigations=[],listeners=new Set(),image={isConnected:true,style:{viewTransitionName:''}},gallery={isConnected:true,style:{viewTransitionName:galleryName}};
 const media={matches:reduced,addEventListener:(type,listener)=>listeners.add(listener),removeEventListener:(type,listener)=>listeners.delete(listener)};
 const startViewTransition=callback=>{
  const update=deferred(),finished=deferred(),ready=deferred();let ran=false;
  const transition={finished:finished.promise,ready:ready.promise,updateCallbackDone:update.promise,skips:0,skipTransition(){this.skips++},finish:finished.resolve,runUpdate(){
   if(!ran){ran=true;Promise.resolve(callback()).then(()=>{update.resolve();ready.resolve()},error=>{update.reject(error);ready.reject(error);finished.reject(error)})}
   return update.promise;
  }};
  transitions.push(transition);return transition;
 };
 globalThis.window={matchMedia:()=>media};
 globalThis.document={querySelector:()=>gallery,...(supported?{startViewTransition}:{})};
 current={image,gallery,transitions,navigations,listeners,navigate:href=>navigations.push(href),setReduced:value=>{media.matches=value;for(const listener of [...listeners])listener()}};
 return current;
}

test('product transitions wait for the matching destination layout before allowing the new snapshot',async()=>{
 const state=scene({galleryName:'gallery-original'}),event=click();
 productTransition(event,state.image,'/products/dress%20one',state.navigate);
 assert.equal(event.defaultPrevented,true);
 assert.equal(state.image.style.viewTransitionName,'product-hero');
 assert.equal(state.gallery.style.viewTransitionName,'none');
 const transition=state.transitions[0],update=transition.runUpdate();let resolved=false;
 void update.then(()=>{resolved=true});
 assert.deepEqual(state.navigations,['/products/dress%20one']);
 await Promise.resolve();
 assert.equal(resolved,false);
 productPageReady('other-product');await Promise.resolve();
 assert.equal(resolved,false);
 assert.equal(state.gallery.style.viewTransitionName,'none');
 productPageReady('dress one');await update;
 assert.equal(resolved,true);
 assert.equal(state.image.style.viewTransitionName,'');
 assert.equal(state.gallery.style.viewTransitionName,'gallery-original');
 transition.finish();await Promise.resolve();
 assert.equal(state.listeners.size,0);
});

test('unsupported browsers and reduced motion leave ordinary link navigation available',()=>{
 for(const options of [{supported:false},{reduced:true}]){
  const state=scene(options),event=click();
  productTransition(event,state.image,'/products/one',state.navigate);
  assert.equal(event.defaultPrevented,false);
  assert.equal(state.transitions.length,0);
  assert.deepEqual(state.navigations,[]);
  assert.equal(state.image.style.viewTransitionName,'');
  assert.equal(state.gallery.style.viewTransitionName,'');
  assert.equal(state.listeners.size,0);
 }
});

test('modified, non-left and already handled clicks preserve their native behavior',()=>{
 const state=scene();
 for(const patch of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1},{button:2},{defaultPrevented:true}]){
  const event=click(patch);
  productTransition(event,state.image,'/products/one',state.navigate);
  assert.equal(event.defaultPrevented,patch.defaultPrevented??false);
 }
 assert.equal(state.transitions.length,0);
 assert.deepEqual(state.navigations,[]);
 assert.equal(state.listeners.size,0);
});

test('keyboard-generated plain clicks receive the same product transition as a pointer click',async()=>{
 const state=scene(),event=click({detail:0});
 productTransition(event,state.image,'/products/keyboard',state.navigate);
 assert.equal(event.defaultPrevented,true);
 const update=state.transitions[0].runUpdate();
 assert.deepEqual(state.navigations,['/products/keyboard']);
 productPageReady('keyboard');await update;
});

test('rapid clicks supersede old snapshots and only the latest destination resolves the active update',async()=>{
 for(const ranFirst of [false,true]){
  const state=scene();
  productTransition(click(),state.image,'/products/one',state.navigate);
  const first=state.transitions[0],firstUpdate=ranFirst?first.runUpdate():null;
  productTransition(click(),state.image,'/products/two',state.navigate);
  const second=state.transitions[1];
  assert.equal(first.skips,1);
  await(firstUpdate??first.runUpdate());
  assert.deepEqual(state.navigations,ranFirst?['/products/one']:[]);
  first.finish();await Promise.resolve();
  assert.equal(state.image.style.viewTransitionName,'product-hero');
  const update=second.runUpdate();let resolved=false;
  void update.then(()=>{resolved=true});
  productPageReady('one');await Promise.resolve();
  assert.equal(resolved,false);
  productPageReady('two');await update;
  assert.deepEqual(state.navigations,ranFirst?['/products/one','/products/two']:['/products/two']);
  assert.equal(state.image.style.viewTransitionName,'');
  second.finish();await Promise.resolve();
  assert.equal(state.listeners.size,0);
 }
});

test('switching to reduced motion releases a pending snapshot and restores image names',async()=>{
 const state=scene(),event=click();
 productTransition(event,state.image,'/products/one',state.navigate);
 const transition=state.transitions[0],update=transition.runUpdate();
 state.setReduced(true);await update;
 assert.equal(transition.skips,1);
 assert.equal(state.image.style.viewTransitionName,'');
 assert.equal(state.gallery.style.viewTransitionName,'');
 assert.equal(state.listeners.size,0);
 assert.deepEqual(state.navigations,['/products/one']);
});

test('native transition setup failure restores names and immediately navigates to the product',()=>{
 const state=scene();
 globalThis.document.startViewTransition=()=>{throw new Error('Transition unavailable')};
 assert.doesNotThrow(()=>productTransition(click(),state.image,'/products/one',state.navigate));
 assert.deepEqual(state.navigations,['/products/one']);
 assert.equal(state.image.style.viewTransitionName,'');
 assert.equal(state.gallery.style.viewTransitionName,'');
 assert.equal(state.listeners.size,0);
});
