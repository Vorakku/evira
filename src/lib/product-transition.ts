import {flushSync} from 'react-dom';
import type {MouseEvent} from 'react';
import type {NavigateFunction} from 'react-router-dom';
import {prefersReducedMotion} from './motion';

type ProductTransition={id:string;image:HTMLImageElement;previousName:string;gallery:HTMLImageElement|null;galleryName:string;transition?:ViewTransition;unsubscribe?:()=>void;resolve?:()=>void;cleaned?:boolean;superseded?:boolean};
let active:ProductTransition|null=null;
function restoreNames(state:ProductTransition){state.image.style.viewTransitionName=state.previousName;if(state.gallery?.isConnected)state.gallery.style.viewTransitionName=state.galleryName}
function cleanUp(state:ProductTransition){if(state.cleaned)return;state.cleaned=true;state.unsubscribe?.();restoreNames(state);state.resolve?.();if(active===state)active=null}
// BrowserRouter schedules route updates; the destination layout effect confirms the new snapshot is ready.
export function productPageReady(id:string|undefined){const state=active;if(state&&state.id===id){restoreNames(state);state.resolve?.()}}
export function productTransition(event:MouseEvent<HTMLAnchorElement>,image:HTMLImageElement|null,href:string,navigate:NavigateFunction){
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!image||typeof document==='undefined'||!document.startViewTransition)return;
 if(active){active.superseded=true;active.transition?.skipTransition();cleanUp(active)}
 if(prefersReducedMotion())return;
 const gallery=document.querySelector<HTMLImageElement>('.detail-page .gallery-main>img'),state:ProductTransition={id:decodeURIComponent(href.split('/').at(-1)!),image,previousName:image.style.viewTransitionName,gallery,galleryName:gallery?.style.viewTransitionName??''};
 event.preventDefault();active=state;if(gallery)gallery.style.viewTransitionName='none';image.style.viewTransitionName='product-hero';
 const media=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>{if(media.matches){state.transition?.skipTransition();cleanUp(state)}};media.addEventListener('change',change);state.unsubscribe=()=>media.removeEventListener('change',change);
 try{state.transition=document.startViewTransition(()=>new Promise<void>(resolve=>{if(state.superseded){resolve();return}state.resolve=resolve;flushSync(()=>navigate(href));if(state.cleaned)resolve()}));void state.transition.finished.then(()=>cleanUp(state),()=>cleanUp(state));void state.transition.ready.catch(()=>{});void state.transition.updateCallbackDone.catch(()=>{})}catch{cleanUp(state);navigate(href)}
}
