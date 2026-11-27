# 0003: Capacitor 7 with pinned plugin versions

**Date:** 2026-11 · **Status:** Accepted

**Decision:** Android via Capacitor 7. `@capacitor-community/admob` is pinned to 7.2.0 and `@capgo/native-purchases` to 7.19.3; the ad event names used are v7-specific.

**Don't:** bump a plugin's major version without updating `Ads`/`Billing` and testing on a device.
