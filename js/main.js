// 시작
// 예시 진행 상태로 시작 (처음 열었을 때만)
if (firstRun){
  const ex = {"0-0":"o3","0-1":"o3","1-0":"a2","2-0":"o12","3-0":"done"};
  state.pieces.forEach(p=>{ if (ex[p.id]) p.loc=ex[p.id]; });
}
applySkin(); render();
