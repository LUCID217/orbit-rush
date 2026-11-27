#!/usr/bin/env node
// Orbit Rush deterministic check. Run: bash tools/check.sh
// Fails (exit 1) on anything that would break the game; prints WARN for things to know about.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "www/index.html"), "utf8");
let fails = 0, warns = 0;
const fail = m => { fails++; console.log("FAIL:", m); };
const warn = m => { warns++; console.log("WARN:", m); };
const ok = m => console.log("ok:", m);

// 1. Every inline script parses.
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length === 0) fail("no inline <script> blocks found in www/index.html");
scripts.forEach((s, i) => { try { new vm.Script(s, { filename: `index.html#script${i + 1}` }); } catch (e) { fail(`script block ${i + 1} does not parse: ${e.message}`); } });
// All blocks share one global scope in the browser, so they must also parse together.
try { new vm.Script(scripts.join("\n;\n"), { filename: "index.html#all" }); ok(`${scripts.length} script blocks parse`); }
catch (e) { fail(`script blocks clash when joined (duplicate const?): ${e.message}`); }

// 2. CONFIG: every CONFIG.X the code reads is defined.
const cfgSrc = html.match(/const CONFIG\s*=\s*(\{[\s\S]*?\n\});/);
let CONFIG = null;
if (!cfgSrc) fail("CONFIG block not found");
else {
  try { CONFIG = vm.runInNewContext("(" + cfgSrc[1] + ")"); } catch (e) { fail("CONFIG block does not evaluate: " + e.message); }
}
if (CONFIG) {
  const used = new Set([...html.matchAll(/CONFIG\.([A-Z0-9_]+)/g)].map(m => m[1]));
  const missing = [...used].filter(k => !(k in CONFIG));
  missing.length ? missing.forEach(k => fail(`CONFIG.${k} is read but not defined`)) : ok(`${used.size} CONFIG keys read, all defined`);
  // ADMOB_APP_ID is read by scripts/set-ad-ids.js and kept in sync with the
  // manifest, not by the game code, so it's expected to be "unused" here.
  const unused = Object.keys(CONFIG).filter(k => !used.has(k) && k !== "ADMOB_APP_ID");
  if (unused.length) warn(`CONFIG keys defined but never read: ${unused.join(", ")}`);
}

// 3. STR: every tr("key") exists in English; report gaps in other languages.
const strSrc = html.match(/const STR\s*=\s*(\{[\s\S]*?\n\});/);
let STR = null;
if (!strSrc) fail("STR table not found");
else { try { STR = vm.runInNewContext("(" + strSrc[1] + ")"); } catch (e) { fail("STR table does not evaluate: " + e.message); } }
if (STR) {
  if (!STR.en) fail("STR.en missing");
  else {
    const code = html.replace(/\/\*[\s\S]*?\*\//g, "");
    const keys = new Set([...code.matchAll(/\btr\(\s*["']([A-Za-z0-9_.]+)["']\s*[,)]/g)].map(m => m[1]));
    const missing = [...keys].filter(k => !(k in STR.en));
    missing.length ? missing.forEach(k => fail(`tr("${k}") has no English text in STR.en`)) : ok(`${keys.size} tr() keys, all in STR.en`);
    // Static HTML text is filled by UI.applyLang() from data-i18n="key".
    const htmlKeys = new Set([...html.matchAll(/\bdata-i18n="([^"]+)"/g)].map(m => m[1]));
    const htmlMissing = [...htmlKeys].filter(k => !(k in STR.en));
    htmlMissing.length ? htmlMissing.forEach(k => fail(`data-i18n="${k}" has no English text in STR.en`)) : ok(`${htmlKeys.size} data-i18n keys, all in STR.en`);
    const listM = html.match(/LIST:\s*(\[[^\]]*\])/);
    const list = listM ? vm.runInNewContext(listM[1]) : [];
    for (const lang of list) {
      if (!STR[lang]) { fail(`Lang.LIST has "${lang}" but STR has no block for it`); continue; }
      const gaps = Object.keys(STR.en).filter(k => !(k in STR[lang]));
      if (gaps.length) warn(`${lang}: ${gaps.length} key(s) fall back to English: ${gaps.join(", ")}`);
    }
    // Keys built at runtime (tr("m_"+type)) can't be checked one by one; at least the family must exist.
    for (const pre of new Set([...code.matchAll(/\btr\(\s*["']([A-Za-z0-9_]+)["']\s*\+/g)].map(m => m[1])))
      Object.keys(STR.en).some(k => k.startsWith(pre)) ? ok(`dynamic tr("${pre}"+…) has English keys`) : fail(`tr("${pre}"+…) has no matching keys in STR.en`);
    ok(`languages: ${list.join(", ")}`);
  }
}

// 4. Release guard: report (not fail) while the game is pre-release.
if (CONFIG) {
  if (/ca-app-pub-3940256099942544/.test(JSON.stringify(CONFIG))) warn("AdMob IDs are Google's test IDs (fine before release; run scripts/set-ad-ids.js before the first Play upload)");
  if (CONFIG.ADS_TESTING_MODE) warn("ADS_TESTING_MODE is true");
}

// 5. Plugin API guards (ADR 0003). The plugins are pinned, so their event
// names and call shapes are fixed; a wrong name fails silently on device.
// All FAIL since brief 002 fixed the code (each was proven to catch the old code).
{
  // Every event name @capacitor-community/admob 7.2.0 emits (dist/esm/*/…-plugin-events.enum.d.ts).
  const ADMOB_V7_EVENTS = new Set([
    "bannerAdSizeChanged", "bannerAdLoaded", "bannerAdFailedToLoad", "bannerAdOpened", "bannerAdClosed", "bannerAdImpression",
    "interstitialAdLoaded", "interstitialAdFailedToLoad", "interstitialAdShowed", "interstitialAdFailedToShow", "interstitialAdDismissed",
    "onRewardedVideoAdLoaded", "onRewardedVideoAdFailedToLoad", "onRewardedVideoAdShowed", "onRewardedVideoAdFailedToShow",
    "onRewardedVideoAdDismissed", "onRewardedVideoAdReward",
    "onRewardedInterstitialAdLoaded", "onRewardedInterstitialAdFailedToLoad", "onRewardedInterstitialAdShowed",
    "onRewardedInterstitialAdFailedToShow", "onRewardedInterstitialAdDismissed", "onRewardedInterstitialAdReward",
    "consentInfoUpdate",
  ]);
  const listened = [...html.matchAll(/AdMob\.addListener\(\s*["']([^"']+)["']/g)].map(m => m[1]);
  const bad = listened.filter(e => !ADMOB_V7_EVENTS.has(e));
  bad.length ? fail(`AdMob listens for event(s) the pinned v7 plugin never emits: ${bad.join(", ")}`) : ok(`${listened.length} AdMob event names match v7`);

  // Every prepare*() needs its FailedToLoad listener, or one failed load
  // (offline at launch) leaves that format dead for the whole session.
  const PREPARE_FAIL_EVENT = {
    prepareInterstitial: "interstitialAdFailedToLoad",
    prepareRewardVideoAd: "onRewardedVideoAdFailedToLoad",
    prepareRewardInterstitialAd: "onRewardedInterstitialAdFailedToLoad",
  };
  const prepares = [...new Set([...html.matchAll(/AdMob\.(prepare[A-Za-z]*)\(/g)].map(m => m[1]))];
  for (const p of prepares) {
    const ev = PREPARE_FAIL_EVENT[p];
    if (!ev) fail(`AdMob.${p}() is not a known 7.2.0 prepare call (add it to PREPARE_FAIL_EVENT in check.mjs)`);
    else if (!listened.includes(ev)) fail(`AdMob.${p}() has no "${ev}" listener: a failed load is never retried`);
  }
  if (prepares.length) ok(`${prepares.length} AdMob prepare call(s), each with a FailedToLoad listener`);

  // @capgo/native-purchases 7.19.3: consumables need isConsumable:true or Play
  // treats the pack as owned forever (one purchase per player, ever).
  const coinBuy = html.match(/async\s+buyCoinPack\s*\([\s\S]*?\{[\s\S]*?purchaseProduct\(\s*\{([^}]*)\}/);
  if (!coinBuy) fail("Billing.buyCoinPack purchaseProduct({...}) call not found");
  else if (!/isConsumable\s*:\s*true/.test(coinBuy[1])) fail("coin packs are bought without isConsumable:true: each pack can only ever be bought once");
  else ok("coin packs are bought as consumables");
  // Remove Ads is non-consumable: consuming it would make it unrestorable.
  const raBuy = html.match(/async\s+buyRemoveAds\s*\([\s\S]*?\{[\s\S]*?purchaseProduct\(\s*\{([^}]*)\}/);
  if (raBuy && /isConsumable\s*:\s*true/.test(raBuy[1])) fail("Remove Ads is bought with isConsumable:true: it would be consumed and could never be restored");
  // restorePurchases() resolves to void in 7.x; owned items come from getPurchases().
  if (/=\s*await\s+NP\.restorePurchases\(\)/.test(html)) fail("Billing.restore reads the result of restorePurchases(), which returns nothing in native-purchases 7.x: Remove Ads can never be restored");
}

// 6. Old Android WebViews: structuredClone needs Chrome 98+. In loadSave() a
// ReferenceError there also hits the catch fallback, so the game can't boot.
if (/\bstructuredClone\(/.test(html)) warn("structuredClone() is used (needs WebView 98+; on older WebViews the save loader throws and the game doesn't start)");


console.log(fails ? `CHECK: FAILED (${fails} fail, ${warns} warn)` : `CHECK: OK (${warns} warn)`);
process.exit(fails ? 1 : 0);
