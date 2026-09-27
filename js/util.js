// 공통 도구: 요소 찾기, 주요 요소, 글자 이스케이프, 알림
const $ = id => document.getElementById(id);
const svg=$("svg"), tokensEl=$("tokens"), board=$("board"), teamsEl=$("teams"), goalEl=$("goal");
function esc(s){ return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
let tt; function toast(m){ const t=$("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove("show"),1800); }
