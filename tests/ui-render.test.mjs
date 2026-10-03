import {after,before,beforeEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter,Routes,Route} from 'react-router-dom';

let views,initialState,renderState;
const previousWindow=globalThis.window;
const product={id:'render-product',name:'The Render Favorite',category:'Shoes',brand:'Evira',description:'An everyday favorite.',price:5000,originalPrice:6000,stock:10,sold:200,rating:4.8,image:'/images/sneaker-puma.webp',images:['/images/sneaker-puma.webp','/images/sneaker-puma-2.webp'],sizes:['40'],colors:['Original'],tag:'New arrival',reviewCount:0};

before(async()=>{
 await mkdir('.sites-runtime',{recursive:true});
 const outfile=resolve('.sites-runtime/ui-render-tests.mjs');
 await build({stdin:{contents:"export {App} from './src/App'; export {Brand} from './src/components/shell'; export {ProductCard} from './src/components/common'; export {default as Story} from './src/pages/story'; export {Home,Catalog,Offers,ProductDetail} from './src/pages/shop'; export {Cart} from './src/pages/checkout'; export {useApp} from './src/lib/store';",resolveDir:process.cwd(),loader:'tsx'},outfile,bundle:true,format:'esm',platform:'node',target:'es2022',external:['react','react/*','react-dom','react-dom/*','react-router-dom'],banner:{js:"import {createRequire} from 'node:module';const require=createRequire(import.meta.url);"},loader:{'.css':'empty'},logLevel:'silent'});
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

function renderProductDetail(){
 return renderToStaticMarkup(createElement(MemoryRouter,{initialEntries:['/products/render-product']},createElement(Routes,null,createElement(Route,{path:'/products/:id',element:createElement(views.ProductDetail)}))));
}

function renderProductCard(item=product){
 return renderToStaticMarkup(createElement(MemoryRouter,null,createElement(views.ProductCard,{item})));
}

function renderCart(){return renderToStaticMarkup(createElement(MemoryRouter,null,createElement(views.Cart)))}

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

test('home presents an editorial hero, accessible category ticker and distinct product collections',()=>{
 setRenderedState({products:catalogProducts()});
 const html=render(views.Home);
 const hero=html.match(/<section\b[^>]*class="home-editorial-hero"[^>]*>([\s\S]*?)<\/section>/)?.[1];
 assert.ok(hero);
 assert.match(hero,/href="\/catalog"/);
 assert.match(hero,/href="\/story"/);
 const heroImage=hero.match(/<img\b[^>]*class="home-hero-image"[^>]*>/)?.[0];
 assert.ok(heroImage);
 assert.match(heroImage,/loading="eager"/);
 assert.match(heroImage,/fetchpriority="high"/i);
 assert.equal((html.match(/<h1\b/g)??[]).length,1);
 assert.match(hero,/<h1\b/);
 const rows=[...html.matchAll(/<section\b[^>]*class="home-product-section(?: [^"]*)?"[^>]*aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
 assert.deepEqual(rows.map(row=>row[1]),['New Arrivals','Discounts']);
 for(const row of rows){
  assert.equal((row[2].match(/<article\b[^>]*class="product-card(?: [^"]*)?"/g)??[]).length,8);
  assert.match(row[2],/<div\b[^>]*class="home-product-row"[^>]*tabindex="0"/);
 }
 const popular=html.match(/<section\b[^>]*class="(?:[^"]* )?home-popular-section(?: [^"]*)?"[^>]*>([\s\S]*?)<\/section>/)?.[1];
 assert.ok(popular);
 assert.match(popular,/class="home-bento-grid(?: [^"]*)?"/);
 assert.equal((popular.match(/<article\b[^>]*class="product-card(?: [^"]*)?"/g)??[]).length,5);
 assert.equal((popular.match(/class="product-card product-card-featured"/g)??[]).length,1);
 const productIds=[...html.matchAll(/data-product-id="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(productIds.length,21);
 assert.equal(new Set(productIds).size,productIds.length);
 const ticker=html.match(/<nav\b[^>]*class="home-category-ticker"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
 assert.ok(ticker);
 const tickerLists=[...ticker.matchAll(/<ul\b([^>]*)>([\s\S]*?)<\/ul>/g)];
 assert.equal(tickerLists.length,2);
 assert.doesNotMatch(tickerLists[0][1],/aria-hidden="true"/);
 assert.match(tickerLists[1][1],/aria-hidden="true"/);
 const duplicateLinks=[...tickerLists[1][2].matchAll(/<a\b[^>]*>/g)];
 assert.equal(duplicateLinks.length,8);
 for(const link of duplicateLinks)assert.match(link[0],/tabindex="-1"/);
 for(const category of ['Clothing','Shoes','Bags','Electronics','Watches','Eyewear','Jewelry','Toys']){
  const links=[...ticker.matchAll(new RegExp('<a\\b[^>]*href="/catalog\\?category='+category+'"[^>]*>','g'))];
  assert.equal(links.length,2);
  assert.equal(links.filter(link=>/tabindex="-1"/.test(link[0])).length,1);
 }
 assert.doesNotMatch(html,/class="category-grid"|class="chip-list category-chips"/);
 setRenderedState({products:catalogProducts(2).map(item=>({...item,tag:''}))});
 const shortHome=render(views.Home),shortIds=[...shortHome.matchAll(/data-product-id="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(shortIds.length,2);
 assert.equal(new Set(shortIds).size,shortIds.length);
 const shortPopular=shortHome.match(/<section\b[^>]*class="(?:[^"]* )?home-popular-section(?: [^"]*)?"[^>]*>([\s\S]*?)<\/section>/)?.[1];
 assert.ok(shortPopular);
 assert.equal((shortPopular.match(/<article\b[^>]*class="product-card(?: [^"]*)?"/g)??[]).length,2);
 assert.equal((shortPopular.match(/class="product-card product-card-featured"/g)??[]).length,1);
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

test('product cards offer an accessible Add to cart button when there is no size to choose and the pictured colour is the default',()=>{
 for(const variants of [{sizes:['40'],colors:['Original']},{sizes:[],colors:[]},{sizes:['40'],colors:[]},{sizes:[],colors:['Original']},{sizes:['One size'],colors:['Original','Black','White']}]){
  const html=renderProductCard({...product,...variants});
  const button=html.match(/<button\b[^>]*class="[^"]*product-quick-add[^"]*"[^>]*>[\s\S]*?<\/button>/)?.[0];
  assert.ok(button);
  assert.match(button,/>Add to cart</);
  assert.match(button,/aria-label="[^"]*The Render Favorite[^"]*"/);
  assert.doesNotMatch(button,/\bdisabled=/);
  assert.doesNotMatch(html,/>Choose options</);
 }
});

test('product cards route size and colour choices to the product page with an accessible name',()=>{
 for(const variants of [{sizes:['40','41'],colors:['Original']},{sizes:['40'],colors:['Black','White']},{sizes:['40','41'],colors:['Original','Black']}]){
  const html=renderProductCard({...product,...variants});
  const link=html.match(/<a\b[^>]*class="[^"]*product-quick-add[^"]*"[^>]*>[\s\S]*?<\/a>/)?.[0];
  assert.ok(link);
  assert.match(link,/>Choose options</);
  assert.match(link,/href="\/products\/render-product"/);
  assert.match(link,/aria-label="[^"]*The Render Favorite[^"]*"/);
  assert.doesNotMatch(html,/>Add to cart</);
 }
});

test('product card quick add respects the shared busy state',()=>{
 setRenderedState({busy:1});
 const button=renderProductCard().match(/<button\b[^>]*class="[^"]*product-quick-add[^"]*"[^>]*>/)?.[0];
 assert.ok(button);
 assert.match(button,/\bdisabled=""/);
 const link=renderProductCard({...product,sizes:['40','41']}).match(/<a\b[^>]*class="[^"]*product-quick-add[^"]*"[^>]*>/)?.[0];
 assert.ok(link);
 assert.match(link,/aria-disabled="true"/);
});

test('home static rendering preserves visible content, readable hero spacing and a distinct story image',()=>{
 setRenderedState({products:catalogProducts()});
 for(const reduced of [false,true]){
  globalThis.window={matchMedia:()=>({matches:reduced})};
  const html=render(views.Home);
  assert.doesNotMatch(html,/data-(?:reveal-ready|home-motion)(?:=|\s|>)/);
  assert.doesNotMatch(html,/style="[^"]*(?:opacity:\s*0(?:;|")|visibility:\s*hidden|clip-path:\s*inset\(0 0 100% 0\))/);
  const heading=html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  assert.ok(heading);
  assert.equal(heading.replace(/<[^>]+>/g,''),'Made for your everyday.');
  const story=html.match(/<section\b[^>]*class="[^"]*home-story-teaser[^"]*"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(story);
  const storyImage=story.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
  assert.ok(storyImage);
  const heroImage=html.match(/<img\b[^>]*class="home-hero-image"[^>]*src="([^"]+)"/)?.[1];
  assert.notEqual(storyImage,heroImage);
  assert.ok(!['/images/hero.jpg','/images/headphones.webp','/images/sneaker-puma.webp'].includes(storyImage));
 }
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

test('offers use the shared real terms and expose code-copy actions',()=>{
 const html=render(views.Offers,'/offers');
 for(const [code,terms] of [['WELCOME30','First order only · Minimum $20 · Up to $50 off'],['EVIRA10','Minimum $50 · Up to $30 off'],['FREESHIP','Standard shipping only · Minimum $100']]){
  assert.match(html,new RegExp(code));assert.match(html,new RegExp(terms.replace(/[$.]/g,'\\$&')));assert.match(html,new RegExp('aria-label="Copy code '+code+'"'));assert.match(html,new RegExp('href="/catalog\\?promo='+code+'"'));
 }
});

test('cart free-shipping hint states the correct remaining amount and qualification',()=>{
 setRenderedState({cart:[{id:'line-low',productId:product.id,size:'40',color:'Original',quantity:1,product}]});
 assert.match(renderCart(),/Add <b>\$50\.00<\/b> more to use <b>FREESHIP<\/b>/);
 setRenderedState({cart:[{id:'line-high',productId:product.id,size:'40',color:'Original',quantity:2,product}]});
 assert.match(renderCart(),/Your order qualifies for <b>FREESHIP<\/b>\. Apply it at checkout\./);
});

test('catalog has a phone filter trigger while its dialog content is absent before opening',()=>{
 const html=render(views.Catalog,'/catalog');
 assert.match(html,/Filters/);
 assert.match(html,/catalog-filter-button/);
 assert.equal((html.match(/aria-label="Product filters"/g)??[]).length,1);
 assert.doesNotMatch(html,/class="[^\"]*catalog-filter-sheet[^\"]*"/);
});

test('product details use the product name as their only main heading',()=>{
 const html=renderProductDetail();
 const headings=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(heading=>heading[1]);
 assert.deepEqual(headings,['The Render Favorite']);
 assert.match(html,/>Shoes</);
});

test('product details keep the seeded rating and label zero real reviews honestly',()=>{
 const html=renderProductDetail();
 const rating=html.match(/<div class="detail-rating">([\s\S]*?)<\/div>/)?.[1];
 assert.ok(rating);
 assert.match(rating,/>4\.8</);
 assert.match(rating,/No reviews yet/);
 assert.doesNotMatch(html,/\(0 reviews\)/);
});
