import {useId,type ReactNode} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {ArrowLeft,Heart,Star,Minus,Plus,ShoppingBag,Check,X,LoaderCircle,Images} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {useApp} from '@/lib/store';
import {useT} from '@/lib/i18n';
import {cn,money} from '@/lib/utils';
import type {Product} from '@/lib/types';
import './common-product.css';
export function IconButton({label,children,className='',...props}:{label:string;children:ReactNode;className?:string}&React.ComponentProps<typeof Button>){return<Button type="button" variant="ghost" size="icon" aria-label={label} title={label} className={cn('icon-button',className)} {...props}>{children}</Button>}
export function Field({label,error,className,...props}:{label:string;error?:string}&React.ComponentProps<typeof Input>){const id=useId();return<div className={cn('field',className)}><Label htmlFor={id}>{label}</Label><Input id={id} aria-invalid={!!error} {...props}/>{error&&<p className="field-error">{error}</p>}</div>}
export function AccentText({text,word}:{text:string;word?:string}){const accent=word??text.match(/\S+$/)?.[0],start=accent?text.lastIndexOf(accent):-1;if(!accent||start<0)return text;return<>{text.slice(0,start)}<span className="accent-serif">{accent}</span>{text.slice(start+accent.length)}</>}
export function Heading({title,back=true,children,accentWord,eyebrow=false}:{title:string;back?:boolean;children?:ReactNode;accentWord?:string;eyebrow?:boolean}){const navigate=useNavigate();const t=useT();return<div className="page-heading">{back&&<IconButton label={t('Back')} onClick={()=>{if(window.history.state?.idx>0)navigate(-1);else navigate('/')}}><ArrowLeft size={22}/></IconButton>}{eyebrow?<p className="heading-eyebrow">{t(title)}</p>:<h1 tabIndex={-1}>{accentWord?<AccentText text={t(title)} word={accentWord}/>:t(title)}</h1>}<div className="heading-actions">{children}</div></div>}
export function Modal({open,onOpenChange,title,description,children,className}:{open:boolean;onOpenChange:(open:boolean)=>void;title:string;description?:string;children:ReactNode;className?:string}){return<Dialog open={open} onOpenChange={onOpenChange}><DialogContent className={cn('evira-dialog',className)}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription className={!description?'sr-only':''}>{description??title}</DialogDescription></DialogHeader>{children}</DialogContent></Dialog>}
export function Empty({title,description,action,icon:Icon=ShoppingBag}:{title:string;description:string;action?:ReactNode;icon?:typeof ShoppingBag}){return<div className="empty-state"><div className="empty-icon"><Icon size={56} strokeWidth={1.2}/></div><h2><AccentText text={title}/></h2><p>{description}</p>{action}</div>}
export function Quantity({quantity,onChange,max=20,disabled=false}:{quantity:number;onChange:(v:number)=>void;max?:number;disabled?:boolean}){return<div className="quantity"><IconButton label="Decrease quantity" disabled={disabled||quantity<=1} onClick={()=>onChange(quantity-1)}><Minus size={16}/></IconButton><span aria-live="polite">{quantity}</span><IconButton label="Increase quantity" disabled={disabled||quantity>=max} onClick={()=>onChange(quantity+1)}><Plus size={16}/></IconButton></div>}
export function ProductCard({item,featured=false,discountBadge=false}:{item:Product;featured?:boolean;discountBadge?:boolean}){
 const wishlist=useApp(s=>s.wishlist??[]),perform=useApp(s=>s.perform),busy=useApp(s=>s.busy);
 const saved=wishlist.includes(item.id),viewCount=item.images.length,discount=discountBadge&&item.originalPrice>item.price&&item.originalPrice>0?Math.round((1-item.price/item.originalPrice)*100):null;
 return<article className={cn('product-card',featured&&'product-card-featured')} data-product-id={item.id}>
  <div className="product-image">
   <Link to={'/products/'+item.id} aria-label={'View '+item.name+(viewCount>1?' — '+viewCount+' product photos':'')}><img src={item.image} alt={item.name} loading="lazy" width="1000" height="1000"/></Link>
   <IconButton label={(saved?'Remove ':'Save ')+item.name+(saved?' from wishlist':' to wishlist')} className={cn('favorite-button',saved&&'saved')} disabled={!!busy} onClick={()=>void perform('/wishlist/'+item.id).catch(()=>{})}><Heart size={19} fill={saved?'currentColor':'none'}/></IconButton>
   {discount!==null?<span className="product-discount-badge" aria-label={discount+'% off'}>−{discount}%</span>:item.tag==='New arrival'&&<span className="product-label">New</span>}
   {viewCount>1&&<span className="product-view-count" aria-hidden="true"><Images size={13}/>{viewCount} views</span>}
  </div>
  <Link className="product-name" to={'/products/'+item.id}>{item.name}</Link>
  <div className="product-meta"><Star size={14} fill="currentColor"/><span>{item.rating.toFixed(1)}</span><span className="meta-divider"/><span className="sold-tag">{item.sold.toLocaleString()} sold</span></div>
  <div className="product-price"><strong>{money(item.price)}</strong>{item.originalPrice>item.price&&<s>{money(item.originalPrice)}</s>}</div>
 </article>
}
export function Status({status}:{status:string}){return<span className={cn('status-badge',status==='delivered'&&'delivered',status==='cancelled'&&'cancelled')}>{({placed:'Placed',processing:'In process',shipped:'Shipped',delivered:'Completed',cancelled:'Cancelled'}as Record<string,string>)[status]??status}</span>}
export function BusyButton({busy,children,...props}:{busy?:boolean}&React.ComponentProps<typeof Button>){return<Button disabled={busy||props.disabled} className="pill-button" {...props}>{busy&&<LoaderCircle size={18} className="animate-spin"/>}{children}</Button>}
export function SuccessIcon(){return<div className="success-icon"><Check size={42} strokeWidth={2.5}/></div>}
export function Choice({selected,children,onClick,disabled=false}:{selected:boolean;children:ReactNode;onClick:()=>void;disabled?:boolean}){return<button type="button" className={cn('choice',selected&&'selected')} aria-pressed={selected} onClick={onClick} disabled={disabled}>{children}</button>}
export function DemoNote({children='Payments, wallet funds and deliveries are simulated. No real money is moved.'}:{children?:ReactNode}){return<p className="demo-note"><span>Demo</span>{children}</p>}
