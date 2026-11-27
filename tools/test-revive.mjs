#!/usr/bin/env node
// Brief 003: revive payout test. Deterministic; no browser needed.
// Loads every inline <script> of www/index.html into a node vm context with
// stub DOM / localStorage / canvas, then plays one run:
//   land rings → die → 2× XP → ad revive → land → die → 2× XP again (must be refused)
//   → coin revive → land → die
// and asserts that the run pays coins and XP once in total, counts as one run,
// and that 2× XP is granted once per run.
// Usage: node tools/test-revive.mjs [path/to/index.html]   (exit 1 on failure)
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = process.argv[2] || path.join(root, "www/index.html");
const html = fs.readFileSync(file, "utf8");
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);

// A "do anything" stub: any property is another stub, calling it returns a stub,
// it coerces to 0 / "". Enough for the DOM, canvas and audio the game touches.
function stub() {
  const store = {};
  const fn = function () { return stub(); };
  return new Proxy(fn, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === "then") return undefined;           // never look like a Promise
      if (k in store) return store[k];
      return (store[k] = stub());
    },
    set(t, k, v) { store[k] = v; return true; },
    has() { return true; },
  });
}
// Elements remember textContent/disabled so the test can read the game-over screen.
const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    const el = stub();
    el.textContent = ""; el.disabled = false; el.innerHTML = "";
    const classes = new Set();
    el.classList = { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c),
      toggle: (c, on) => { (on ?? !classes.has(c)) ? classes.add(c) : classes.delete(c); return classes.has(c); } };
    el.style = { setProperty() {} };
    elements.set(id, el);
  }
  return elements.get(id);
}
const local = new Map();
let seed = 12345;
const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x80000000; };
const timers = [];
const ctx = {
  console: { log() {}, warn() {}, error: console.error },
  Math: Object.assign(Object.create(Math), { random: rng }),
  JSON, Date, Map, Set, Promise, Object, Array, Number, String, Symbol, Error, structuredClone,
  localStorage: { getItem: k => local.get(k) ?? null, setItem: (k, v) => local.set(k, String(v)), removeItem: k => local.delete(k) },
  document: Object.assign(stub(), {
    getElementById: element,
    createElement: () => element("_tmp" + Math.random()),
    addEventListener() {}, hidden: false,
  }),
  navigator: { language: "en-US", languages: ["en-US"], vibrate() {}, sendBeacon: () => true },
  location: { protocol: "file:", search: "", hostname: "", href: "file:///index.html" },
  performance: { now: () => 0 },
  requestAnimationFrame() {}, cancelAnimationFrame() {},
  setTimeout: (f) => { timers.push(f); return timers.length; }, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  fetch: () => Promise.resolve({}),
  addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }),
  devicePixelRatio: 1, innerWidth: 480, innerHeight: 800,
  URLSearchParams,
};
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
// Top-level const/let live in the script scope, not on the global: export them.
vm.runInContext(scripts.join("\n;\n") + "\n;globalThis.__T={Game,UI,Ads,S:()=>S,setS:v=>{S=v},CONFIG,Progress,xpMult};", ctx, { filename: "index.html" });
const { Game, UI, Ads, CONFIG } = ctx.__T;
const S = ctx.__T.S();

let fails = 0;
const check = (cond, msg) => { console.log((cond ? "ok:   " : "FAIL: ") + msg); if (!cond) fails++; };

// Known start: plenty of coins, missions that can't complete mid-test (a
// completing mission pays XP and would blur the XP totals).
S.coins = 10000; S.runsPlayed = 0; S.lifetimeXP = 0; S.level = 1; S.xpInLevel = 0;
S.missions = [{ t: "runs", n: 1000, p: 0, xp: 1 }, { t: "rings", n: 1e6, p: 0, xp: 1 }, { t: "score", n: 1e6, p: 0, xp: 1 }];
// Rewarded ads available: a fake AdMob whose ad "plays" instantly.
const fakeAdMob = { showRewardVideoAd: async () => {}, showInterstitial: async () => {}, prepareRewardVideoAd: async () => {}, prepareInterstitial: async () => {} };
Ads.plugin = () => fakeAdMob;
Ads.rewardedLoaded = true;
// Watching a rewarded ad: tap the button; the SDK reward event then grants it.
const watchAd = (tap) => { Ads.pendingReward = null; tap(); if (Ads.pendingReward) Ads.grantPendingReward(); Ads.rewardedLoaded = true; };

const land = (perfect) => Game.capture(perfect ? 0 : Game.next.r * 0.999);
const die = () => { Game.state = "dying"; UI.gameOver(); };
const lifeXP = () => S.lifetimeXP;
const runsMission = () => S.missions.find(m => m.t === "runs");

const coins0 = S.coins;
let spentOnRevives = 0;
Game.startRun();
for (let i = 0; i < 6; i++) land(i % 2 === 0);           // death 1
const xpBase1 = lifeXP();
die();
const coinsAfter1 = S.coins;
watchAd(() => Ads.rewardDoubleXP());                      // 2× XP, first time: allowed
const bonus1 = lifeXP() - xpBase1;
check(bonus1 === Math.round(xpBase1 * (CONFIG.REWARDED_DOUBLE_XP_MULT - 1)), `first 2× XP doubles the run's XP so far (+${bonus1})`);
watchAd(() => Ads.rewardContinue());                      // revive 1: ad continue
check(Game.state === "playing", "ad continue revives");

const xpBeforeLeg2 = lifeXP();
for (let i = 0; i < 5; i++) land(i % 3 === 0);            // death 2
const xpLeg2 = lifeXP() - xpBeforeLeg2;
die();
const xpBefore2x = lifeXP();
watchAd(() => Ads.rewardDoubleXP());                      // 2× XP again in the same run: refused
check(lifeXP() === xpBefore2x, `2× XP is once per run (second offer granted +${lifeXP() - xpBefore2x} XP, want 0)`);
const price = Game.nextRevivePrice();
Game.coinRevive();                                         // revive 2: coins
spentOnRevives += price;
check(Game.state === "playing", `coin revive (${price}) revives`);

const xpBeforeLeg3 = lifeXP();
for (let i = 0; i < 7; i++) land(i % 2 === 1);            // death 3
const xpLeg3 = lifeXP() - xpBeforeLeg3;
const coinsBeforeDeath3 = S.coins;
die();

const finalScore = Game.score, finalPerfects = Game.runPerfects;
const noReviveCoins = Math.round(finalScore * CONFIG.COINS_PER_SCORE) + finalPerfects * CONFIG.COINS_COMBO_BONUS;
const earned = S.coins - coins0 + spentOnRevives;
check(earned === noReviveCoins, `coins for the run = a no-revive run with score ${finalScore}, ${finalPerfects} perfects: got ${earned}, want ${noReviveCoins}`);
check(coinsAfter1 - coins0 > 0, "first game over pays coins");

const totalXP = lifeXP();
check(totalXP === xpBase1 + bonus1 + xpLeg2 + xpLeg3, `XP for the run = landings + one 2× bonus: got ${totalXP}, want ${xpBase1 + bonus1 + xpLeg2 + xpLeg3}`);

check(S.runsPlayed === 1, `runsPlayed counts the run once (got ${S.runsPlayed}, want 1)`);
check(runsMission().p === 1, `"play N runs" mission counts the run once (got ${runsMission().p}, want 1)`);

// Game-over screen: last payout and run total both make sense.
const coinsTxt = element("o-coins").textContent, xpTxt = element("o-xp").textContent;
console.log(`      over screen: "${xpTxt}" | "${coinsTxt}"`);
const leg3Coins = S.coins - coinsBeforeDeath3;
check(coinsTxt.startsWith(`+${leg3Coins} `) && coinsTxt.includes(` ${noReviveCoins} `) && coinsTxt.endsWith(`(${S.coins})`),
  `coins line shows this payout (+${leg3Coins}), the run total (${noReviveCoins}) and the balance (${S.coins})`);
check(xpTxt.startsWith(`+${xpLeg3} XP`) && xpTxt.endsWith(` ${totalXP}`),
  `XP line shows this payout (+${xpLeg3}) and the run total (${totalXP})`);

// A fresh run resets the once-per-run limit and counts as run 2.
Game.startRun();
land(true); land(false);
die();
const xpB = lifeXP();
watchAd(() => Ads.rewardDoubleXP());
check(lifeXP() > xpB, "a new run can take 2× XP again");
check(S.runsPlayed === 2, `second run counts (runsPlayed ${S.runsPlayed}, want 2)`);

console.log(fails ? `REVIVE TEST: FAILED (${fails})` : "REVIVE TEST: OK");
process.exit(fails ? 1 : 0);
