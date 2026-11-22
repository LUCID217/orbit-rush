const { chromium } = require('playwright');
const path=require('path');
const GAME='file://'+path.resolve(__dirname,'../www/index.html');
const LANGS=(process.argv[2]||'en').split(',');
const OUT=path.join(__dirname,'raw');
const today=()=>{const d=new Date();return d.toDateString();};
(async()=>{
  const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
  for(const lang of LANGS){
    const ctx=await browser.newContext({viewport:{width:360,height:720},deviceScaleFactor:3,isMobile:true,hasTouch:true});
    // seed a believable mid-game save: level 7, a few unlocks, streak 4
    await ctx.addInitScript(()=>{
      if(localStorage.getItem('orbitRush.save.v1')) return;
      const save={v:1,level:7,xpInLevel:820,lifetimeXP:5200,rebirths:0,best:42,lastRun:31,runsPlayed:38,ringsTotal:610,perfectsTotal:240,deaths:0,streak:4,lastDay:'',coins:1340,
        owned:{trail:[0,1,2,3],skin:[0,1,2],bg:[0,1,2],sound:[0,1],fx:[0,1]},equip:{trail:0,skin:0,bg:0,sound:0,fx:0},shopSeen:{trail:99,skin:99,bg:99,sound:99,fx:99},
        muted:false,lowFX:false,musicOn:true,consentDone:true};
      localStorage.setItem('orbitRush.save.v1',JSON.stringify(save));
    });
    const page=await ctx.newPage();
    await page.goto(GAME+'?lang='+lang);
    await page.waitForTimeout(1200);
    // hide the streak toast if any, and the web-only privacy/etc stays as on web
    await page.evaluate(()=>{ S.lastDay=new Date().toDateString(); document.querySelectorAll('.toast').forEach(t=>t.remove()); });
    await page.waitForTimeout(3500);
    await page.screenshot({path:`${OUT}/${lang}-home.png`});
    // bot: release when the shot would be PERFECT (skip a few to vary), stop after N
    await page.evaluate(()=>{
      window.__bot={on:true,missAt:-1};
      Game.startRun();
      const tick=()=>{ if(window.__bot.on&&Game.state==='playing'&&Game.dot.mode==='orbit'){
          const p=Game.predictRelease();
          if(window.__bot.missAt===Game.rings){ if(p==='miss'&&Math.random()<0.05) Game.onTap(); }
          else if(p==='perfect') Game.onTap(); }
        requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    const waitRings=async(n)=>page.waitForFunction(n=>Game.rings>=n,n,{timeout:60000});
    // shot A: early, ring 3, mid-orbit with aim line (wait until dot orbiting)
    await waitRings(2);
    await page.waitForFunction(()=>Game.dot.mode==='orbit'&&Game.word.age>0.15&&Game.word.age<0.5,null,{timeout:20000});
    await page.screenshot({path:`${OUT}/${lang}-play-early.png`});
    // shot B: FEVER, combo high, just after a PERFECT praise word
    await waitRings(9);
    await page.waitForFunction(()=>Game.combo>=6&&Game.word.age>0.32&&Game.word.age<0.5,null,{timeout:30000});
    await page.screenshot({path:`${OUT}/${lang}-play-fever.png`});
    // shot C: a second run in a different look (Lagoon world, Hot Pink trail, Cube skin)
    await page.evaluate(()=>{ Game.state='menu'; S.equip={trail:1,skin:2,bg:2,sound:0,fx:0}; Game.startRun(); });
    await waitRings(12);
    await page.waitForFunction(()=>Game.dot.mode==='fly'&&Game.next&&Math.hypot(Game.dot.x-Game.next.x,Game.dot.y-Game.next.y)<Game.next.r+45,null,{timeout:30000});
    await page.screenshot({path:`${OUT}/${lang}-play-flight.png`});
    // game over: two misses (free save, then death)
    await page.evaluate(()=>{ window.__bot.missAt=Game.rings; });
    await page.waitForFunction(()=>Game.rings>0&&(Game.savesLeft===0),null,{timeout:30000}).catch(()=>{});
    await page.waitForFunction(()=>Game.dot.mode==='orbit',null,{timeout:10000}).catch(()=>{});
    await page.evaluate(()=>{ window.__bot.missAt=Game.rings; });
    await page.waitForFunction(()=>Game.state==='over',null,{timeout:30000});
    await page.waitForTimeout(2200);
    await page.screenshot({path:`${OUT}/${lang}-over.png`});
    // shop
    await page.evaluate(()=>{ window.__bot.on=false; UI.home(); });
    await page.waitForTimeout(400);
    await page.evaluate(()=>{ S.equip={trail:0,skin:0,bg:0,sound:0,fx:0}; UI.home(); });
    await page.click('#btn-unlocks');
    await page.waitForTimeout(500);
    await page.click('[data-tab=bg]');
    await page.waitForTimeout(900);
    await page.screenshot({path:`${OUT}/${lang}-shop.png`});
    await ctx.close();
    console.log('done',lang);
  }
  await browser.close();
})();
