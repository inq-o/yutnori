// 말과 팀 카드 그리기
const initial = t => (state.teams[t].name.trim()[0] || String(t+1));
function tokHTML(team, count, attrs, style){
  return `<div class="tok" data-team="${team}" ${attrs} style="--c:${state.teams[team].color};${style||""}">${esc(initial(team))}${count>1?`<b>×${count}</b>`:""}</div>`;
}

function render(){
  // 판 위: 칸별 → 팀별로 묶어서 하나의 말(업힌 수 표시)
  const at = {};
  state.pieces.forEach(p=>{ if(N[p.loc]) ((at[p.loc] ||= {})[p.team] ||= []).push(p); });
  let h = "";
  for (const [node, byTeam] of Object.entries(at)){
    const teams = Object.keys(byTeam), [x,y]=N[node];
    teams.forEach((t,i)=>{
      let dx=0, dy=0;
      if (teams.length>1){ const a = -Math.PI/2 + i*2*Math.PI/teams.length; dx=Math.cos(a)*16; dy=Math.sin(a)*16; }
      h += tokHTML(+t, byTeam[t].length, `data-node="${node}"`, `left:${(x+dx)/6}%;top:${(y+dy)/6}%;--ts:${board.clientWidth*0.08}px`);
    });
  }
  tokensEl.innerHTML = h;

  teamsEl.innerHTML = state.teams.map((tm,t)=>{
    const mine = state.pieces.filter(p=>p.team===t);
    const home = mine.filter(p=>p.loc==="home"), done = mine.filter(p=>p.loc==="done");
    return `<section class="team${state.winner===t?" win":""}${state.turn===t?" now":""}" data-team-card="${t}" style="--tc:${tm.color}">
      <div class="team-head" data-turn="${t}" title="이 팀 차례로"><span class="chip" style="background:${tm.color}"></span><span class="team-name">${esc(tm.name)}</span>
        <span class="team-stat">골인 ${done.length}/${state.perTeam}</span></div>
      <div class="tray">${home.map(p=>tokHTML(t,1,`data-home="${p.id}"`)).join("") || '<span class="empty">대기 중인 말 없음</span>'}
        <span class="stars">${done.map(p=>`<button type="button" class="star" data-undone="${p.id}" title="골인 취소 (대기로)" aria-label="${esc(tm.name)} 골인 말 되돌리기">★</button>`).join("")}</span></div>
    </section>`;
  }).join("");
  const cur = state.teams[state.turn] || state.teams[0];
  $("turn").style.setProperty("--tc", cur.color); $("turnName").textContent = cur.name;
  const snd=$("sound"); snd.setAttribute("aria-pressed", state.sound); snd.textContent = state.sound ? "소리 켬" : "소리 끔";
  $("undo").disabled = !undoStack.length;
  save();
}
