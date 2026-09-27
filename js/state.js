// 게임 상태: 저장/불러오기(localStorage 'yut-board-v2'), 새 게임, 되돌리기 기록
function load(){ try{ const s=JSON.parse(localStorage.getItem("yut-board-v2")); return s&&s.pieces?s:null; }catch(e){ return null; } }
function save(){ try{ localStorage.setItem("yut-board-v2", JSON.stringify(state)); }catch(e){} }
function snapshot(){ undoStack.push(JSON.stringify(state)); if(undoStack.length>80) undoStack.shift(); }
const firstRun = !load();
let state = load() || fresh(4, 3, "hanji");
state.turn ??= 0; state.sound ??= true;
let undoStack = [];

function fresh(teamCount, perTeam, skin, names){
  const teams = Array.from({length:teamCount},(_,i)=>({name:(names&&names[i])||DEFAULT_NAMES[i], color:COLORS[i]}));
  const pieces=[]; teams.forEach((_,t)=>{for(let k=0;k<perTeam;k++) pieces.push({id:t+"-"+k,team:t,loc:"home"});});
  return {teams, perTeam, pieces, skin, autoCapture:true, winner:null, turn:0, sound:true};
}
