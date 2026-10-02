import {Component,useEffect,lazy,Suspense,type ReactNode} from 'react';
import {Routes,Route,Navigate,useLocation,useNavigate} from 'react-router-dom';
import {Toaster} from 'sonner';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {useApp} from '@/lib/store';
import {Shell,Brand} from '@/components/shell';
import {Empty} from '@/components/common';
import {Home,Catalog,ProductDetail,Offers} from '@/pages/shop';






import {registerWebTools} from '@/lib/web-tools';
const Cart=lazy(()=>import('@/pages/checkout').then(module=>({default:module.Cart})));
const Checkout=lazy(()=>import('@/pages/checkout').then(module=>({default:module.Checkout})));
const Orders=lazy(()=>import('@/pages/orders').then(module=>({default:module.Orders})));
const OrderDetails=lazy(()=>import('@/pages/orders').then(module=>({default:module.OrderDetails})));
const TrackOrder=lazy(()=>import('@/pages/orders').then(module=>({default:module.TrackOrder})));
const Receipt=lazy(()=>import('@/pages/orders').then(module=>({default:module.Receipt})));
const Wallet=lazy(()=>import('@/pages/wallet').then(module=>({default:module.Wallet})));
const TransactionDetails=lazy(()=>import('@/pages/wallet').then(module=>({default:module.TransactionDetails})));
const Profile=lazy(()=>import('@/pages/profile').then(module=>({default:module.Profile})));
const EditProfile=lazy(()=>import('@/pages/profile').then(module=>({default:module.EditProfile})));
const Addresses=lazy(()=>import('@/pages/profile').then(module=>({default:module.Addresses})));
const Payments=lazy(()=>import('@/pages/profile').then(module=>({default:module.Payments})));
const NotificationSettings=lazy(()=>import('@/pages/profile').then(module=>({default:module.NotificationSettings})));
const Language=lazy(()=>import('@/pages/profile').then(module=>({default:module.Language})));
const Security=lazy(()=>import('@/pages/profile').then(module=>({default:module.Security})));
const Invite=lazy(()=>import('@/pages/profile').then(module=>({default:module.Invite})));
const Privacy=lazy(()=>import('@/pages/profile').then(module=>({default:module.Privacy})));
const Auth=lazy(()=>import('@/pages/auth').then(module=>({default:module.Auth})));
const Onboarding=lazy(()=>import('@/pages/auth').then(module=>({default:module.Onboarding})));
const ForgotPassword=lazy(()=>import('@/pages/auth').then(module=>({default:module.ForgotPassword})));
const Notifications=lazy(()=>import('@/pages/help').then(module=>({default:module.Notifications})));
const Help=lazy(()=>import('@/pages/help').then(module=>({default:module.Help})));
const Chat=lazy(()=>import('@/pages/help').then(module=>({default:module.Chat})));
const Story=lazy(()=>import('@/pages/story'));
class ErrorBoundary extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return{error:true}}componentDidCatch(e:Error){console.error('Evira view error',e)}render(){return this.state.error?<div className="startup-error"><Brand/><h1>This view could not load</h1><p>Your saved data is still in your account.</p><Button onClick={()=>window.location.reload()}>Reload app</Button></div>:this.props.children}}
function NotFound(){const navigate=useNavigate();return<div className="page"><Empty title="Page not found" description="Let’s get you back to the shop." action={<Button onClick={()=>navigate('/')}>Back to Evira</Button>}/></div>}
function AppRoutes(){return <Routes>
  <Route path="/welcome" element={<Onboarding/>}/><Route path="/story" element={<Story/>}/><Route path="/intro" element={<Navigate to="/story" replace/>}/>
  <Route path="/auth/login" element={<Auth/>}/><Route path="/auth/signup" element={<Auth signup/>}/><Route path="/auth/forgot" element={<ForgotPassword/>}/>
  <Route element={<Shell/>}>
    <Route index element={<Home/>}/><Route path="/catalog" element={<Catalog/>}/><Route path="/search" element={<Catalog search/>}/><Route path="/wishlist" element={<Catalog wishlist/>}/><Route path="/offers" element={<Offers/>}/><Route path="/products/:id" element={<ProductDetail/>}/>
    <Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/orders" element={<Orders/>}/><Route path="/orders/:id" element={<OrderDetails/>}/><Route path="/track/:id" element={<TrackOrder/>}/><Route path="/receipt/:id" element={<Receipt/>}/>
    <Route path="/wallet" element={<Wallet/>}/><Route path="/wallet/transactions/:id" element={<TransactionDetails/>}/><Route path="/profile" element={<Profile/>}/><Route path="/profile/edit" element={<EditProfile/>}/><Route path="/profile/addresses" element={<Addresses/>}/><Route path="/profile/payments" element={<Payments/>}/><Route path="/profile/notifications" element={<NotificationSettings/>}/><Route path="/profile/language" element={<Language/>}/><Route path="/profile/security" element={<Security/>}/><Route path="/profile/invite" element={<Invite/>}/>
    <Route path="/privacy" element={<Privacy/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/help" element={<Help/>}/><Route path="/help/chat" element={<Chat/>}/><Route path="*" element={<NotFound/>}/>
  </Route>
</Routes>}
export function App(){
  const {init,ready,error,theme,onboarded}=useApp(),location=useLocation();
  useEffect(()=>{void init()},[init]);
  useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.style.colorScheme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#161616':'#ffffff')},[theme]);
  useEffect(()=>{if(ready)return registerWebTools()},[ready]);
  const independent=location.pathname==='/welcome'||location.pathname==='/story'||location.pathname==='/intro';
  // Gate before readiness: the shop never flashes behind a first visitor's tour.
  const firstVisit=!onboarded&&!independent;
  return <ErrorBoundary><Toaster theme={theme} position="top-center" richColors/>
    {firstVisit?<Navigate to="/welcome" replace/>:independent||ready?<Suspense fallback={<div className="startup-loading"><Brand/><p>Loading Evira…</p></div>}><AppRoutes/></Suspense>:error?<div className="startup-error"><Brand/><h1>We couldn’t load your shop</h1><p>{error}</p><Button onClick={()=>void init()}>Try again</Button></div>:<div className="startup-loading"><Brand/><div className="startup-skeletons"><Skeleton className="h-40 w-full rounded-3xl"/><div className="grid grid-cols-2 gap-4"><Skeleton className="h-48 rounded-3xl"/><Skeleton className="h-48 rounded-3xl"/></div></div><p>Getting your shop ready…</p></div>}
  </ErrorBoundary>
}
