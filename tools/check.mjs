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
  const unused = Object.keys(CONFIG).filter(k => !used.has(k));
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

console.log(fails ? `CHECK: FAILED (${fails} fail, ${warns} warn)` : `CHECK: OK (${warns} warn)`);
process.exit(fails ? 1 : 0);
