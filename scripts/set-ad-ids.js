#!/usr/bin/env node
/* Swap Google's test AdMob IDs for your real ones in every place they live,
   and switch off test mode. Usage:
     node scripts/set-ad-ids.js \
       --app ca-app-pub-XXXX~YYYY \
       --banner ca-app-pub-XXXX/1111 \
       --interstitial ca-app-pub-XXXX/2222 \
       --rewarded ca-app-pub-XXXX/3333
   Then: npx cap sync android */
const fs = require("fs"), path = require("path");
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) =>
  v.startsWith("--") ? a.concat([[v.slice(2), all[i + 1]]]) : a, []));
const need = ["app", "banner", "interstitial", "rewarded"];
for (const k of need) if (!args[k]) { console.error(`missing --${k}`); process.exit(1); }
if (!/^ca-app-pub-\d+~\d+$/.test(args.app)) { console.error("--app must look like ca-app-pub-123~456"); process.exit(1); }
for (const k of need.slice(1)) if (!/^ca-app-pub-\d+\/\d+$/.test(args[k])) { console.error(`--${k} must look like ca-app-pub-123/456`); process.exit(1); }

const root = path.join(__dirname, "..");
const edit = (rel, fn) => { const p = path.join(root, rel); const s = fs.readFileSync(p, "utf8"); const t = fn(s); if (s === t) console.warn("no change:", rel); fs.writeFileSync(p, t); console.log("updated", rel); };

edit("www/index.html", s => s
  .replace(/(ADMOB_APP_ID:\s*")[^"]+"/, `$1${args.app}"`)
  .replace(/(BANNER_AD_UNIT_ID:\s*")[^"]+"/, `$1${args.banner}"`)
  .replace(/(INTERSTITIAL_AD_UNIT_ID:\s*")[^"]+"/, `$1${args.interstitial}"`)
  .replace(/(REWARDED_AD_UNIT_ID:\s*")[^"]+"/, `$1${args.rewarded}"`)
  .replace(/ADS_TESTING_MODE:\s*true/, "ADS_TESTING_MODE: false"));
edit("capacitor.config.json", s => s.replace(/("appId":\s*")ca-app-pub-[^"]+"/, `$1${args.app}"`));
edit("android/app/src/main/AndroidManifest.xml", s =>
  s.replace(/(APPLICATION_ID"\s*\n\s*android:value=")[^"]+"/, `$1${args.app}"`));
console.log("Done. Run: npx cap sync android");
