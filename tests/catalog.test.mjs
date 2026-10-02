import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';

const bundle=await build({entryPoints:[fileURLToPath(new URL('../src/lib/catalog.ts',import.meta.url))],bundle:true,platform:'node',format:'esm',write:false});
const{catalogFiltersFromParams,defaultCatalogFilters,filterCatalog,paginateCatalog,patchCatalogParams,resetCatalogParams}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const categories=['All','Shoes','Clothing','Electronics'];
const product=(id,patch={})=>({id,name:'Everyday sneaker',category:'Shoes',brand:'Evira',description:'',price:5000,originalPrice:7500,stock:10,sold:2000,rating:4.8,image:'',images:[],sizes:[],colors:[],tag:'',reviewCount:0,...patch});

test('combined search, category, dollar price, rating, sold and discount filters select only matching products',()=>{
 const products=[
  product('match'),
  product('wrong-category',{category:'Clothing'}),
  product('too-cheap',{price:1999}),
  product('too-expensive',{price:10001}),
  product('low-rating',{rating:4.4}),
  product('low-sales',{sold:999}),
  product('full-price',{originalPrice:5000}),
  product('wrong-search',{name:'Trail boot',brand:'Other'}),
 ];
 const filters={...defaultCatalogFilters,category:'Shoes',min:20,max:100,rating:4.5,sold:1000,discount:true};
 assert.deepEqual(filterCatalog(products,filters,'  SNEAKER ').map(p=>p.id),['match']);
});

test('legacy new-arrivals URL sorts the full catalog and keeps untagged products',()=>{
 const products=[product('p01'),product('p02',{tag:'New arrival'}),product('p03',{tag:'New arrival'}),product('p04')];
 const filters=catalogFiltersFromParams(new URLSearchParams('view=new'),categories);
 assert.equal(filters.sort,'Newest');
 assert.deepEqual(filterCatalog(products,filters).map(p=>p.id),['p03','p02','p04','p01']);
 assert.deepEqual(products.map(p=>p.id),['p01','p02','p03','p04']);
});

test('catalog pages have twelve distinct products and clamp invalid or stale page requests',()=>{
 const products=Array.from({length:24},(_,i)=>product('p'+String(i+1).padStart(2,'0')));
 const first=paginateCatalog(products,1),second=paginateCatalog(products,2);
 assert.equal(first.items.length,12);
 assert.equal(second.items.length,12);
 assert.equal(second.start,13);
 assert.equal(second.end,24);
 assert.equal(new Set([...first.items,...second.items].map(p=>p.id)).size,24);
 assert.equal(paginateCatalog(products,999).page,2);
 assert.equal(paginateCatalog(products,NaN).page,1);
 assert.equal(paginateCatalog(products,-3).page,1);
 assert.equal(paginateCatalog(products.slice(0,3),2).page,1);
 assert.deepEqual(paginateCatalog([],2),{items:[],page:1,totalPages:1,total:0,start:0,end:0});
});

test('filter and search changes reset pagination while preserving the other URL state',()=>{
 const initial=new URLSearchParams('page=2&category=Shoes&rating=4.5&sold=1000&q=sneaker&promo=EVIRA10');
 const changed=patchCatalogParams(initial,{min:25,discount:true});
 assert.equal(changed.has('page'),false);
 assert.equal(changed.get('category'),'Shoes');
 assert.equal(changed.get('q'),'sneaker');
 assert.equal(changed.get('promo'),'EVIRA10');
 assert.equal(changed.get('discount'),'1');
 const reconstructed=catalogFiltersFromParams(changed,categories);
 assert.equal(reconstructed.min,25);
 assert.equal(reconstructed.rating,4.5);
 assert.equal(reconstructed.sold,1000);
 assert.equal(reconstructed.discount,true);
 const clearedSearch=patchCatalogParams(initial,{q:'  '});
 assert.equal(clearedSearch.has('q'),false);
 assert.equal(clearedSearch.has('page'),false);
 assert.equal(initial.get('page'),'2');
});

test('invalid URL values normalize safely and explicit choices override legacy view aliases',()=>{
 const malformed=catalogFiltersFromParams(new URLSearchParams('category=Unknown&min=-20&max=oops&rating=99&sold=NaN&sort=invalid'),categories);
 assert.equal(malformed.category,'All');
 assert.equal(malformed.min,0);
 assert.equal(malformed.max,2000);
 assert.equal(malformed.rating,5);
 assert.equal(malformed.sold,0);
 assert.equal(malformed.sort,'Popular');
 const newSort=patchCatalogParams(new URLSearchParams('view=new&page=2'),{sort:'Popular'});
 assert.equal(catalogFiltersFromParams(newSort,categories).sort,'Popular');
 const noDiscount=patchCatalogParams(new URLSearchParams('view=discounts&page=2'),{discount:false});
 assert.equal(catalogFiltersFromParams(noDiscount,categories).discount,false);
});

test('resetting the catalog clears filters, search and pagination while preserving an offer code',()=>{
 const reset=resetCatalogParams(new URLSearchParams('category=Shoes&rating=4&sold=1000&q=sneaker&page=2&view=new&discount=1&promo=WELCOME30'));
 assert.equal(reset.toString(),'promo=WELCOME30');
 assert.deepEqual(catalogFiltersFromParams(reset,categories),defaultCatalogFilters);
});
