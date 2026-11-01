# WP6 G1 — Isolated Lighthouse 12.8.2 + axe-core 4.14.0 QA Report

**Date:** 2026-10-31  
**Platform Executor:** Google Antigravity (`pro` layer)  
**Source Packet:** `docs/strategy/website/claude_wp6_g1_packet_2026-10-31.md`  
**Git Revision Tested:** `2081a6d7dc519f3659269f0f0b49009c0d3c9016` (branch `site-v2`, clean tree)  
**Static Server:** `http://127.0.0.1:4061` (port 4000 was untouched)  
**Build Command:** `bundle exec jekyll build --config _config.yml,_dev/_config.stub.yml -d C:\Users\msgad\AppData\Local\Temp\poworg-wp6-g1-20261031\_site_stub` (Jekyll 3.10.0 from clean `git archive`)

---

## 1. Environment & Pinned Tooling

Testing was executed in an isolated directory outside the repo tree to ensure zero contamination of git tracking, dependencies, or global packages.

| Component | Pinned Version / Path | Dist Integrity (Registry Match Verified) |
|---|---|---|
| **Isolated Folder** | `C:\Users\msgad\AppData\Local\Temp\poworg-wp6-g1-20261031` | N/A (Freshly created, private `package.json`) |
| **Node.js** | `v22.14.0` | Active host Node |
| **npm** | `10.9.2` | Active host npm |
| **Google Chrome** | `155.0.8059.82` (`C:\Program Files\Google\Chrome\Application\chrome.exe`) | Active host Chrome binary |
| **lighthouse** | `12.8.2` | `sha512-+5SKYzVaTFj22MgoYDPNrP9tlD2/Ay7j3SxPSFD9FpPyVxGr4UtOQGKyrdZ7wCmcnBaFk0mCkPfARU3CsE0nvA==` (MATCH) |
| **axe-core** | `4.14.0` | `sha512-9WTZxEjsZ7b13TH8JPmbV2z8CHbl80/2hm3XPEG4JgNdQLK81IBRXmSxHfMAOkSqQeRxT/0dwNDz2GOm3zzpcQ==` (MATCH) |
| **puppeteer-core** | `24.43.1` (transitive dep of lighthouse) | `sha512-T5ScUMAsmhdNbgDR41AGESYeS6V9MSgetkSnVhhW+gXvzC42VesKCn5ld87gAZDJ6vLHL9GkRvY9WtQWSnwFbw==` |
| **chrome-launcher**| `1.2.2` (transitive dep of lighthouse) | `sha512-sI90u5qf3854bTrWsQMMdsQfSjjMbeSn7QtxVb9zrikf+QgMfHQ71KepHW7ZfixQKrDlAFKb+qnVlSR+xepBzw==` |

---

## 2. Network Policy Verification

- **Allowed origins:** Strictly `127.0.0.1` and Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`).
- **Blocked URL patterns enforced in Lighthouse:**
  `*script.google.com*`, `*static.cloudflareinsights.com*`, `*cloudflareinsights.com*`, `*linkedin.com*`, `*poworg.com*`
- **Request interception in Puppeteer/axe:** All requests outside `127.0.0.1` and Google Fonts were aborted immediately.
- **Audited origins requested across all runs (from `network-requests`):**
  1. `http://127.0.0.1:4061`
  2. `https://fonts.googleapis.com`
  3. `https://fonts.gstatic.com`
- **Origin check result:** **PASS** (Zero third-party analytics, zero lead receiver contacts, zero unauthorized network requests).

---

## 3. Lighthouse Mobile 12.8.2 Results

Run parameters:
- Device Emulation: Moto G Power (viewport 412×823, DPR 1.75)
- Throttling Method: `simulate` (150ms RTT, 1.6 Mbps throughput, 4× CPU slowdown)
- Categories: Performance, Accessibility, Best Practices, SEO
- Cache: Cold cache (cleared per run)

### Score Table vs Criteria Thresholds

| Page | Performance (≥85) | Accessibility (≥95) | Best Practices (≥90) | SEO (≥95) | Overall Status |
|---|:---:|:---:|:---:|:---:|:---:|
| **Home (`/`)** | **92** (PASS) | **98** (PASS) | **100** (PASS) | **100** (PASS) | **PASS** |
| **Scenario (`/scenarios/recording-to-outputs/`)** | **92** (PASS) | **100** (PASS) | **100** (PASS) | **100** (PASS) | **PASS** |
| **Contact (`/contact/`)** | **92** (PASS) | **98** (PASS) | **100** (PASS) | **100** (PASS) | **PASS** |

### Core Metrics Summary

| Page | FCP | LCP | TBT | CLS | Speed Index | `runtimeError` | `runWarnings` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Home** | 2.7 s | 2.7 s | 0 ms | 0.005 | 2.7 s | `undefined` (None) | `[]` (None) |
| **Scenario** | 2.7 s | 2.7 s | 0 ms | 0.022 | 2.7 s | `undefined` (None) | `[]` (None) |
| **Contact** | 2.7 s | 2.7 s | 0 ms | 0.000 | 2.7 s | `undefined` (None) | `[]` (None) |

### Lighthouse Failed Audits in Target Categories
- **`heading-order` (score: 0):** Failed on `/` (Home) and `/contact/`. Passed on `/scenarios/recording-to-outputs/`.
- **`label-content-name-mismatch` (score: 0):** Failed on all three pages due to `.lang-switch`.

---

## 4. axe-core 4.14.0 Results

Run parameters:
- Injected script: `<g1 folder>/node_modules/axe-core/axe.min.js`
- Test Engine: `axe-core 4.14.0`
- Viewport: 375×812, DPR 2
- Run invocation: `axe.run(document, { resultTypes: ['violations', 'incomplete'] })` after `networkidle0`
- Criterion: **Zero Serious or Critical violations on all three pages (`/`, scenario, `/contact/`)**

### Violation Summary Table

| Page | Minor | Moderate | Serious | Critical | Serious+Critical | Criterion Status | Known F-WP6-1 Flagged? |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Home (`/`)** | 0 | 1 | 1 | 0 | **1** | **FAIL** | **FLAGGED** (Moderate) |
| **Scenario (`/scenarios/recording-to-outputs/`)** | 0 | 0 | 1 | 0 | **1** | **FAIL** | NOT FLAGGED |
| **Contact (`/contact/`)** | 0 | 1 | 1 | 0 | **1** | **FAIL** | **FLAGGED** (Moderate) |
| *Supplementary: English (`/en/`)* | 0 | 1 | 1 | 0 | 1 | N/A (Supplementary) | FLAGGED (Moderate) |

### Incomplete Audits
- `/`: 1 item (`color-contrast`, 9 nodes — requires manual background image/element verification).
- `/scenarios/recording-to-outputs/`: 1 item (`color-contrast`, 13 nodes).
- `/contact/`: 0 items.
- `/en/`: 1 item (`color-contrast`, 7 nodes).

---

## 5. Detailed Findings & Correction Proposals

In strict adherence to the packet rules, **public source files were not modified in this QA unit**. The following analysis maps each failing item to its source location and provides the minimal proposed fix for a future fix unit.

### Finding 1: `label-content-name-mismatch` (NEW FINDING)
- **Severity:** Serious (axe-core impact: `serious`, Lighthouse score: `0`, WCAG 2.5.3 Level A).
- **Criterion Impact:** Causes axe criterion failure (Serious+Critical > 0).
- **Target Element:**
  ```html
  <a href="/en/" class="lang-switch" hreflang="en" lang="en" aria-label="Switch to English website">EN</a>
  ```
- **Explanation:** WCAG 2.5.3 (Label in Name) mandates that when an interactive element contains visible text, that exact text must be included within the accessible name. The visible text is `"EN"`, but the `aria-label` is `"Switch to English website"`, which omits `"EN"`. On `/en/`, the visible text is `"עברית"` and `aria-label` is `"מעבר לאתר בעברית"`.
- **Mapped Source Files & Lines:**
  - `_includes/lang-switch.html:4`
  - `_includes/lang-switch.html:6`
  - `_includes/lang-switch.html:10`
  - `_includes/lang-switch.html:12`
- **Minimal Correction Proposal (for future fix unit):**
  Update `_includes/lang-switch.html` so the accessible name includes the visible string:
  ```html
  <a href="{{ target_url }}" class="lang-switch" hreflang="en" lang="en" aria-label="EN - Switch to English website">EN</a>
  ```
  And for Hebrew:
  ```html
  <a href="{{ target_url }}" class="lang-switch" hreflang="he" lang="he" aria-label="עברית - מעבר לאתר בעברית">עברית</a>
  ```

---

### Finding 2: `heading-order` (KNOWN FINDING F-WP6-1)
- **Severity:** Moderate (axe-core impact: `moderate`, Lighthouse score: `0`, WCAG 1.3.1 Level A).
- **Criterion Impact:** Does not breach the axe zero-serious/critical threshold, but lowers Lighthouse accessibility score from 100 to 98 on `/` and `/contact/`.
- **Failing Nodes & Mapped Sources:**
  1. **Home (`/`):**
     - Section 6 step headers: `<h4>היכרות</h4>` (`index.html:150` under `<h2>איך עובדים</h2>` at line 144, skipping H3).
     - Footer columns: `<h4>תחומי פתרון</h4>` (`_includes/footer.html:6` directly under footer container without preceding H2/H3).
  2. **Contact (`/contact/`):**
     - Contact info card: `<h3 class="mb-4">מה יקרה אחר כך</h3>` (`contact/index.html:34` under `<h1>יצירת קשר</h1>` at line 14, skipping H2).
- **Minimal Correction Proposal (for future fix unit):**
  - In `index.html`: Change the 5 step titles from `<h4>` to `<h3>` (retaining classes/CSS styling).
  - In `_includes/footer.html`: Add a visually hidden `<h2 class="sr-only">ניווט תחתון</h2>` or change column headings to `<h3>` under appropriate hierarchy.
  - In `contact/index.html`: Change `<h3 class="mb-4">` to `<h2 class="mb-4">` or introduce an appropriate `<h2>` container.

---

## 6. Localhost Testing Limitations

The following limitations of localhost testing are explicitly recorded:
1. **Network & Protocol Parity:** The local server runs HTTP/1.1 over unencrypted loopback (`http://127.0.0.1:4061`). Production operates over Cloudflare edge with TLS 1.3 and HTTP/2/3.
2. **Text Compression:** `uses-text-compression` flagged 69 KiB estimated savings because the test server served static files uncompressed. Cloudflare edge applies automatic Brotli/Gzip in production.
3. **Canonical & HTTPS Audits:** `is-on-https` and `canonical` audits passed locally with loopback allowances, but production verification on the custom domain remains standard.
4. **Chrome 155 CDP Compatibility:** Lighthouse 12.8.2 logged minor CDP internal messages (`DOM.pushNodeByPathToFrontend`) from DevTools backend due to Chrome 155 changes, but finished with zero `runtimeError` and 100% valid metric/category outputs.

---

## 7. Artifacts & Deliverables Summary

All deliverables for this QA unit reside exclusively under `_dev/`:

| Artifact | Description |
|---|---|
| `_dev/run_wp6_g1_lighthouse.js` | Standalone Lighthouse runner (starts static server, runs 3 pages, outputs reports, stops server) |
| `_dev/run_wp6_g1_axe.js` | Standalone axe-core runner (supports all pages or single page `node run_wp6_g1_axe.js home`, stops server) |
| `_dev/g1/environment.json` | Environment metadata, resolved versions, integrity checksums, and commands |
| `_dev/g1/lh_{home,scenario,contact}.report.json` | Full Lighthouse JSON reports |
| `_dev/g1/lh_{home,scenario,contact}.report.html` | Full Lighthouse HTML visual reports |
| `_dev/g1/axe_{home,scenario,contact,en}.json` | Full axe-core 4.14.0 JSON outputs |
| `_dev/WP6_G1_REPORT.md` | This formal QA report |

---

## 8. Non-Claims & Quality Status Statement

- **Non-Claims:** This unit does **NOT** claim acceptance of E1/E3, does **NOT** claim a human screen-reader pass (G2), and does **NOT** claim publication readiness (B5).
- **Tooling Status:** Tooling gap G1 is **RESOLVED** with real, pinned, reproducible runs.
- **Criteria Status:**
  - Lighthouse mobile: **PASS** (all 4 categories meet or exceed thresholds on all 3 pages).
  - axe-core mobile: **FAIL** (1 serious violation `label-content-name-mismatch` on all pages; F-WP6-1 `heading-order` moderate confirmed open).
- Both findings are cataloged with exact source file and line mappings for a targeted, separate fix unit.
