# Glossary

The shared language for Orbit Rush. Use these exact terms in code, docs, commit messages and chat. If a new concept appears, add it here first.

## Play
| Term | Meaning | In code |
| --- | --- | --- |
| **Dot** | The player: orbits a ring, flies off on tap | `Game.dot` |
| **Ring** | A target the dot orbits and lands on | `ring`; current `Game.cur`, next `Game.next` |
| **Release** | The tap that sends the dot off its orbit | |
| **Release indicator** | The tangent aim line; shrinks with level | `INDICATOR_*` |
| **Landing / Perfect** | Reaching the next ring / reaching it near its centre | `classifyShot()`, `PERFECT_FRACTION` |
| **Rings passed** | Rings landed this run; drives difficulty (not score) | `Game.rings` (n) |
| **Easy rings** | The first few rings: big, static, no flips | `EASY_RINGS` |
| **Flip** | The orbit direction reverses | `FLIP_*` |
| **Moving ring** | A target that drifts side to side | `MOVE_*` |
| **Combo** | Score multiplier built by perfects | `Game.combo`, `COMBO_*` |
| **Fever** | Visual mode at high combo | `JUICE_FEVER_COMBO` |
| **Near miss** | A miss by a few pixels, shown as "missed by N px" | `NEAR_MISS_*` |
| **Free save** | The first miss each run bounces back ("SAVED!") | `FREE_SAVES_PER_RUN` |
| **Revive** | Continue after a miss, paid in coins (price grows per use in a run) | `REVIVE_*` |
| **Traffic-light assist** | The next ring's edge tinted by what a release now would score | `TRAFFIC_LIGHT_ASSIST` |
| **Juice** | Feedback effects only (hitstop, zoom, shake) | `Juice`, `JUICE_*` |

## Progress
| Term | Meaning | In code |
| --- | --- | --- |
| **XP / Level** | Earned from score; endless levels | `Progress`, `BASE_XP` |
| **Rank** | Named title by level (Pilot … Singularity) | `RANKS` |
| **Rebirth** | Reset level for a permanent XP multiplier | `REBIRTH_*` |
| **Streak** | Consecutive days played | `S.streak`, `STREAK_*` |
| **Missions** | Generated goals | `Missions` |
| **Unlock** | A shop item opened by lifetime XP | `unlockCost()` |
| **Coins** | Soft currency from runs and coin packs | `coins`, `COINS_*` |
| **Payout** | What a game over adds: coins and XP for score and perfects earned since the run's last payout, so a revived run pays once in total | `Game.payout()`, `runCoins()` |
| **Shop categories** | trail, skin, bg, sound, fx | `SHOP_CATS` |

## Money and reach
| Term | Meaning | In code |
| --- | --- | --- |
| **Banner / Interstitial / Rewarded** | The three ad formats | `Ads` |
| **Remove Ads** | Non-consumable purchase | `IAP_REMOVE_ADS_PRODUCT_ID` |
| **Coin pack** | Consumable purchase | `IAP_COIN_PACKS` |
| **Pending purchase** | A purchase whose payment hasn't cleared (cash, convenience store); never granted until it completes | `Billing.completed()`, `iap_pending` |
| **Reconcile** | Silent boot check of `getPurchases()`: pays completed coin packs not yet paid, consumes them, restores Remove Ads | `Billing.reconcile()`, `S.iapGranted` |
| **Crew invite** | Optional web-only email card after a best or LEGENDARY run | `Crew`, `CREW_*` |
| **Save** | Local progress in localStorage | `S`, `DEFAULT_SAVE`, `SAVE_KEY` |
