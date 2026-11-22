// Renders the Orbit Rush icon layers. Design space is the 108x108 adaptive icon grid;
// everything important stays inside the 66-unit safe circle (r=33 around 54,54).
const { chromium } = require('playwright');
const fs=require('fs'), path=require('path');
const BG=`<defs><linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
  <stop offset="0" stop-color="#2f6bff"/><stop offset="0.62" stop-color="#7a3dff"/><stop offset="1" stop-color="#c63cff"/></linearGradient>
  <radialGradient id="glow" cx="0.62" cy="0.40" r="0.55"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>
  <rect width="108" height="108" fill="url(#bg)"/><rect width="108" height="108" fill="url(#glow)"/>
  <g fill="#fff"><circle cx="20" cy="26" r=".9" opacity=".7"/><circle cx="86" cy="80" r="1" opacity=".6"/><circle cx="30" cy="58" r=".7" opacity=".5"/><circle cx="88" cy="22" r=".8" opacity=".6"/><circle cx="74" cy="92" r=".7" opacity=".5"/></g>`;
function FG(mono){
  // A chunky target ring with the dot orbiting it, dragging a tapering comet trail.
  const Y=mono?'#fff':'#ffd23f', SH='#1b1560';
  const cx=54, cy=54, R=14.5, O=25.5;           // ring radius, orbit radius
  const a1=-0.62;                                // dot angle (upper right)
  // tapering comet trail as one filled crescent (no overlapping segments)
  const span=2.3, M=40, outer=[], inner=[];
  for(let i=0;i<=M;i++){
    const k=i/M, t=a1-span*(1-k), w=0.6+8.4*Math.pow(k,1.3);
    outer.push([cx+Math.cos(t)*(O+w/2), cy+Math.sin(t)*(O+w/2)]);
    inner.push([cx+Math.cos(t)*(O-w/2), cy+Math.sin(t)*(O-w/2)]);
  }
  const pts=outer.concat(inner.reverse()).map(p=>p[0].toFixed(2)+' '+p[1].toFixed(2)).join(' L');
  const tail=[cx+Math.cos(a1-span)*O, cy+Math.sin(a1-span)*O], head=[cx+Math.cos(a1)*O, cy+Math.sin(a1)*O];
  const segs=[`<defs><linearGradient id="cm${mono?'m':''}" gradientUnits="userSpaceOnUse" x1="${tail[0]}" y1="${tail[1]}" x2="${head[0]}" y2="${head[1]}">
    <stop offset="0" stop-color="${mono?'#fff':'#ffd23f'}" stop-opacity="${mono?0.35:0}"/><stop offset=".6" stop-color="${mono?'#fff':'#ffd23f'}" stop-opacity="${mono?1:.85}"/><stop offset="1" stop-color="${mono?'#fff':'#fff6c4'}"/></linearGradient></defs>
    <path d="M${pts} Z" fill="url(#cm${mono?'m':''})"/>`];
  const dx=cx+Math.cos(a1)*O, dy=cy+Math.sin(a1)*O;
  return `${mono?'':`<circle cx="${cx}" cy="${cy}" r="${O}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>`}
  ${mono?'':`<circle cx="${cx}" cy="${cy+2.6}" r="${R}" fill="none" stroke="${SH}" stroke-opacity=".45" stroke-width="8"/>`}
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${Y}" stroke-width="8"/>
  ${mono?'':`<path d="M${cx-R*0.93} ${cy-R*0.36} A${R} ${R} 0 0 1 ${cx-R*0.2} ${cy-R*0.98}" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-linecap="round"/>`}
  ${segs.reverse().join('')}
  ${mono?'':`<circle cx="${dx}" cy="${dy+2.2}" r="6.4" fill="${SH}" opacity=".45"/>`}
  <circle cx="${dx}" cy="${dy}" r="6.4" fill="#fff"/>`;
}
const svg=(inner,size)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="${size}" height="${size}">${inner}</svg>`;
// legacy (pre-Android 8) icons: crop the 108 grid to the central 72 (like Android Studio does), rounded square / circle
const legacy=(size,round)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 18 72 72" width="${size}" height="${size}"><defs><clipPath id="c">${round?'<circle cx="54" cy="54" r="33"/>':'<rect x="21" y="21" width="66" height="66" rx="11"/>'}</clipPath></defs><g clip-path="url(#c)">${BG}${FG(false)}</g></svg>`;
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage();
  const shot=async(markup,size,file,transparent)=>{
    await p.setViewportSize({width:size,height:size});
    await p.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
    fs.mkdirSync(path.dirname(file),{recursive:true});
    await p.screenshot({path:file,omitBackground:!!transparent,clip:{x:0,y:0,width:size,height:size}});
  };
  const out=process.argv[2];
  // Play Store icon: full square, Google applies its own mask
  await shot(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="512" height="512">${BG}<g transform="translate(54 54) scale(1.22) translate(-54 -54)">${FG(false)}</g></svg>`,512,`${out}/store/icon.png`);
  // Adaptive layers, 108dp at each density
  const D={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4};
  for(const [d,m] of Object.entries(D)){
    await shot(svg(BG,108*m),108*m,`${out}/res/mipmap-${d}/ic_launcher_background.png`);
    await shot(svg(FG(false),108*m),108*m,`${out}/res/mipmap-${d}/ic_launcher_foreground.png`,true);
    await shot(svg(FG(true),108*m),108*m,`${out}/res/mipmap-${d}/ic_launcher_monochrome.png`,true);
    await shot(legacy(48*m,false),48*m,`${out}/res/mipmap-${d}/ic_launcher.png`,true);
    await shot(legacy(48*m,true),48*m,`${out}/res/mipmap-${d}/ic_launcher_round.png`,true);
  }
  // preview of how launchers mask it
  const masks=['<circle cx="54" cy="54" r="54"/>','<rect width="108" height="108" rx="24"/>','<path d="M54 0C90 0 108 18 108 54S90 108 54 108 0 90 0 54 18 0 54 0z"/>'];
  let html='<div style="display:flex;gap:24px;padding:24px;background:#eef">';
  for(const m of masks) html+=`<svg viewBox="0 0 108 108" width="160" height="160"><defs><clipPath id="k${masks.indexOf(m)}">${m}</clipPath></defs><g clip-path="url(#k${masks.indexOf(m)})">${BG}${FG(false)}</g></svg>`;
  html+=`<svg viewBox="0 0 108 108" width="160" height="160" style="background:#334"><g>${FG(true)}</g></svg><svg viewBox="0 0 108 108" width="48" height="48"><defs><clipPath id="s"><circle cx="54" cy="54" r="54"/></clipPath></defs><g clip-path="url(#s)">${BG}${FG(false)}</g></svg></div>`;
  await p.setViewportSize({width:960,height:210}); await p.setContent(`<body style="margin:0">${html}</body>`);
  await p.screenshot({path:`${out}/icon-masks.png`});
  await b.close();
})();
