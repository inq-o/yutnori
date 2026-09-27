// 드래그로 말 옮기기, 잡기/업기/골인/우승 판정
let drag = null;
document.addEventListener("pointerdown", e=>{
  const tok = e.target.closest(".tok"); if (!tok || drag) return;
  e.preventDefault();
  const team = +tok.dataset.team;
  let ids;
  if (tok.dataset.node) ids = state.pieces.filter(p=>p.team===team && p.loc===tok.dataset.node).map(p=>p.id);
  else ids = [tok.dataset.home];
  const r = tok.getBoundingClientRect(), size = Math.max(r.width, board.clientWidth*0.08);
  const g = document.createElement("div");
  g.className = "tok ghost"; g.style.cssText = `--c:${state.teams[team].color};--ts:${size}px;margin:0;width:${size}px;height:${size}px`;
  g.innerHTML = tok.innerHTML; document.body.appendChild(g);
  tok.classList.add("hidden");
  drag = {ids, team, g, size, src:tok, from: tok.dataset.node || "home"};
  moveGhost(e);
});
document.addEventListener("pointermove", e=>{ if (drag){ e.preventDefault(); moveGhost(e); } }, {passive:false});
document.addEventListener("pointerup", e=>{ if (drag) drop(e); });
document.addEventListener("pointercancel", ()=>{ if (drag){ cleanup(); render(); } });

function boardPoint(e){
  const r = svg.getBoundingClientRect();
  if (e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) return null;
  return [(e.clientX-r.left)/r.width*600, (e.clientY-r.top)/r.height*600];
}
function nearest(pt){
  let best=null, bd=48;
  for (const [id,[x,y]] of Object.entries(N)){ const d=Math.hypot(pt[0]-x,pt[1]-y); if (d<bd){bd=d;best=id;} }
  return best;
}
function inside(el,e){ const r=el.getBoundingClientRect(); return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom; }
function moveGhost(e){
  drag.g.style.left = (e.clientX - drag.size/2)+"px"; drag.g.style.top = (e.clientY - drag.size/2)+"px";
  const pt = boardPoint(e), n = pt && nearest(pt);
  svg.querySelectorAll(".nd.hot").forEach(c=>c.classList.remove("hot"));
  if (n) svg.querySelector(`[data-n="${n}"]`)?.classList.add("hot");
  goalEl.classList.toggle("over", inside(goalEl,e));
  document.querySelectorAll("[data-team-card]").forEach(c=>c.classList.toggle("over", inside(c,e)));
}
function cleanup(){
  drag.g.remove(); drag=null;
  svg.querySelectorAll(".nd.hot").forEach(c=>c.classList.remove("hot"));
  goalEl.classList.remove("over"); document.querySelectorAll(".team.over").forEach(c=>c.classList.remove("over"));
}
function drop(e){
  const {ids, team, from} = drag;
  const pt = boardPoint(e), n = pt && nearest(pt);
  let target = null;
  if (n) target = n;
  else if (inside(goalEl,e)) target = "done";
  else if ([...document.querySelectorAll("[data-team-card]")].some(c=>inside(c,e))) target = "home";
  cleanup();
  if (!target || target===from){ render(); return; }
  snapshot();
  const moving = state.pieces.filter(p=>ids.includes(p.id));
  moving.forEach(p=>p.loc=target);
  const tm = state.teams[team];
  let fx = null, caught = [];
  if (N[target] && state.autoCapture){
    caught = state.pieces.filter(p=>p.loc===target && p.team!==team);
    caught.forEach(p=>p.loc="home");
    const stack = state.pieces.filter(p=>p.loc===target && p.team===team).length;
    if (caught.length) fx = "capture";
    else if (stack>moving.length) fx = "stack";
  }
  if (target==="done") fx = "goal";
  render();
  if (checkWinner()) return;
  if (fx==="capture"){
    SFX.capture(); burst(target, tm.color, 10); land(target, team); retrigger(board, "shake");
    stamp("잡았다!", `${tm.name} 한 번 더`, tm.color);
  } /*else if (fx==="stack"){
    const stack = state.pieces.filter(p=>p.loc===target && p.team===team).length;
    SFX.stack(); burst(target, tm.color, 10); land(target, team);
    stamp("업었다!", `${tm.name} ${stack}동`, tm.color);
  }*/ else if (fx==="goal"){
    SFX.goal(); retrigger(goalEl, "pulse");
    const d = state.pieces.filter(p=>p.team===team && p.loc==="done").length;
    stamp("골인!", `${tm.name} ${d}/${state.perTeam}`, tm.color);
  } else if (target==="home"){
    SFX.home(); if (from!=="home") toast(`${tm.name} 말을 대기로 돌렸어요`);
  } else {
    SFX.place(); land(target, team);
  }
}

function checkWinner(){
  if (state.winner!=null) return;
  const t = state.teams.findIndex((_,i)=>state.pieces.filter(p=>p.team===i).every(p=>p.loc==="done"));
  if (t<0) return false;
  state.winner = t; state.turn = t; render();
  const tm = state.teams[t];
  const b=document.createElement("div"); b.className="banner";
  b.innerHTML=`<div style="--c:${tm.color}"><b style="color:${tm.color}">${esc(tm.name)} 우승!</b><p>말 ${state.perTeam}개가 모두 골인했어요</p><button class="btn primary" type="button">확인</button></div>`;
  b.querySelector("button").onclick=()=>b.remove(); document.body.appendChild(b);
  SFX.win(); confetti([tm.color, ...COLORS, "#FFD23F", "#FFFFFF"]);
  setTimeout(()=>confetti([tm.color, "#FFD23F", "#FFFFFF"]), 1300);
  return true;
}
