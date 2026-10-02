import {after,before,beforeEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';

let views,initialState,renderState;
const previousWindow=globalThis.window;
const product={id:'render-product',name:'The Render Favorite',category:'Shoes',brand:'Evira',description:'An everyday favorite.',price:5000,originalPrice:6000,stock:10,sold:200,rating:4.8,image:'/images/sneaker-puma.webp',images:['/images/sneaker-puma.webp','/images/sneaker-puma-2.webp'],sizes:['40'],colors:['Original'],tag:'New arrival',reviewCount:0};

before(async()=>{
 await mkdir('.sites-runtime',{recursive:true});
 const outfile=resolve('.sites-runtime/ui-render-tests.mjs');
 await build({stdin:{contents:"export {App} from './src/App'; export {Brand} from './src/components/shell'; export {default as Story} from './src/pages/story'; export {Home,Catalog} from './src/pages/shop'; export {useApp} from './src/lib/store';",resolveDir:process.cwd(),loader:'tsx'},outfile,bundle:true,format:'esm',platform:'node',target:'es2022',external:['react','react/*','react-dom','react-dom/*','react-router-dom'],banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"},loader:{'.css':'empty'},logLevel:'silent'});
 // Import with no DOM; effects remain unexecuted in these server-render checks.
 views=await import(pathToFileURL(outfile).href);
 renderState=views.useApp.getInitialState();
 initialState={...renderState};
});

beforeEach(()=>{
 globalThis.window={matchMedia:()=>({matches:false})};
 setRenderedState({...initialState,products:[product],user:{id:'render-user',name:'Render Shopper',avatar:'',guest:true,settings:{}},cart:[],wishlist:[],notifications:[],orders:[],ready:false,error:'',onboarded:false});
});

after(()=>{
 if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
});

function render(Component,path='/'){
 return renderToStaticMarkup(createElement(MemoryRouter,{initialEntries:[path]},createElement(Component)));
}

function setRenderedState(state){
 // Zustand uses its initial snapshot during server rendering.
 Object.assign(renderState,state);
 views.useApp.setState(state);
}

test('a first visitor never receives shop markup before or after API readiness',()=>{
 for(const ready of [false,true]){
  setRenderedState({ready,onboarded:false});
  const html=render(views.App);
  assert.doesNotMatch(html,/The Render Favorite/);
  assert.doesNotMatch(html,/class="app-shell"/);
 }
});

test('a returning visitor can render the shop after API readiness',()=>{
 setRenderedState({ready:true,onboarded:true});
 const html=render(views.App);
 assert.match(html,/The Render Favorite/);
 assert.match(html,/class="app-shell"/);
});

test('the Evira logo opens the introduction page',()=>{
 const html=render(views.Brand);
 assert.match(html,/href="\/story"/);
 assert.match(html,/aria-label="Evira story"/);
});

test('the introduction presents each story chapter and routes visitors to the shop',()=>{
 const html=render(views.Story,'/story');
 for(const chapter of ['WHO WE ARE','WHAT WE DO','HOW WE DO IT'])assert.ok(html.includes(chapter));
 assert.match(html,/href="\/catalog"/);
 assert.match(html,/href="\/"/);
 assert.match(html,/<video[^>]*autoPlay=""/i);
});

test('reduced-motion visitors receive a paused introduction film and a visible sculpture fallback',()=>{
 globalThis.window={matchMedia:()=>({matches:true})};
 const html=render(views.Story,'/story');
 assert.doesNotMatch(html,/<video[^>]*autoPlay/i);
 assert.match(html,/class="sculpture-fallback"/);
 assert.match(html,/sculptural three-dimensional Evira letter E/);
});

function catalogProducts(count=27){
 return Array.from({length:count},(_,index)=>({...product,id:'render-'+String(index+1).padStart(2,'0'),name:'Render Favorite '+String(index+1).padStart(2,'0'),sold:30000-index*100,tag:'New arrival'}));
}

test('home presents three scrollable collections with no more than ten products apiece',()=>{
 setRenderedState({products:catalogProducts()});
 const html=render(views.Home);
 const rows=[...html.matchAll(/<section class="home-product-section" aria-label="([^"]+)">([\s\S]*?)<\/section>/g)];
 assert.deepEqual(rows.map(row=>row[1]),['New Arrivals','Most Popular','Discounts']);
 for(const row of rows){
  assert.equal((row[2].match(/class="product-card"/g)??[]).length,10);
  assert.match(row[2],/tabindex="0"/);
 }
 assert.doesNotMatch(html,/class="category-grid"|class="chip-list category-chips"/);
});

test('catalog URLs render the requested page and clamp pages beyond the available results',()=>{
 setRenderedState({products:catalogProducts()});
 const secondPage=render(views.Catalog,'/catalog?page=2');
 assert.equal((secondPage.match(/class="product-card"/g)??[]).length,12);
 assert.match(secondPage,/Render Favorite 13/);
 assert.match(secondPage,/Render Favorite 24/);
 assert.doesNotMatch(secondPage,/Render Favorite 12|Render Favorite 25/);
 const lastPage=render(views.Catalog,'/catalog?page=999');
 assert.equal((lastPage.match(/class="product-card"/g)??[]).length,3);
 assert.match(lastPage,/Render Favorite 25/);
 assert.match(lastPage,/Render Favorite 27/);
});

test('catalog combines category, sold and discount filters while keeping controls visible',()=>{
 setRenderedState({products:[
  {...product,id:'match',name:'Matching Favorite',sold:6000},
  {...product,id:'low-sales',name:'Too Few Sales',sold:400},
  {...product,id:'full-price',name:'Full Price Favorite',sold:6000,originalPrice:product.price},
  {...product,id:'other-category',name:'Other Category Favorite',category:'Bags',sold:6000},
 ]});
 const html=render(views.Catalog,'/catalog?category=Shoes&sold=5000&discount=1');
 assert.match(html,/Matching Favorite/);
 assert.doesNotMatch(html,/Too Few Sales|Full Price Favorite|Other Category Favorite/);
 assert.match(html,/<aside[^>]*aria-label="Product filters"/);
 assert.match(html,/Minimum products sold/);
 assert.match(html,/Discounted only/);
});
