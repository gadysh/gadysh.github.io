# #founder notebook + shared biography + header section navigation (2026-11-01)

AI-Bus task task-20261101-163352-task. Implemented personally by Claude (no delegation). Local only: no commit/push/deploy.
Branch hero-poworg-ai-2026-11-01; all earlier uncommitted work preserved (no reset/stash/clean). Existing localhost:4000 watcher used (not restarted).

## Changed / new files
- `index.html`, `en/index.html` — #founder replaced by notebook layout (head / art / bio); HE keeps link "מי אנחנו ›" → /how-we-work/#about; EN no new link. Section ids unchanged.
- `how-we-work/index.md`, `en/how-we-work/index.md` — ONLY the founder bio paragraph replaced by the shared include. Other about text, layout, CTA unchanged.
- `_data/founder.yml` (new) — single canonical bio per language (lead / rest / p2).
- `_includes/founder-bio.html` (new) — renders the bio; `emphasis=true` wraps the opening "יותר מ־15 שנה"/"More than 15 years" in `<strong>` in place (homepage only).
- `_includes/founder-art.html` (new) — scene `<figure>` with HE/EN alt.
- `_data/home_sections.yml` (new) + `_includes/home-sections-list.html` (new) — the ten sections with ACTUAL ids per language (EN solution areas = `#solutions`, HE = `#domains`); hrefs are always `<lang home>#id`, so they work on inner pages.
- `_includes/header.html` — header label "איך עובדים איתנו"/"Working with us" (scoped literal; shared i18n key untouched so footer is unchanged); new "בדף הזה"/"On this page" disclosure; drawer: section list first, then "פתרונות/Solutions" group (existing domain/scenario links), then full-page link "איך עובדים איתנו: לעמוד המלא ›", language link, contact button.
- `assets/js/site.js` — `initPageMenu` (toggle, aria-expanded, Escape → focus button, outside click, focusout, closes on selection, mutual exclusion with solutions menu), `initSectionMarker` (IntersectionObserver → `aria-current="location"`, homepage only), drawer section links close the drawer without stealing focus back to the toggle.
- `assets/css/site.css` — appended blocks: page flyout, current marker, drawer `min(90vw, 440px)` on ivory `#fbf6ee` with sticky footer, scroll-margin for all 11 target ids (header + 12px), #founder notebook grid. Existing smooth scroll already disabled under `prefers-reduced-motion`.
- `_dev/extract_founder_art.py`, `_dev/run_founder_nav_qa.js`, `_dev/shots/founder_nav/*` (new), `assets/img/founder/founder-notebook.webp` (new).

## Artwork provenance
- Source: `founder-notebook-mobile-v1.png` (876x1796, selected concept, unobstructed art region). Desktop mocks not used for pixels (open flyout over the art).
- Crop 0,430–876,1112 → 876x682, native pixels, no upscaling, edges feathered to alpha 0.
- Face: the mock's AI-repainted face is fully covered by the ORIGINAL `assets/img/team/gadi.webp` (360x360) perspective-warped onto the print quad (63,528 / 334,500 / 377,784 / 96,815), 4x supersampled anti-aliased mask; paper clip pixels restored on top. Because it is baked into one image, alignment is identical at every viewport.
- Fidelity limits: the portrait is 360px source mapped to ~280px in the scene → shown ~190px (1440) / ~125px (phone); on 2x displays it is slightly soft. Scene max 876px wide (shown 598px at 1440, full width on phone) — sharp at 1x, mildly soft at 2x on phones. Same scene used for all layouts.

## Real tests (`node _dev/run_founder_nav_qa.js`, puppeteer-core + Chrome, reduced-motion emulated)
HE + EN, viewports 1440/1024/768/390/360 — all pass except one deliberate design difference:
- Bio equality home #founder vs about #about (normalized text) — PASS both languages; no "2025"; process-identification sentence present; about agents paragraph, CTA, footer present.
- Art loaded (876 natural), no horizontal overflow, no bio/art overlap, bio font 18.4–20px; reading side right (HE) / left (EN) at ≥768; phone order heading → art → bio.
- Ten links in flyout and drawer; inner pages link to `/#…` / `/en/#…`.
- Desktop (1440, 1024): flyout open, Escape closes + focus returns, outside click closes, solutions/page flyouts mutually exclusive; all 10 jumps close the flyout, set the hash, land with section top and heading below the 72px header; marker matches target.
- Phone/tablet (768, 390, 360): drawer opens with focus inside, section list first, scrolls to contact + full how-we-work link, Escape closes, jumps to #founder/#process/#contact-cta close drawer, release scroll lock, land below the 60px header.
- "FAIL" at 768: drawer is 440px (57%) — intentional max width for tablet; 90% applies at phone widths (390/360 measured 90%).

Screenshots: `_dev/shots/founder_nav/` (founder per lang/viewport, flyout, drawer top/bottom, about, landing).

## Gaps / not verified
- No full-page visual review of every screenshot within the 900s window; desktop founder HE 1440 inspected visually.
- Tab-trap inside drawer reuses the existing implementation (not re-tested here). Keyboard arrow navigation inside the flyout not added (Tab works).
- Inner-page flyout jump not exercised by click (hrefs verified).
- Live preview: http://localhost:4000/ and /en/ (watcher auto-rebuilt). Not committed.
