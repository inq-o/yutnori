// 차례 넘기기, 버튼, 리모컨 키, 설정 창
function setTurn(t, quiet){
  const n=state.teams.length; state.turn=((t%n)+n)%n;
  render(); if (!quiet){ SFX.turn(); retrigger($("turn"),"flip"); }
}
// ---------- 버튼 ----------
document.addEventListener("click", e=>{
  const sk = e.target.closest("[data-skin]");
  if (sk){ state.skin = sk.dataset.skin; applySkin(); render(); return; }
  const tt = e.target.closest("[data-turn]");
  if (tt){ setTurn(+tt.dataset.turn); return; }
  const st = e.target.closest("[data-undone]");
  if (st){ snapshot(); state.pieces.find(p=>p.id===st.dataset.undone).loc="home"; if(state.winner!=null&&!state.pieces.filter(p=>p.team===state.winner).every(p=>p.loc==="done")) state.winner=null; render(); }
});
$("undo").onclick = ()=>{ if(!undoStack.length) return; const {skin, sound}=state; state=JSON.parse(undoStack.pop()); Object.assign(state,{skin,sound}); state.turn ??= 0; render(); toast("한 번 되돌렸어요"); };
$("nextTurn").onclick = ()=>setTurn(state.turn+1);
$("prevTurn").onclick = ()=>setTurn(state.turn-1);
$("sound").onclick = ()=>{ state.sound=!state.sound; render(); if (state.sound) SFX.turn(); };
// 발표용 리모컨(PageDown/PageUp)이나 화살표로 차례 넘기기
document.addEventListener("keydown", e=>{
  if (e.target.closest("input,textarea,.sheet") || e.metaKey || e.ctrlKey || e.altKey) return;
  if (["ArrowRight","PageDown"].includes(e.key)){ e.preventDefault(); setTurn(state.turn+1); }
  if (["ArrowLeft","PageUp"].includes(e.key)){ e.preventDefault(); setTurn(state.turn-1); }
});
let armed=null;
$("reset").onclick = e=>{
  const b=e.currentTarget;
  if (!armed){ b.textContent="한 번 더 누르면 초기화"; b.classList.add("warn"); armed=setTimeout(()=>{armed=null;b.textContent="새 게임";b.classList.remove("warn");},3000); return; }
  clearTimeout(armed); armed=null; b.textContent="새 게임"; b.classList.remove("warn");
  snapshot(); state.pieces.forEach(p=>p.loc="home"); state.winner=null; state.turn=0; render(); toast("말을 모두 대기로 돌렸어요");
};
$("full").onclick = ()=>{
  const d=document;
  if (d.fullscreenElement) d.exitFullscreen?.().catch(()=>{});
  else d.documentElement.requestFullscreen?.().catch(()=>toast("이 화면에서는 전체화면을 쓸 수 없어요"));
};

$("settings").onclick = ()=>{
  let tc = state.teams.length, pt = state.perTeam;
  const names = state.teams.map(t=>t.name).concat(DEFAULT_NAMES.slice(state.teams.length));
  const sh=document.createElement("div"); sh.className="sheet";
  const seg=(name,from,to,val)=>`<div class="seg" data-seg="${name}">${Array.from({length:to-from+1},(_,i)=>i+from).map(n=>`<button type="button" data-v="${n}" aria-pressed="${n===val}">${n}</button>`).join("")}</div>`;
  const nameFields=()=>Array.from({length:tc},(_,i)=>`<label><span class="chip" style="background:${COLORS[i]}"></span><input id="name${i}" value="${esc(names[i])}" maxlength="8" aria-label="${i+1}번 팀 이름"></label>`).join("");
  sh.innerHTML=`<form><h2>설정</h2>
    <div class="row"><span>스킨 (누르면 바로 바뀌어요)</span><div class="skins" id="skins" role="group" aria-label="스킨"></div></div>
    <div class="row"><span>팀 수</span>${seg("tc",2,6,tc)}</div>
    <div class="row"><span>팀마다 말 개수</span>${seg("pt",1,4,pt)}</div>
    <div class="row"><span>팀 이름 (말에 첫 글자가 표시돼요)</span><div class="names" id="names">${nameFields()}</div></div>
    <label class="check"><input type="checkbox" id="autoCap" ${state.autoCapture?"checked":""}> 다른 팀 말이 있는 칸에 놓으면 자동으로 잡기</label>
    <div class="foot"><button class="btn" type="button" data-close>닫기</button><button class="btn primary" type="submit">적용</button></div>
    <span class="hint" id="hint"></span></form>`;
  document.body.appendChild(sh); applySkin();
  const hint=()=>{ sh.querySelector("#hint").textContent = (tc!==state.teams.length||pt!==state.perTeam) ? "팀 수나 말 개수를 바꾸면 새 게임으로 시작해요." : ""; };
  sh.addEventListener("click", e=>{
    const b=e.target.closest(".seg button");
    if (b){
      sh.querySelectorAll("#names input").forEach((inp,i)=>names[i]=inp.value);
      const s=b.parentElement.dataset.seg, v=+b.dataset.v;
      if (s==="tc"){ tc=v; sh.querySelector("#names").innerHTML=nameFields(); } else pt=v;
      b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x===b)); hint();
    }
    if (e.target.closest("[data-close]") || e.target===sh) sh.remove();
  });
  sh.querySelector("form").addEventListener("submit", e=>{
    e.preventDefault();
    const nm = [...sh.querySelectorAll("#names input")].map((inp,i)=>inp.value.trim()||DEFAULT_NAMES[i]);
    snapshot();
    if (tc!==state.teams.length || pt!==state.perTeam){ const {autoCapture, sound}=state; state = fresh(tc,pt,state.skin,nm); Object.assign(state,{autoCapture, sound}); }
    else state.teams.forEach((t,i)=>t.name=nm[i]);
    state.autoCapture = sh.querySelector("#autoCap").checked;
    sh.remove(); render();
  });
};

window.addEventListener("resize", ()=>{ const w=board.clientWidth*0.08; tokensEl.querySelectorAll(".tok").forEach(t=>t.style.setProperty("--ts",w+"px")); });
new ResizeObserver(()=>{ const w=board.clientWidth*0.08; tokensEl.querySelectorAll(".tok").forEach(t=>t.style.setProperty("--ts",w+"px")); }).observe(board);
