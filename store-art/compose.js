const { chromium } = require('playwright');
const fs=require('fs'), path=require('path');
const C=JSON.parse(fs.readFileSync(__dirname+'/captions.json'));
const L=fs.readFileSync(__dirname+'/fonts/lilita-one.woff2').toString('base64');
const N=fs.readFileSync(__dirname+'/fonts/nunito.woff2').toString('base64');
const langs=(process.argv[2]||'en').split(','), out=process.argv[3];
const BGS={def:['#2f6bff','#8a3cff','#e04bd6'], lagoon:['#00b8d4','#2f6bff','#7a3dff']};
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const head=s=>esc(s).replace(/\*(.+?)\*/g,'<span>$1</span>');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
  for(const lang of langs){
    for(let i=0;i<C.order.length;i++){
      const shot=C.order[i], [h,sub]=C[lang][i];
      const img=fs.readFileSync(`${__dirname}/raw/${lang}-${shot}.png`).toString('base64');
      const g=BGS[shot==='play-flight'?'lagoon':'def'];
      await p.setContent(`<html><head><style>
@font-face{font-family:L;src:url(data:font/woff2;base64,${L})}
@font-face{font-family:N;src:url(data:font/woff2;base64,${N});font-weight:200 1000}
body{margin:0;width:1080px;height:1920px;overflow:hidden;position:relative;background:linear-gradient(165deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)}
.ring{position:absolute;border-radius:50%;border:26px solid rgba(255,255,255,.16)}
.cap{position:absolute;left:60px;right:60px;top:70px;height:330px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
h1{margin:0;font:400 112px/1.0 L;color:#fff;letter-spacing:1px;text-shadow:0 8px 0 rgba(27,21,96,.55)}
h1 span{color:#ffd23f}
p{margin:22px 0 0;font:800 46px/1.2 N;color:#fff;opacity:.95;text-shadow:0 3px 0 rgba(27,21,96,.35)}
.phone{position:absolute;left:50%;top:430px;transform:translateX(-50%);width:704px;height:1408px;padding:20px;border-radius:78px;background:#15113a;
box-shadow:0 30px 60px rgba(20,10,70,.45),inset 0 0 0 3px rgba(255,255,255,.12)}
.phone img{display:block;width:704px;height:1408px;border-radius:58px}
</style></head><body>
<div class="ring" style="width:420px;height:420px;left:-170px;top:780px"></div>
<div class="ring" style="width:300px;height:300px;right:-110px;top:1350px"></div>
<div class="ring" style="width:180px;height:180px;right:40px;top:420px;border-width:18px;border-color:rgba(255,210,63,.35)"></div>
<div class="cap"><h1>${head(h)}</h1><p>${esc(sub)}</p></div>
<div class="phone"><img src="data:image/png;base64,${img}"></div>
</body></html>`);
      // shrink the headline until it fits in two lines and the sub in two
      await p.evaluate(()=>{const h=document.querySelector('h1'),s=document.querySelector('p'),c=document.querySelector('.cap');
        let f=112; while((h.scrollWidth>960||h.offsetHeight>f*2.1||c.scrollHeight>330)&&f>60){f-=4;h.style.fontSize=f+'px';}
        let g=46; while(s.offsetHeight>g*2.5&&g>34){g-=2;s.style.fontSize=g+'px';}});
      await p.waitForTimeout(100);
      const loc=lang==='es'?['es-419','es-ES']:[lang==='en'?'en-US':lang];
      for(const l of loc){const dir=`${out}/${l}/images/phoneScreenshots`; fs.mkdirSync(dir,{recursive:true});
        await p.screenshot({path:`${dir}/${i+1}_${l}.jpg`,type:'jpeg',quality:90});}
    }
    console.log('composed',lang);
  }
  await b.close();
})();
