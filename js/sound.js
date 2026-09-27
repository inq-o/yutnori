// 효과음 (파일 없이 Web Audio로 합성)
let ac = null;
function audio(){
  if (!state.sound) return null;
  try{ ac ||= new (window.AudioContext||window.webkitAudioContext)(); if (ac.state==="suspended") ac.resume(); return ac; }catch(e){ return null; }
}
function tone(f, at, dur, type="triangle", vol=.22, f2){
  const a=audio(); if(!a) return;
  const t=a.currentTime+at, o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if (f2) o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t+dur+.05);
}
function thud(at, dur, vol=.5){
  const a=audio(); if(!a) return;
  const t=a.currentTime+at, len=Math.floor(a.sampleRate*dur), buf=a.createBuffer(1,len,a.sampleRate), d=buf.getChannelData(0);
  for (let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5);
  const s=a.createBufferSource(), f=a.createBiquadFilter(), g=a.createGain();
  s.buffer=buf; f.type="lowpass"; f.frequency.value=900; g.gain.value=vol;
  s.connect(f).connect(g).connect(a.destination); s.start(t);
}
const SFX = {
  place(){ thud(0,.07,.35); tone(620,0,.09,"sine",.14,420); },
  stack(){ tone(392,0,.12); tone(523,.09,.12); tone(784,.18,.22,"triangle",.2); },
  capture(){ thud(0,.25,.9); tone(330,0,.4,"sawtooth",.12,60); tone(988,.22,.1,"square",.07); tone(1319,.3,.18,"square",.07); },
  goal(){ [523,659,784,1047].forEach((f,i)=>tone(f,i*.08,.35,"triangle",.2)); tone(2093,.34,.5,"sine",.06); },
  home(){ tone(500,0,.18,"sine",.12,300); },
  turn(){ tone(880,0,.07,"sine",.1); tone(1175,.06,.1,"sine",.1); },
  win(){
    [[392,0,.12],[392,.13,.12],[392,.26,.12],[523,.4,.7],[659,.4,.7],[784,.4,.7],[587,.9,.14],[659,1.05,.14],[784,1.2,.9],[1047,1.2,.9]]
      .forEach(([f,at,d])=>tone(f,at,d,"triangle",.16));
    thud(.4,.3,.6); thud(1.2,.3,.6);
  },
};
