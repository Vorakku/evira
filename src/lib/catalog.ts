import type {Category,Product} from './types';

export const catalogSorts=['Popular','Newest','Price: low to high','Price: high to low','Top rated','Most sold'] as const;
export type CatalogSort=(typeof catalogSorts)[number];
export type CatalogFilters={category:Category;min:number;max:number;rating:number;sold:number;discount:boolean;sort:CatalogSort};
export const defaultCatalogFilters:CatalogFilters={category:'All',min:0,max:2000,rating:0,sold:0,discount:false,sort:'Popular'};

function numberParam(params:URLSearchParams,key:string,fallback:number,max=Infinity){
 const raw=params.get(key);
 if(raw===null||raw.trim()==='')return fallback;
 const value=Number(raw);
 return Number.isFinite(value)?Math.max(0,Math.min(max,value)):fallback;
}

export function catalogFiltersFromParams(params:URLSearchParams,allowedCategories:readonly Category[]):CatalogFilters{
 const category=params.get('category') as Category;
 const sort=params.get('sort') as CatalogSort;
 return{
  category:allowedCategories.includes(category)?category:'All',
  min:numberParam(params,'min',0,2000),max:numberParam(params,'max',2000,2000),
  rating:numberParam(params,'rating',0,5),sold:numberParam(params,'sold',0),
  discount:params.get('discount')==='1'||params.get('view')==='discounts',
  sort:catalogSorts.includes(sort)?sort:params.get('view')==='new'?'Newest':'Popular',
 };
}

export function filterCatalog(products:Product[],filters:CatalogFilters,query=''){
 const needle=query.trim().toLowerCase();
 return products.filter(p=>(filters.category==='All'||p.category===filters.category)&&p.price>=filters.min*100&&p.price<=filters.max*100&&p.rating>=filters.rating&&p.sold>=filters.sold&&(!filters.discount||p.originalPrice>p.price)&&(!needle||`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(needle)))
  .sort((a,b)=>{
   switch(filters.sort){
    case 'Newest':return Number(b.tag==='New arrival')-Number(a.tag==='New arrival')||b.id.localeCompare(a.id,undefined,{numeric:true});
    case 'Price: low to high':return a.price-b.price;
    case 'Price: high to low':return b.price-a.price;
    case 'Top rated':return b.rating-a.rating||b.sold-a.sold;
    default:return b.sold-a.sold;
   }
  });
}

export function paginateCatalog<T>(items:T[],requestedPage:number,pageSize=12){
 const size=Math.max(1,Math.floor(Number.isFinite(pageSize)?pageSize:12));
 const totalPages=Math.max(1,Math.ceil(items.length/size));
 const page=Math.max(1,Math.min(totalPages,Number.isFinite(requestedPage)?Math.floor(requestedPage):1));
 const offset=(page-1)*size;
 return{items:items.slice(offset,offset+size),page,totalPages,total:items.length,start:items.length?offset+1:0,end:Math.min(offset+size,items.length)};
}

export function patchCatalogParams(current:URLSearchParams,changes:Partial<CatalogFilters>&{q?:string}){
 const params=new URLSearchParams(current);
 for(const[key,value]of Object.entries(changes)){
  if(key==='discount'){
   if(params.get('view')==='discounts')params.delete('view');
   if(value)params.set('discount','1');else params.delete('discount');
  }else if(key==='q'){
   const query=String(value).trim();
   if(query)params.set('q',query);else params.delete('q');
  }else{
   if(key==='sort'&&params.get('view')==='new')params.delete('view');
   if(value===defaultCatalogFilters[key as keyof CatalogFilters])params.delete(key);
   else params.set(key,String(value));
  }
 }
 params.delete('page');
 return params;
}

export function resetCatalogParams(current:URLSearchParams){
 const params=new URLSearchParams();
 const promo=current.get('promo');
 if(promo)params.set('promo',promo);
 return params;
}
