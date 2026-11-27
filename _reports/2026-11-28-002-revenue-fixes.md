# 002: Revenue fixes (2026-11-28)

Fixed items 1–5 of `_reports/2026-11-28-001-fresh-review.md` in `www/index.html`, one commit each, then made the check fail on the old bugs. Branch `agent-kit`, nothing pushed. Nothing was run on a device. I tested in node with mocked plugins and in headless Chrome with no plugins.

**Bottom line:** interstitials can now load and show. Coin packs can be bought again and again. Remove Ads restores, including silently at boot after a reinstall. Pending (cash) payments are paid out only once they clear. Ads retry after a failed load. All of this still needs a device test before any Play upload (list in `NOTES.md`).

## Done
- `7748e37` **Fix 1, interstitial events.** Renamed `onInterstitialAdLoaded`/`onInterstitialAdDismissed` to `interstitialAdLoaded`/`interstitialAdDismissed`.
- `bc93753` **Fix 2, consumables.** Coin packs are bought with `isConsumable:true`. Remove Ads is bought with an explicit `isConsumable:false`.
- `7760131` **Fix 3, restore.** New `Billing.reconcile()` reads `getPurchases({productType:"inapp"})`.
  - Restore calls `restorePurchases()` first, then `reconcile()`.
  - `Billing.init` also runs `reconcile()` silently on native: no toast and no error shown.
  - If Remove Ads is restored while the banner is still loading, `Ads.init` now takes the banner down.
- `af4b4b7` **Fix 4, completed purchases only.**
  - Coins and Remove Ads are granted only when `purchaseState==="1"`.
  - A pending payment shows the new `iap_pending` message, in all five languages.
  - At boot, `reconcile()` pays any completed coin pack that hasn't been paid yet, then consumes it with `consumePurchase()`. It also sets Remove Ads if owned.
  - Purchase tokens that have been paid are kept in a new save field, `S.iapGranted` (default `[]`, at most `CONFIG.IAP_GRANTED_MAX` = 200). `SAVE_KEY` is unchanged and old saves load fine.
  - Restore now also counts any coin packs it recovers before deciding to say "No purchases to restore".
- `d239236` **Fix 5, ad retry.** Added the `interstitialAdFailedToLoad` and `onRewardedVideoAdFailedToLoad` listeners.
  - A failed load retries after `CONFIG.ADS_RETRY_BASE_S` (5 s), doubling up to `ADS_RETRY_MAX_S` (120 s), and resets on a successful load.
  - Only one retry is ever waiting per ad format. The plugin reports a failure through both the event and the rejected `prepare*` promise, so this stops one failure being retried twice.
  - Interstitials are no longer loaded once Remove Ads is owned.
- `640a675` **Check.** These are now `fail()` in `tools/check.mjs`:
  - wrong AdMob event names
  - coin packs bought without `isConsumable:true`
  - reading `restorePurchases()`'s result
  - (new) any `prepare*` call without its FailedToLoad listener
  - (new) Remove Ads bought as consumable

  I proved each one catches the old code by running the check against `index.html` from before each fix commit. The old code got 5 fails, and each fix cleared exactly its own fail. The Remove Ads fail was proven with a temporary edit.
- Docs commit (`CODING_STANDARDS.md`, `GLOSSARY.md`, this report, `NOTES.md`, `CLAUDE.md`, brief status):
  - New rule in `CODING_STANDARDS.md`: "Grant IAP only on a completed purchase; reconcile getPurchases() at boot; never grant a purchase token twice."
  - New glossary terms: **Pending purchase** and **Reconcile**.
- `bash tools/check.sh` passes (0 fail, 3 warn: test ad IDs, `ADS_TESTING_MODE`, `structuredClone`).
- The web build in headless Chrome with no plugins boots with no errors, and the coin tab hides itself.

### API details confirmed from the pinned tarballs (`npm pack`, `.d.ts` plus Android source)
- **`@capacitor-community/admob` 7.2.0:**
  - Interstitial events: `interstitialAdLoaded`, `interstitialAdFailedToLoad`, `interstitialAdShowed`, `interstitialAdFailedToShow`, `interstitialAdDismissed`.
  - Rewarded events: `onRewardedVideoAdLoaded`, `onRewardedVideoAdFailedToLoad`, `onRewardedVideoAdShowed`, `onRewardedVideoAdFailedToShow`, `onRewardedVideoAdDismissed`, `onRewardedVideoAdReward`.
  - The FailedToLoad payload is `AdMobError {code, message}`, and `prepare*` returns `Promise<AdLoadInfo>`.
  - On Android, `showInterstitial()` with nothing loaded also emits `interstitialAdFailedToLoad`. The retry handles that case too.
- **`@capgo/native-purchases` 7.19.3:**
  - `purchaseProduct({productIdentifier, productType, quantity, isConsumable, autoAcknowledgePurchases})` returns a `Transaction`. `isConsumable` defaults to `false`.
  - `restorePurchases()` returns `Promise<void>`. On Android it only acknowledges unfinished purchases.
  - `getPurchases({productType})` returns `{purchases: Transaction[]}`, and that list includes pending purchases.
  - `consumePurchase({purchaseToken})` is present. The `.d.ts` says "@since 8.2.0", but it is in the 7.19.3 `.d.ts` and in the Android source.
  - `Transaction.purchaseState` `"1"` means PURCHASED. `purchaseToken` and `orderId` are always present on Android.
  - In the Android source, `purchaseProduct` resolves only on PURCHASED and rejects with `"Purchase is pending"` for PENDING. That message is what the game checks for.
  - The `.d.ts` says pending is `"0"`, but Play Billing's PENDING value is 2 (0 means unspecified). The code trusts only `"1"`, so it is safe either way.

## Blocked
Nothing.

## Needs Eugene
1. **Silent coins at boot.** When a pending payment clears, its coins are added at the next launch with no toast, because the brief says the boot check is silent. Do you want a "+N coins" toast in that case? *Door:* two-way. *Blast radius:* small.
2. **A pending purchase is only picked up at the next launch.** The pending message says so in all five languages. The game could also check when it returns to the foreground; I added this to Ideas in `NOTES.md`. *Door:* two-way. *Blast radius:* big (billing).
3. **A tiny window where paid coins can be lost.** With `isConsumable:true` (as the brief asks), the plugin consumes the pack on the phone just before handing the result to the game. If the app is killed in that instant, the purchase is gone from `getPurchases()` and the coins are never paid. A zero-loss option: buy packs with `isConsumable:false`, save the grant, then call `consumePurchase()`. The boot check already consumes leftovers, so it would cover a crash. That needs your OK, because it reverses the brief and the new check. *Door:* two-way. *Blast radius:* big (billing).
4. **Translations of `iap_pending`.** es, pt-BR, id and fil are mine. Ask a native speaker to check them before launch.
5. **No server-side receipt check.** Purchases are trusted on the phone, which is standard for a small hypercasual game. Noting it for later.
6. **Test on a device before upload.** The list is in `NOTES.md`.
