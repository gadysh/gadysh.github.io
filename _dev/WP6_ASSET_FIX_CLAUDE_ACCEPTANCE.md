# WP6 asset fix (F-WP6-3) — Claude acceptance

**Result: ACCEPTED** — 2026-10-31, at delivered commit `4fa92b9` (base `7fd8c6d`), branch `site-v2`.
Targeted check only (packet `claude_wp6_asset_fix_2026-10-31.md`, "Claude acceptance"). The full WP6 suite was not re-run.

## Ownership and state
- HEAD `4fa92b9` = the delivered commit. Working tree was clean. No newer acceptance commit. Antigravity inbox was empty, so no other writer was active.

## Diff scope
- `git diff --name-only 7fd8c6d..4fa92b9` outside `_dev/`: only `assets/icons/favicon.png` and `assets/logo-symbol.png`. No HTML/CSS/JS/config/content change.

## Real format (Pillow, read from the file bytes)
| File | Before | After |
|---|---|---|
| favicon.png | JPEG 1024×1024 RGB, 630,837 B | PNG (`89504e470d0a1a0a`) 64×64 RGB opaque, 6,339 B, sha256 `b37de479a07a1ee0…` |
| logo-symbol.png | PNG RGBA 730×710, 435,438 B | PNG RGBA 114×111, alpha kept (corner α=0, mean α 151.45 = Lanczos of original), 26,976 B, sha256 `8e44136073406b28…` |

## Appearance
- I recomputed my own renders from the original files (Lanczos, contained, centered). Mean per-channel difference was under 1.3/255 at every display size. Logo: 32/38/64/76 px on white and dark backgrounds. Favicon: 16/32 px. The 114 px logo and the 64 px favicon are pixel-identical to a Lanczos downscale of the originals. The only differences are resampling noise at the edges: no color shift, crop or transparency change.
- I looked at the worker comparisons `_dev/shots/asset_fix/comparison_header_38px_dpr2.png` and `comparison_favicon_32px.png` myself. They are visually equivalent.

## Independent cold first visit
- Built with `git archive 4fa92b9` → `%TEMP%\wp6_assetfix_claude`, Jekyll stub build (`_config.yml,_dev/_config.stub.yml`). Served by my own server on `127.0.0.1:4041`, which I stopped afterwards. Port 4000 was not touched.
- Chrome 155.0.8059.82 headless, a new browser context per run, CDP cache disabled. Only 127.0.0.1 and Google Fonts were allowed, and 0 requests were blocked (no receiver/analytics calls). The browser requested the favicon itself, so no synthetic fetch was needed.

| Page / UA | Total transferred | Logo | Favicon | Fonts (4 woff2) | ≤ 614,400 B |
|---|---|---|---|---|---|
| `/` desktop (Win Chrome UA, 1366×900 DPR1) | 182,388 B (178.1 KB) | 27,170 | 6,533 | 58,813 | yes |
| `/` mobile (Android Chrome UA, 375×812 DPR2) | 182,343 B | 27,170 | 6,533 | 58,768 | yes |
| `/en/` desktop | 195,819 B | 27,170 | 6,533 | 76,843 | yes |
| `/en/` mobile | 196,031 B | 27,170 | 6,533 | 77,055 | yes |

Before the fix, the same first visit was 1,215,305 B.

Evidence: `_dev/run_wp6_assetfix_claude_weight.js`, `_dev/wp6_assetfix_claude_weight.json`.

## Not claimed
Lighthouse, axe, human screen reader, F-WP6-1 heading, English rows, publication.
