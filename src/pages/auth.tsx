import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {ArrowLeft,ArrowRight,Eye,EyeOff,Mail,Fingerprint,Apple,ShieldCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Brand} from '@/components/shell';
import {Field,IconButton,Modal,BusyButton,DemoNote,SuccessIcon} from '@/components/common';
import {useApp} from '@/lib/store';
import {api} from '@/lib/api';
import {startAuthentication} from '@simplewebauthn/browser';
import {toast} from 'sonner';
import './welcome-flow.css';

const welcomeSlides=[
 {eyebrow:'A little introduction',title:'Welcome to',emphasis:'Evira.',description:'Your next favorite is closer than you think. Discover everyday pieces with a little more personality.'},
 {eyebrow:'Find your kind of favorite',title:'Good things,',emphasis:'picked for you.',description:'Explore fresh arrivals, well-loved essentials and thoughtful finds across clothing, shoes and more.'},
 {eyebrow:'Make yourself at home',title:'Shop your way.',emphasis:'We’re here for you.',description:'Save the pieces you love, choose what works for you and follow every order from checkout to your door.'},
];

export function Onboarding(){
 const[step,setStep]=useState(0);
 const navigate=useNavigate(),setOnboarded=useApp(s=>s.setOnboarded);
 const slide=welcomeSlides[step];
 const finishTour=()=>{setOnboarded();navigate('/auth/signup',{replace:true})};
 return<div className="onboarding-page welcome-flow">
  <div className="onboarding-toolbar"><Brand staticDisplay/><button className="welcome-skip" onClick={finishTour}>Skip tour <ArrowRight size={15}/></button></div>
  <div className="onboarding-image"><img src="/images/hero.jpg" alt="Fashion portrait"/><div className="onboarding-image-shade"/><span className="welcome-image-caption">Everyday. Your way.</span></div>
  <div className="onboarding-copy">
   <div className="welcome-slide-copy" key={step} aria-live="polite" aria-atomic="true"><span className="welcome-eyebrow">{slide.eyebrow}</span><h1>{slide.title}<br/><strong>{slide.emphasis}</strong></h1><p>{slide.description}</p></div>
   <div className="welcome-progress"><span>{String(step+1).padStart(2,'0')} / {String(welcomeSlides.length).padStart(2,'0')}</span><div className="onboarding-dots" aria-label="Welcome tour pages">{welcomeSlides.map((_,i)=><button key={i} aria-label={'Go to onboarding page '+(i+1)} aria-current={step===i?'step':undefined} className={step===i?'active':''} onClick={()=>setStep(i)}/>)}</div></div>
   <Button className="pill-button" onClick={()=>step<welcomeSlides.length-1?setStep(step+1):finishTour()}>{step<welcomeSlides.length-1?'Next':'Get started'}<ArrowRight size={18}/></Button>
   {step>0&&<Button variant="ghost" onClick={()=>setStep(step-1)}><ArrowLeft size={16}/>Previous</Button>}
   <small className="welcome-account-note">An account is optional. You can skip it next.</small>
  </div>
 </div>
}

export function Auth({signup=false}:{signup?:boolean}){
 const{perform,busy,setOnboarded}=useApp(),navigate=useNavigate();
 const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[show,setShow]=useState(false),[remember,setRemember]=useState(true),[provider,setProvider]=useState<'Google'|'Apple'|'Facebook'|null>(null),[passkeyBusy,setPasskeyBusy]=useState(false);
 const continueAsGuest=()=>{setOnboarded();navigate('/',{replace:true})};
 return<div className="auth-page auth-with-skip">
  <div className="auth-art"><Brand/><img src="/images/hero.jpg" alt="Fashion portrait"/><div><h2>A world of<br/>everyday favorites.</h2><p>Make yourself at home.</p></div></div>
  <div className="auth-content">
   <IconButton label="Back to shop" className="auth-back" onClick={continueAsGuest}><ArrowLeft size={24}/></IconButton>
   <Button variant="ghost" className="auth-skip" onClick={continueAsGuest}>Skip for now <ArrowRight size={16}/></Button>
   <div className="auth-brand"><Brand/></div>
   <div className="auth-card">
    <div className="auth-symbol"><img src="/favicon.svg" alt=""/></div>
    <h1>{signup?'Create your Account':'Login to your Account'}</h1>
    <p className="auth-optional-note">Your account can wait. Browse first if you prefer.</p>
    <form onSubmit={async e=>{e.preventDefault();try{await perform(signup?'/auth/register':'/auth/login','POST',{email,password,rememberMe:remember,...(signup?{name}:{})});setOnboarded();if(signup)navigate('/profile/edit?setup=1');else navigate('/')}catch{}}}>
     {signup&&<Field label="Full name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} required maxLength={80}/>}
     <Field label="Email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
     <div className="password-field"><Field label="Password" type={show?'text':'password'} autoComplete={signup?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={8} maxLength={128} required/><IconButton label={show?'Hide password':'Show password'} onClick={()=>setShow(!show)}>{show?<EyeOff size={19}/>:<Eye size={19}/>}</IconButton></div>
     <label className="checkbox-row"><Checkbox checked={remember} onCheckedChange={v=>setRemember(v===true)}/>Remember me</label>
     {signup&&<p className="auth-terms">By continuing, you agree to our <Link to="/privacy">Privacy Policy</Link>.</p>}
     <BusyButton type="submit" busy={!!busy}>{signup?'Sign up':'Sign in'}</BusyButton>
    </form>
    {!signup&&<Link className="forgot-link" to="/auth/forgot">Forgot the password?</Link>}
    <div className="auth-divider"><span>or continue with</span></div>
    <div className="social-buttons">{(['Facebook','Google','Apple']as const).map(p=><Button key={p} variant="outline" aria-label={'Continue with '+p+' (demo)'} onClick={()=>setProvider(p)}>{p==='Apple'?<Apple size={21}/>:p==='Google'?<span className="google-mark">G</span>:<span className="facebook-mark">f</span>}</Button>)}</div>
    {!signup&&<Button variant="outline" className="passkey-login" disabled={passkeyBusy||!email} onClick={async()=>{if(!window.PublicKeyCredential||!window.isSecureContext){toast.error('Passkey sign-in needs a supported browser on HTTPS or localhost.');return}setPasskeyBusy(true);try{const options=await api('/auth/passkey/options','POST',{email});const response=await startAuthentication({optionsJSON:options.options});await perform('/auth/passkey/verify','POST',{response,challengeId:options.challengeId});setOnboarded();navigate('/')}catch(e){toast.error((e as Error).message)}finally{setPasskeyBusy(false)}}}><Fingerprint size={19}/>{passkeyBusy?'Checking passkey…':'Sign in with a passkey'}</Button>}
    <p className="auth-switch">{signup?'Already have an account?':'Don’t have an account?'} <Link to={signup?'/auth/login':'/auth/signup'}>{signup?'Sign in':'Sign up'}</Link></p>
    <Button variant="ghost" className="auth-guest" onClick={continueAsGuest}>Continue as guest <ArrowRight size={16}/></Button>
   </div>
  </div>
  <Modal open={!!provider} onOpenChange={v=>!v&&setProvider(null)} title={'Continue with '+provider} description="This provider is not connected. You can try the sign-in flow with the demo account."><DemoNote>No {provider} account will be accessed or connected.</DemoNote><BusyButton busy={!!busy} onClick={async()=>{try{await perform('/auth/demo-provider','POST',{provider});setProvider(null);setOnboarded();navigate('/')}catch{}}}>Try {provider} demo sign-in</BusyButton><Button variant="secondary" onClick={()=>setProvider(null)}>Use email instead</Button></Modal>
 </div>
}
export function ForgotPassword(){const{perform,busy}=useApp(),navigate=useNavigate();const[email,setEmail]=useState(''),[method,setMethod]=useState('email'),[challenge,setChallenge]=useState<{challengeId:string;demoCode:string;message:string}|null>(null),[code,setCode]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[success,setSuccess]=useState(false);return<div className="auth-page forgot-page"><div className="auth-content"><IconButton label="Back to sign in" className="auth-back" onClick={()=>navigate('/auth/login')}><ArrowLeft size={24}/></IconButton><Brand/><div className="auth-card"><div className="forgot-illustration"><ShieldCheck size={76} strokeWidth={1.2}/></div><h1>{challenge?'Create New Password':'Forgot Password'}</h1><p>{challenge?'Enter your verification code and a new password.':'Choose how to receive your verification code.'}</p><form onSubmit={async e=>{e.preventDefault();try{if(challenge){if(password!==confirm){toast.error('The passwords do not match.');return}await perform('/auth/reset','POST',{challengeId:challenge.challengeId,code,password});setSuccess(true)}else setChallenge(await perform('/auth/forgot','POST',{email,method}))}catch{}}}>{!challenge?<><Field label="Account email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><div className="selection-list">{[['email','Via email','Demo email delivery'],['sms','Via SMS','Demo SMS delivery']].map(([id,title,sub])=><label className="selection-card" key={id}><span className="selection-icon"><Mail size={23}/></span><span><strong>{title}</strong><small>{sub}</small></span><input type="radio" name="reset-method" checked={method===id} onChange={()=>setMethod(id)}/></label>)}</div></>:<><div className="verification-demo"><b>Demo verification code: {challenge.demoCode}</b><p>{challenge.message}</p><small>Expires in 10 minutes. Never share a real verification code.</small></div><Field label="Verification code" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} required/><Field label="New password" type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/><Field label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={8}/></>}<BusyButton type="submit" busy={!!busy}>{challenge?'Reset password':'Continue'}</BusyButton></form>{challenge&&<Button variant="ghost" onClick={()=>{setChallenge(null);setCode('')}}>Request a new code</Button>}</div></div><Modal open={success} onOpenChange={v=>{if(!v)navigate('/')}} title="Congratulations!" description="Your password was changed successfully."><SuccessIcon/><p className="centered">You’re signed in and ready to shop.</p><Button onClick={()=>navigate('/')}>Continue shopping</Button></Modal></div>}
