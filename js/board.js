// 윷판 29칸 좌표와 그리기, 스킨 적용
// 29개 칸: 바깥 20칸(출발점에서 반시계), 대각선 8칸, 가운데
const N = {};
const side = k => 60 + k*96;
for (let k=0;k<5;k++) N["o"+k]      = [540, side(5-k)];
for (let k=0;k<5;k++) N["o"+(5+k)]  = [side(5-k), 60];
for (let k=0;k<5;k++) N["o"+(10+k)] = [60, side(k)];
for (let k=0;k<5;k++) N["o"+(15+k)] = [side(k), 540];
N.a1=[460,140]; N.a2=[380,220]; N.c=[300,300]; N.a3=[220,380]; N.a4=[140,460];
N.b1=[140,140]; N.b2=[220,220]; N.b3=[380,380]; N.b4=[460,460];
const BIG = new Set(["o0","o5","o10","o15","c"]);
// ---------- 윷판 그리기 ----------
function drawBoard(){
  const sk = SKINS[state.skin];
  const L = (a,b)=>`<line class="ln" x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}"/>`;
  let s = "";
  if (sk.split) s += `<polygon class="bd1" points="30,30 570,30 30,570"/><polygon class="bd2" points="570,30 570,570 30,570"/>`;
  else s += `<rect class="bd1" x="30" y="30" width="540" height="540" rx="6"/>`;
  if (sk.frame) s += `<rect x="24" y="24" width="552" height="552" fill="none" stroke="var(--line)" stroke-width="5"/><rect x="34" y="34" width="532" height="532" fill="none" stroke="var(--line)" stroke-width="1.5"/>`;
  s += L("o0","o5")+L("o5","o10")+L("o10","o15")+L("o15","o0")+L("o5","o15")+L("o10","o0");
  const arrow=(x,y,deg)=>`<polygon class="arw" points="-9,-8 9,0 -9,8" transform="translate(${x} ${y}) rotate(${deg})"/>`;
  s += arrow(540,300,-90)+arrow(300,60,180)+arrow(60,300,90)+arrow(300,540,0)
     + arrow(420,180,135)+arrow(180,180,45)+arrow(180,420,135)+arrow(420,420,45);
  for (const [id,[x,y]] of Object.entries(N)){
    const big=BIG.has(id), r = big?30:(sk.style==="solid"?16:20);
    s += `<circle class="nd${big?" big":""}" data-n="${id}" cx="${x}" cy="${y}" r="${r}" ${sk.style==="thin"?'style="stroke-width:2"':""}/>`;
    if (big && sk.style!=="solid") s += `<circle class="ring" cx="${x}" cy="${y}" r="21"/>`;
    if (sk.style==="dot") s += `<circle class="dot" cx="${x}" cy="${y}" r="${big?10:8}"/>`;
  }
  s += `<text class="lbl" x="540" y="596">출발</text>`;
  svg.innerHTML = s;
}

function applySkin(){
  const v = SKINS[state.skin].v, r=document.documentElement.style;
  const map={bg:"--bg",bgImg:"--bg-img",panel:"--panel",panelLine:"--panel-line",ink:"--ink",muted:"--muted",accent:"--accent",board:"--board",board2:"--board2",
    line:"--line",node:"--node",nodeLine:"--node-line",big:"--big",bigLine:"--big-line",arrow:"--arrow",btn:"--btn",btnInk:"--btn-ink"};
  for (const k in map) r.setProperty(map[k], v[k]);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", v.bg);
  const skinsEl = $("skins");
  if (skinsEl) skinsEl.innerHTML = Object.entries(SKINS).map(([k,s])=>
    `<button type="button" class="skin" data-skin="${k}" aria-pressed="${k===state.skin}" aria-label="${s.name}" title="${s.name}" style="--sw:${s.v.bg};--dot:${s.v.accent}"><i></i></button>`).join("");
  drawBoard();
}
