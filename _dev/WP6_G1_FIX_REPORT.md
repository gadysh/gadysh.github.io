# WP6 G1 Remediation Report: Accessible Name + Heading Order (A1, H1–H3)

**Date:** 2026-10-31  
**Platform Executor:** Google Antigravity (`pro` model, `high` effort)  
**Source Remediation Packet:** `docs/strategy/website/claude_wp6_g1_remediation_packet_2026-10-31.md`  
**Base HEAD:** `2bd52d6` (*EN copy: insert Founder-approved F12-F37, F39 (F38 deferred)*, parent `07b1192`)  
**Target Branch:** `site-v2` only  
**Isolated Test Root:** `C:\Users\msgad\AppData\Local\Temp\poworg-wp6-g1-20261031`  
**Static Server Ports:** 4061 / 4062 (Port 4000 was untouched)

---

## 1. Start Guard Verification

All 4 start guard checks passed prior to modifying any repository files:

| Guard Condition | Expected | Verified Result | Status |
|---|---|---|:---:|
| Working tree state | Clean, on branch `site-v2` | `site-v2`, clean working tree | **PASS** |
| HEAD revision | `2bd52d6` (parent `07b1192`) | `2bd52d6` (parent `07b1192`) | **PASS** |
| Active ai-bus tasks | No other task in `processing/` for `gadysh-site-v2` | Only this task in `processing/` | **PASS** |
| `en/contact/index.html` structure | Both `<h3>` headings present in `.contact-col-info` | Lines 34 & 49 contain `<h3>` headings | **PASS** |

---

## 2. Summary of Implemented Remediation

Strictly limited to the packet's approved scope across 6 source files:

1. **A1 (`_includes/lang-switch.html`):** Updated `aria-label` attributes to incorporate visible text while preserving visible text, href, hreflang, lang, and classes:
   - English switch: `aria-label="EN, switch to English website"`
   - Hebrew switch: `aria-label="עברית, מעבר לאתר בעברית"`
2. **H1 (`index.html` & `en/index.html`):** Changed the 5 step titles in Section 6 from `<h4>` to `<h3>`, preserving attributes and text.
3. **H2 (`_includes/footer.html`):** Changed the 4 column titles from `<h4>` to `<h2>`, preserving Liquid interpolations and text.
4. **H3 (`contact/index.html`):**
   - Line 34: Changed `<h3 class="mb-4">` to `<h2 class="mb-4">`.
   - Line 49: Changed `<h4 class="mb-2">` to `<h3 class="mb-2">`.
5. **H3-en (`en/contact/index.html`):** Changed both `<h3>` headings in `.contact-col-info` to `<h2>`.
6. **CSS Equivalence (`assets/css/site.css`):**
   - Extended `.work-step-col h4` selector to `.work-step-col h3, .work-step-col h4`.
   - Extended `.footer-col h4` selector to `.footer-col h2, .footer-col h4` and added `letter-spacing: inherit;` (neutralizing global `h2` -0.01em).
   - Added `.contact-col-info h2 { font-size: 1.25rem; letter-spacing: inherit; }` (preserving previous global `h3` styling).
   - Added `.contact-col-info h3 { font-size: inherit; }` (preserving previous `h4` styling).

---

## 3. Appearance Gate Results (Mandatory Gate)

Both base HEAD (`2bd52d6`) and the remediated change were built into isolated temporary directories (`_site_base` and `_site_fix`), served on `127.0.0.1:4061` and `127.0.0.1:4062`. All font assets were loaded to ensure complete visual determinism.

Evaluated properties: `font-size`, `font-weight`, `line-height`, `letter-spacing`, `color`, `margin-*`, `display`, and bounding box coordinates (`x`, `y`, `width`, `height`).

| Page | Viewport | Dimensions | Evaluated Targets | Style & BBox Mismatches | Full-Page Pixel Buffer Match | Gate Status |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Home (`/`)** | Mobile | 375×812 (DPR 2) | 10 | 0 | **Exact Buffer Match (0 diff)** | **PASS** |
| **Home (`/`)** | Desktop | 1280×800 (DPR 1) | 10 | 0 | **Exact Buffer Match (0 diff)** | **PASS** |
| **English Home (`/en/`)** | Mobile | 375×812 (DPR 2) | 10 | 0 | **Exact Buffer Match (0 diff)** | **PASS** |
| **English Home (`/en/`)** | Desktop | 1280×800 (DPR 1) | 10 | 0 | **Exact Buffer Match (0 diff)** | **PASS** |
| **Contact (`/contact/`)** | Mobile | 375×812 (DPR 2) | 7 | 0 | **Exact Buffer Match (0 diff)** | **PASS** |
| **Contact (`/contact/`)** | Desktop | 1280×800 (DPR 1) | 7 | 0 | **Exact Buffer Match (0 diff)** | **PASS** |
| **English Contact (`/en/contact/`)** | Mobile | 375×812 (DPR 2) | 7 | 0 | **Exact Buffer Match (0 diff)** | **PASS** |
| **English Contact (`/en/contact/`)** | Desktop | 1280×800 (DPR 1) | 7 | 0 | **Exact Buffer Match (0 diff)** | **PASS** |

**Appearance Gate Conclusion:** **PASS (100% Visual Equivalence across all 8 configurations).**

---

## 4. axe-core 4.14.0 Validation Results

Re-run with existing isolated runner into `_dev/g1_fix/`.

| Page | Engine Version | Minor | Moderate | Serious | Critical | Serious+Critical | `heading-order` Flagged | Result |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Home (`/`)** | 4.14.0 | 0 | 0 | 0 | 0 | **0** | **NOT FLAGGED** | **PASS** |
| **Scenario (`/scenarios/recording-to-outputs/`)** | 4.14.0 | 0 | 0 | 0 | 0 | **0** | **NOT FLAGGED** | **PASS** |
| **Contact (`/contact/`)** | 4.14.0 | 0 | 0 | 0 | 0 | **0** | **NOT FLAGGED** | **PASS** |
| **English (`/en/`)** | 4.14.0 | 0 | 0 | 0 | 0 | **0** | **NOT FLAGGED** | **PASS** |
| *English Contact (`/en/contact/`)* | *N/A* | - | - | - | - | - | - | *Not run (runner omitted)* |

- **Serious/Critical Violations:** **0** on all pages (was 1 serious `label-content-name-mismatch` in G1).
- **`heading-order` Violations:** **0** on all pages (was moderate `heading-order` in G1).
- **Incomplete Items:** Only `color-contrast` remains open for manual verification (identical to baseline).

---

## 5. Lighthouse 12.8.2 Validation Results

Re-run with existing isolated runner into `_dev/g1_fix/`.

### Category Scores vs G1 Baseline

| Page | Performance | Accessibility (Baseline → Fix) | Best Practices | SEO | `runtimeError` |
|---|:---:|:---:|:---:|:---:|:---:|
| **Home (`/`)** | 92 | 98 → **100** | 100 | 100 | None |
| **Scenario (`/scenarios/recording-to-outputs/`)** | 92 | 100 → **100** | 100 | 100 | None |
| **Contact (`/contact/`)** | 92 | 98 → **100** | 100 | 100 | None |

### Key Audit Audits

| Audit ID | Home Score | Scenario Score | Contact Score | Status |
|---|:---:|:---:|:---:|:---:|
| `heading-order` | **1** (PASS) | **1** (PASS) | **1** (PASS) | **RESOLVED** |
| `label-content-name-mismatch` | **1** (PASS) | **1** (PASS) | **1** (PASS) | **RESOLVED** |

---

## 6. Keyboard Navigation & Language Switch Verification

| Page | `.lang-switch` Text | `.lang-switch` `href` | `aria-label` | Drawer Lang Link `href` | Tab Reaches Element | Tabs Needed |
|---|:---:|:---:|---|:---:|:---:|:---:|
| `/` | `EN` | `/en/` | `EN, switch to English website` | `/en/` | **Yes** | 5 |
| `/en/` | `עברית` | `/` | `עברית, מעבר לאתר בעברית` | `/` | **Yes** | 5 |
| `/contact/` | `EN` | `/en/contact/` | `EN, switch to English website` | `/en/` | **Yes** | 5 |
| `/en/contact/` | `עברית` | `/contact/` | `עברית, מעבר לאתר בעברית` | `/` | **Yes** | 5 |

- All destination URLs (`href`) remain unchanged.
- Mobile drawer language link remains unchanged.
- Keyboard focus cleanly reaches `.lang-switch` on all tested pages.

---

## 7. Deliverables & Modified Files

All changes are strictly bounded:
- `_includes/lang-switch.html`
- `index.html`
- `en/index.html`
- `_includes/footer.html`
- `contact/index.html`
- `en/contact/index.html`
- `assets/css/site.css`
- `_dev/run_wp6_g1_axe.js` & `_dev/run_wp6_g1_lighthouse.js` (output directory pointed to `_dev/g1_fix/`)
- `_dev/run_appearance_gate.js` (Appearance Gate automated comparison harness)
- `_dev/g1_fix/` (Lighthouse & axe raw JSON + HTML reports)
- `_dev/WP6_G1_FIX_REPORT.md` (this report)
- `_dev/g1/` remains strictly unchanged vs `07b1192`.

---

## 8. Non-Claims & Quality Boundaries

- **Non-Claims:** This remediation does **NOT** claim acceptance of E1/E3, does **NOT** claim resolution of F38 (deferred), does **NOT** claim G2 (human screen reader verification pass), and does **NOT** constitute release approval.
- **Environment Parity:** No external packages installed, no push/merge to `main`, no modification of `_config.yml` or production endpoints.
