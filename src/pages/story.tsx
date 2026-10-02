import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowDown,ArrowUpRight,Pause,Play,ShoppingBag} from 'lucide-react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {Brand} from '@/components/shell';
import {EviraSculpture,StoryCursor,useReducedMotion} from './story-effects';
import './story.css';

gsap.registerPlugin(ScrollTrigger);
const belief='Great style belongs in your everyday. Not just your someday.';
export default function Story(){
  const page=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null),wantsFilm=useRef(true);
  const reduced=useReducedMotion(),[playing,setPlaying]=useState(false),[videoFailed,setVideoFailed]=useState(false);
  useEffect(()=>{document.title='Evira — Wear your own story';window.scrollTo({top:0,behavior:'instant'});return()=>{document.title='Evira — Shop your way'}},[]);
  useEffect(()=>{
    const film=video.current;if(!film)return;
    wantsFilm.current=!reduced;let inView=true;
    const sync=()=>{if(wantsFilm.current&&inView&&!document.hidden)void film.play().catch(()=>setPlaying(false));else film.pause()};
    const observer=new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting??false;sync()},{threshold:.05});observer.observe(film);
    document.addEventListener('visibilitychange',sync);sync();
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);film.pause()};
  },[reduced]);
  useEffect(()=>{
    if(!page.current||reduced)return;
    const context=gsap.context(()=>{
      gsap.from('.story-hero-title span',{yPercent:110,stagger:.13,duration:1.2,ease:'power3.out'});
      gsap.to('.story-hero-media',{yPercent:18,scale:1.12,ease:'none',scrollTrigger:{trigger:'.story-hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.story-hero-content',{y:120,opacity:0,ease:'none',scrollTrigger:{trigger:'.story-hero',start:'30% top',end:'bottom top',scrub:1}});
      gsap.fromTo('.story-belief-word',{opacity:.16},{opacity:1,stagger:.12,ease:'none',scrollTrigger:{trigger:'.story-belief',start:'top 78%',end:'bottom 48%',scrub:.7}});
      gsap.utils.toArray<HTMLElement>('.story-reveal').forEach(element=>gsap.from(element,{y:45,opacity:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:element,start:'top 88%',toggleActions:'play none none reverse'}}));
      gsap.utils.toArray<HTMLElement>('.story-edit-image img').forEach(element=>gsap.to(element,{yPercent:-9,ease:'none',scrollTrigger:{trigger:element.parentElement,start:'top bottom',end:'bottom top',scrub:1}}));
      gsap.to('.story-progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:page.current,start:'top top',end:'bottom bottom',scrub:true}});
    },page);
    return()=>context.revert();
  },[reduced]);
  const toggleFilm=()=>{const film=video.current;if(!film)return;wantsFilm.current=film.paused;if(wantsFilm.current)void film.play().catch(()=>setVideoFailed(true));else film.pause()};
  return <div className="story-page" ref={page}>
    <a href="#story-main" className="skip-link">Skip to story</a>
    <StoryCursor reduced={reduced}/><div className="story-progress" aria-hidden="true"/>
    <header className="story-header"><Brand/><nav aria-label="Evira story navigation"><a href="#our-story">Our story</a><a href="#the-edit">The edit</a><Link to="/" className="story-shop-link">Enter the shop <ArrowUpRight size={17}/></Link></nav></header>
    <main id="story-main">
      <section className="story-hero" aria-labelledby="story-title">
        <div className="story-hero-media"><video ref={video} autoPlay={!reduced} muted loop playsInline preload="metadata" poster="/images/story-poster.jpg" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setVideoFailed(true)} aria-hidden="true"><source src="/videos/evira-story.mp4" type="video/mp4"/></video></div>
        <div className="story-hero-shade"/>
        <div className="story-hero-content"><p className="story-kicker"><i/> A little more you. Every day.</p><h1 id="story-title" className="story-hero-title"><span>Wear your</span><span>own <em>story.</em></span></h1><div className="story-hero-bottom"><a href="#our-story" className="story-scroll"><span><ArrowDown size={22}/></span>Scroll to discover</a><p>Good finds. Great feelings.<br/>An everyday world, curated by Evira.</p></div></div>
        <div className="story-film-bar"><span>EVIRA / THE EVERYDAY EDIT</span>{!videoFailed&&<button onClick={toggleFilm} aria-label={playing?'Pause background film':'Play background film'}>{playing?<Pause size={14}/>:<Play size={14}/>}<span>{playing?'Pause film':'Play film'}</span></button>}</div>
      </section>
      <section className="story-belief" id="our-story"><div className="story-section-label"><span>01 / WHO WE ARE</span><span>A point of view, not a dress code.</span></div><h2>{belief.split(' ').map((word,i)=><span key={i} className="story-belief-word">{word} </span>)}</h2><div className="story-belief-bottom story-reveal"><span className="story-small-mark">e.</span><p>We’re Evira. A home for the pieces that make ordinary days feel like your own. We bring style, useful essentials, and small discoveries together, so finding your next favorite feels effortless.</p></div></section>
      <section className="story-edit" id="the-edit"><div className="story-section-label"><span>02 / WHAT WE DO</span><span>Less searching. More finding.</span></div><div className="story-edit-heading story-reveal"><h2>Your world.<br/><em>Our edit.</em></h2><p>From the shoes by your door to the sound in your headphones. Things to wear, things to carry, things to make your day.</p></div><div className="story-edit-grid"><Link to="/catalog?category=Clothing" className="story-edit-card story-reveal"><div className="story-edit-image story-fashion-image"><img src="/images/hero.jpg" alt="Everyday style in a striped top" loading="lazy"/></div><div><span>01 — WEAR IT YOUR WAY</span><ArrowUpRight size={21}/></div><h3>Personal style. Everyday ease.</h3></Link><Link to="/catalog?category=Shoes" className="story-edit-card story-reveal"><div className="story-edit-image story-product-image"><img src="/images/sneaker-puma.webp" alt="Colorful Puma everyday sneakers" loading="lazy"/></div><div><span>02 — GO SOMEWHERE</span><ArrowUpRight size={21}/></div><h3>A good day starts here.</h3></Link><Link to="/catalog?category=Electronics" className="story-edit-card story-reveal"><div className="story-edit-image story-product-image"><img src="/images/headphones.webp" alt="Over-ear headphones for your daily soundtrack" loading="lazy"/></div><div><span>03 — FIND YOUR RHYTHM</span><ArrowUpRight size={21}/></div><h3>Little upgrades. Big feelings.</h3></Link></div></section>
      <section className="story-method" id="our-process"><div className="story-section-label"><span>03 / HOW WE DO IT</span><span>Thoughtfully picked. Always.</span></div><div className="story-method-layout"><div className="story-model-panel"><EviraSculpture reduced={reduced}/><p>EVERYDAY, ELEVATED.<span>Move your cursor. Change your perspective.</span></p></div><div className="story-method-copy"><h2 className="story-reveal">A better way<br/>to <em>find your thing.</em></h2>{[['01','We start with you.','Real life is a mix of moments. Our edit brings different styles and categories together, with room for your own taste.'],['02','We make discovery simple.','Explore new arrivals, follow the favorites, or find a great deal. Clear filters and honest product details help you choose.'],['03','You make it yours.','A favorite becomes more than a product when it becomes part of your day. Pick your color, find your fit, and write the next chapter.']].map(([number,title,copy])=><article key={number} className="story-method-step story-reveal"><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>
      <section className="story-finale"><p className="story-kicker story-reveal">THE NEXT CHAPTER IS YOURS</p><h2 className="story-reveal">Make it<br/><em>yours.</em></h2><div className="story-finale-links story-reveal"><Link to="/" className="story-primary-link">Explore Evira <ArrowUpRight size={22}/></Link><Link to="/catalog">Shop the whole edit <ShoppingBag size={18}/></Link></div><footer className="story-footer"><Brand/><p>Thoughtfully picked. Everyday favorites.</p><div><Link to="/help">Get in touch</Link><a href="#story-main">Back to top ↑</a></div></footer></section>
    </main>
  </div>;
}
