import {useEffect,useRef,useState} from 'react';

export function useReducedMotion(){
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
  return reduced;
}

export function EviraSculpture({reduced}:{reduced:boolean}){
  const host=useRef<HTMLDivElement>(null);
  const [available,setAvailable]=useState(false);
  useEffect(()=>{
    const element=host.current;if(!element)return;
    let disposed=false,cleanup=()=>{};
    void import('three').then(THREE=>{
      if(disposed)return;
      let renderer:InstanceType<typeof THREE.WebGLRenderer>;
      try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{return}
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,.1,8);
      const shape=new THREE.Shape();
      // A single solid, beveled E. No remote models or fonts are required.
      shape.moveTo(-1.2,-1.65);shape.lineTo(1.2,-1.65);shape.lineTo(1.2,-.98);shape.lineTo(-.43,-.98);shape.lineTo(-.43,-.34);shape.lineTo(.9,-.34);shape.lineTo(.9,.34);shape.lineTo(-.43,.34);shape.lineTo(-.43,.98);shape.lineTo(1.2,.98);shape.lineTo(1.2,1.65);shape.lineTo(-1.2,1.65);shape.closePath();
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.095,bevelThickness:.095});geometry.center();
      const material=new THREE.MeshStandardMaterial({color:0xebe7d9,metalness:.48,roughness:.27});
      const letter=new THREE.Mesh(geometry,material);scene.add(letter);
      scene.add(new THREE.AmbientLight(0xffffff,2));
      const key=new THREE.DirectionalLight(0xffffff,5);key.position.set(-3,4,5);scene.add(key);
      const rim=new THREE.DirectionalLight(0xdbef9e,3);rim.position.set(4,-1,-2);scene.add(rim);
      const fill=new THREE.PointLight(0xffffff,35);fill.position.set(3,1,4);scene.add(fill);
      element.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');setAvailable(true);
      let frame=0,visible=true,pointerX=0,pointerY=0;
      const resize=()=>{const w=element.clientWidth,h=element.clientHeight;renderer.setSize(w,h);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();if(reduced)renderer.render(scene,camera)};
      const observer=new ResizeObserver(resize);observer.observe(element);resize();
      const resume=()=>{if(!reduced&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);else if(reduced&&visible&&!document.hidden)renderer.render(scene,camera)};
      const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(!visible){cancelAnimationFrame(frame);frame=0}else resume()});intersection.observe(element);
      document.addEventListener('visibilitychange',resume);
      const pointer=(event:PointerEvent)=>{const box=element.getBoundingClientRect();pointerX=(event.clientX-box.left)/box.width-.5;pointerY=(event.clientY-box.top)/box.height-.5};
      const reset=()=>{pointerX=0;pointerY=0};
      element.addEventListener('pointermove',pointer);element.addEventListener('pointerleave',reset);
      const draw=()=>{
        frame=0;if(disposed)return;
        if(visible&&!document.hidden){const box=element.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(window.innerHeight-box.top)/(window.innerHeight+box.height)));const y=reduced?-.35:-.65+progress*1.3+pointerX*.65;const x=reduced?.08:pointerY*.3+.12;letter.rotation.y+=(y-letter.rotation.y)*.06;letter.rotation.x+=(x-letter.rotation.x)*.06;letter.rotation.z=-.12;renderer.render(scene,camera)}
        if(!reduced&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
      };
      if(reduced){letter.rotation.set(.08,-.35,-.12);renderer.render(scene,camera)}else draw();
      cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',resume);element.removeEventListener('pointermove',pointer);element.removeEventListener('pointerleave',reset);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove()};
    }).catch(()=>{/* The typographic sculpture remains visible without WebGL. */});
    return()=>{disposed=true;cleanup();setAvailable(false)};
  },[reduced]);
  return <div ref={host} className="story-sculpture" role="img" aria-label="A sculptural three-dimensional Evira letter E"><span className={available?'sculpture-fallback is-rendered':'sculpture-fallback'} aria-hidden="true">E</span></div>;
}

export function StoryCursor({reduced}:{reduced:boolean}){
  const canvas=useRef<HTMLCanvasElement>(null),ring=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(reduced||!window.matchMedia('(pointer: fine) and (min-width: 701px)').matches)return;
    const element=canvas.current,halo=ring.current;if(!element||!halo)return;
    const ctx=element.getContext('2d');if(!ctx)return;
    type Particle={x:number;y:number;vx:number;vy:number;life:number;size:number};
    const particles:Particle[]=[];let x=window.innerWidth*.8,y=window.innerHeight*.6,rx=x,ry=y,frame=0,last=0,seen=false;
    const resize=()=>{const ratio=Math.min(window.devicePixelRatio,1.5);element.width=window.innerWidth*ratio;element.height=window.innerHeight*ratio;ctx.setTransform(ratio,0,0,ratio,0,0)};resize();
    const burst=(count:number)=>{for(let i=0;i<count&&particles.length<70;i++){const angle=Math.random()*Math.PI*2;particles.push({x,y,vx:Math.cos(angle)*(1+Math.random()*3),vy:Math.sin(angle)*(1+Math.random()*3),life:1,size:1+Math.random()*2})}};
    const move=(event:PointerEvent)=>{x=event.clientX;y=event.clientY;seen=true;halo.style.opacity='1';halo.classList.toggle('over-link',!!(event.target as Element).closest('a,button'));if(event.timeStamp-last>45){burst(1);last=event.timeStamp}};
    const scroll=()=>burst(5),click=()=>burst(12),leave=()=>{halo.style.opacity='0'};
    const draw=()=>{ctx.clearRect(0,0,window.innerWidth,window.innerHeight);rx+=(x-rx)*.18;ry+=(y-ry)*.18;halo.style.transform=`translate3d(${rx}px,${ry}px,0)`;if(!document.hidden){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.015;p.life-=.025;if(p.life<=0){particles.splice(i,1);continue}ctx.globalAlpha=p.life*.8;ctx.fillStyle='#dbef9e';ctx.beginPath();ctx.moveTo(p.x,p.y-p.size*2);ctx.lineTo(p.x+p.size*.6,p.y);ctx.lineTo(p.x,p.y+p.size*2);ctx.lineTo(p.x-p.size*.6,p.y);ctx.closePath();ctx.fill()}ctx.globalAlpha=1}if(!seen)halo.style.opacity='0';frame=requestAnimationFrame(draw)};draw();
    window.addEventListener('resize',resize);window.addEventListener('pointermove',move);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('pointerdown',click);document.addEventListener('pointerleave',leave);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('scroll',scroll);window.removeEventListener('pointerdown',click);document.removeEventListener('pointerleave',leave)};
  },[reduced]);
  return <><canvas ref={canvas} className="story-sparkles" aria-hidden="true"/><div ref={ring} className="story-cursor" aria-hidden="true"/></>;
}
