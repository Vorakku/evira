import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { catalog } from './catalog';
export type Env={DB:D1Database;BUCKET:R2Bucket;ASSETS?:Fetcher;APP_MODE?:string};
// Workers isolate I/O by request; sharing a client also shares request-bound promises.
export function database(env:Env){return new PrismaClient({adapter:new PrismaD1(env.DB)})}
export async function seedCatalog(env:Env){
 const db=database(env);
 if(await db.product.count()){
  // Upgrade the original demo galleries without resetting inventory or custom photos.
  const galleries=catalog.filter(p=>JSON.parse(p.images).length>1);
  await env.DB.batch(galleries.map(p=>env.DB.prepare('UPDATE "Product" SET "images"=? WHERE "id"=? AND "image"=? AND "images" IN (?,?,?)').bind(p.images,p.id,p.image,JSON.stringify([p.image]),'[]','')));
  return;
 }
 await env.DB.batch(catalog.map(p=>env.DB.prepare('INSERT OR IGNORE INTO "Product" ("id","name","category","brand","description","price","originalPrice","stock","sold","rating","image","images","sizes","colors","tag","createdAt") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.id,p.name,p.category,p.brand,p.description,p.price,p.originalPrice,p.stock,p.sold,p.rating,p.image,p.images,p.sizes,p.colors,p.tag,new Date().toISOString())));
}
export const parse=(value:string|null|undefined,fallback:unknown=[]):any=>{try{return JSON.parse(value??'')}catch{return fallback}};
export const product=(p:any)=>({...p,images:parse(p.images),sizes:parse(p.sizes),colors:parse(p.colors),reviewCount:p._count?.reviews??0,_count:undefined});
export const order=(o:any)=>({...o,items:parse(o.items),address:parse(o.address,{}),events:parse(o.events)});
export function publicUser(u:any,passkeys=0){const {passwordHash,pinHash,cartVersion,createdAt,...rest}=u;return{...rest,hasPin:Boolean(pinHash),hasPasskey:passkeys>0,settings:parse(u.settings,{})}}
