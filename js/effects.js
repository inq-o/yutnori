// 화면 연출: 파티클, 도장, 폭죽
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fxEl = document.getElementById("fx");
function burst(node, color, n=14){
  if (reduced || !N[node]) return;
  const [x,y]=N[node], b=document.createElement("div");
  b.className="burst"; b.style.cssText=`left:${x/6}%;top:${y/6}%;--c:${color}`;
  let h="<u></u>";
  for (let i=0;i<n;i++){ const a=i/n*Math.PI*2+Math.random()*.4, r=50+Math.random()*60;
    h+=`<i style="--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px;${i%4===0?"--c:var(--accent)":""}"></i>`; }
  b.innerHTML=h; fxEl.appendChild(b); setTimeout(()=>b.remove(),900);
}
function stamp(text, sub, color){
  fxEl.querySelectorAll(".stamp").forEach(s=>s.remove());
  const s=document.createElement("div"); s.className="stamp"; s.style.setProperty("--c",color);
  s.innerHTML=`<b>${esc(text)}</b>${sub?`<span>${esc(sub)}</span>`:""}`;
  fxEl.appendChild(s); setTimeout(()=>s.remove(),1650);
}
function retrigger(el, cls){ if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(()=>el.classList.remove(cls),900); }
function land(node, team){ retrigger(tokensEl.querySelector(`.tok[data-node="${node}"][data-team="${team}"]`), "land"); }

function confetti(colors){
  if (reduced) return;
  const c=document.createElement("canvas"); c.id="confetti"; document.body.appendChild(c);
  const x=c.getContext("2d"), dpr=devicePixelRatio||1;
  c.width=innerWidth*dpr; c.height=innerHeight*dpr; x.scale(dpr,dpr);
  const P=Array.from({length:180},(_,i)=>({x:innerWidth*(i%2?.15:.85), y:innerHeight*.75, vx:(i%2?1:-1)*(3+Math.random()*9)+(Math.random()-.5)*4,
    vy:-(10+Math.random()*12), r:Math.random()*6.3, vr:(Math.random()-.5)*.4, w:7+Math.random()*7, h:4+Math.random()*5, c:colors[i%colors.length]}));
  const t0=performance.now();
  (function f(now){
    const el=now-t0; x.clearRect(0,0,innerWidth,innerHeight);
    x.globalAlpha=Math.max(0,Math.min(1,(4600-el)/800));
    P.forEach(p=>{ p.vy+=.32; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr;
      x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.scale(1,Math.cos(p.r*2)); x.fillStyle=p.c; x.fillRect(-p.w/2,-p.h/2,p.w,p.h); x.restore(); });
    if (el<4600) requestAnimationFrame(f); else c.remove();
  })(t0);
}
