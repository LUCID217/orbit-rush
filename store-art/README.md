# Store art

Generators for the Google Play listing art. Every screenshot is captured from the real game in `www/index.html`. Nothing is mocked up.

- `icon.js out` draws the 512×512 Play icon (`out/store/icon.png`) and the Android launcher icons (adaptive background, foreground and monochrome layers plus legacy icons) in `out/res/`.
- `feature.js out/store/featureGraphic.png` draws the 1024×500 feature graphic. It has no text other than the game name, so one file serves every language.
- `capture.js en,es,pt-BR,id,fil` plays the game with a bot that taps on PERFECT shots and saves raw 1080×2160 screens into `raw/`. `flight.js <langs>` re-takes only the custom-look flight shot.
- `compose.js en,es,pt-BR,id,fil out/meta` adds the captions from `captions.json` and writes 1080×1920 JPEGs laid out the way fastlane `supply` expects. Spanish is written to both `es-419` and `es-ES`.

Then copy `out/meta/*` into `../fastlane/metadata/android/`. To run these, you need Node and Playwright (`npm i -D playwright`, then `npx playwright install chromium`).

The caption rules follow Play policy: no rankings, "#1", "best", prices or promotions. Each caption describes something that's in the game and visible in its screenshot.
