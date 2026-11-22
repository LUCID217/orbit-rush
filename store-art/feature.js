const { chromium } = require('playwright');
const fs=require('fs');
const font=fs.readFileSync(__dirname+'/fonts/lilita-one.woff2').toString('base64');
function comet(cx,cy,O,a1,span,wmax,id){
  const M=48,outer=[],inner=[];
  for(let i=0;i<=M;i++){const k=i/M,t=a1-span*(1-k),w=1+wmax*Math.pow(k,1.3);
    outer.push([cx+Math.cos(t)*(O+w/2),cy+Math.sin(t)*(O+w/2)]);inner.push([cx+Math.cos(t)*(O-w/2),cy+Math.sin(t)*(O-w/2)]);}
  const pts=outer.concat(inner.reverse()).map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
  const tl=[cx+Math.cos(a1-span)*O,cy+Math.sin(a1-span)*O],hd=[cx+Math.cos(a1)*O,cy+Math.sin(a1)*O];
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${tl[0]}" y1="${tl[1]}" x2="${hd[0]}" y2="${hd[1]}"><stop offset="0" stop-color="#ffd23f" stop-opacity="0"/><stop offset=".6" stop-color="#ffd23f" stop-opacity=".85"/><stop offset="1" stop-color="#fff6c4"/></linearGradient></defs><path d="M${pts} Z" fill="url(#${id})"/>`;
}
const ring=(x,y,r,w,c='#ffd23f',op=1)=>`<circle cx="${x}" cy="${y+r*0.17}" r="${r}" fill="none" stroke="#1b1560" stroke-opacity="${.4*op}" stroke-width="${w}"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-opacity="${op}" stroke-width="${w}"/>`;
let stars=''; let seed=7; const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
for(let i=0;i<46;i++) stars+=`<circle cx="${(rnd()*1024).toFixed(0)}" cy="${(rnd()*500).toFixed(0)}" r="${(0.8+rnd()*1.8).toFixed(1)}" fill="#fff" opacity="${(0.25+rnd()*0.5).toFixed(2)}"/>`;
// main ring right of centre with the dot orbiting; a faded previous ring lower left of it; next ring top right
const cx=770, cy=270, R=78, O=128, a1=-0.55;
const dx=cx+Math.cos(a1)*O, dy=cy+Math.sin(a1)*O;
const art=`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f6bff"/><stop offset=".6" stop-color="#7a3dff"/><stop offset="1" stop-color="#d13cff"/></linearGradient>
<radialGradient id="gl" cx=".75" cy=".5" r=".45"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="1024" height="500" fill="url(#bg)"/><rect width="1024" height="500" fill="url(#gl)"/>${stars}
${ring(590,470,46,14,'#ffffff',.35)}
${ring(960,70,40,13,'#ffffff',.55)}
<circle cx="${cx}" cy="${cy}" r="${O}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
${ring(cx,cy,R,40)}
<path d="M${cx-R*0.93} ${cy-R*0.36} A${R} ${R} 0 0 1 ${cx-R*0.2} ${cy-R*0.98}" stroke="#fff" stroke-opacity=".6" stroke-width="9" fill="none" stroke-linecap="round"/>
${comet(cx,cy,O,a1,2.6,40,'c1')}
<circle cx="${dx}" cy="${dy+8}" r="30" fill="#1b1560" opacity=".4"/><circle cx="${dx}" cy="${dy}" r="30" fill="#fff"/>
</svg>`;
const html=`<html><head><style>@font-face{font-family:L;src:url(data:font/woff2;base64,${font})}
body{margin:0;width:1024px;height:500px;position:relative;overflow:hidden}
.t{position:absolute;left:70px;top:128px;font:122px/0.92 L;color:#fff;letter-spacing:1px;
text-shadow:0 9px 0 #1b1560aa, 0 0 40px rgba(40,20,120,.35)}
.t span{color:#ffd23f}
.s{position:absolute;left:76px;top:385px;font:30px L;color:#fff;opacity:.9;letter-spacing:2px;text-shadow:0 3px 0 #1b156088}
</style></head><body>${art.replace('<svg','<svg style="position:absolute;left:0;top:0"')}
<div class="t">ORBIT<br><span>RUSH</span></div></body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:500}});
await p.setContent(html);await p.waitForTimeout(300);
await p.screenshot({path:process.argv[2]});await b.close();})();
