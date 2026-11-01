# PowOrg homepage #fit — light background (2026-11-01)

AI-Bus task task-20261101-160342-he-en. Implemented personally by Claude (Opus 5.5) in this session:
no Antigravity, other platform or subagent. Local, reviewable only: not committed, pushed, merged or deployed.
Standing rules, SETUP, AGENTS and organization decisions were not touched.

## What changed
- `index.html`, `en/index.html`: only the `#fit` section was replaced (`section-sand` cards became `section fit-light`,
  `aria-labelledby="fit-title"`). The DOM order is heading+intro, scene, `<ul>` with 4 `<li>`, closing note.
  The copy is the existing HE/EN text, verbatim; the HE third line keeps the plural "ספק מערכות".
  The scene is decorative (`aria-hidden="true"`, `alt=""`) because the native text carries the meaning. The check marks
  are CSS `::before` background SVGs (static, not controls).
- `assets/css/site.css`: a new appended block "Homepage section 8 — Who it fits", scoped to `.fit-light` / `.fit-*`.
  It uses a warm ivory field `#fcf2e5` sampled from the mocks, ink copy, teal check circles, thin teal separators and a
  2px teal rule above the note.
  - <768px: phone derivative.
  - 768–1199px: wide desktop derivative, max 820px centered, with a single-column list under it.
  - ≥1200px: a 4.5fr/7.5fr grid with copy on the reading side (right HE, left EN) and the scene opposite.
  - Sticky-header clearance uses `scroll-margin-block-start`.
  - The old `.fit-grid/.fit-item` rules were left untouched; other pages may still use them.
- New: `assets/img/fit/fit-scene-desktop.webp` (895×620), `assets/img/fit/fit-scene-mobile.webp` (897×620),
  `_dev/extract_fit_art.py`, `_dev/run_fit_light_qa.js`, `_dev/shots/fit_light/`.
- Unchanged: `#founder`, `#contact-cta`, footer, the technology section, navigation, contact routes and analytics hooks.
  The QA run confirmed the section order technology → fit → founder.
  Other uncommitted work from earlier sessions (`entry-card.html`, `header.html`, earlier CSS/HTML sections) was preserved
  and not touched.

## Artwork provenance
Both scenes come from the Founder-approved mocks in `PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/`.
- Desktop/tablet: `fit-light-desktop-v1.png` box (20,220)-(915,840). It stops before the baked list at x≈930.
- Phone: `fit-light-mobile-v1.png` box (0,345)-(897,965). It sits below the baked intro and above the baked list.

Both are native pixels with no upscaling. Edges are feathered to alpha 0 (desktop 44px, phone 30px) onto the matching
ivory. No baked heading, list, check marks, note or the dark top strip is included.

## Validation actually run
`node _dev/run_fit_light_qa.js` was run against the live watcher at http://localhost:4000. The output is in
`_dev/shots/fit_light/qa-output.txt`. Result: **ALL PASS, 10/10** (HE+EN × 1440, 1024, 768, 390, 360).

Each run checks:
- the exact h2, intro, four items and note;
- the image is loaded, and the correct derivative is chosen per breakpoint;
- no copy/art overlap and no horizontal overflow;
- the reading side at ≥1200px (HE right, EN left), and stacked layout below 1200px;
- minimum text contrast against the field is 14.0:1;
- there are 0 controls inside #fit;
- the h2 lands below the sticky header after `#fit` navigation;
- previous section = technology and next section = founder, with a 0px gap on both sides.

Rendered scene width: 690px at 1440, 820px at 1024, 720px at 768, 358/328px on phones. Native size is 895/897px, so no
upscaling happens at DPR 1. At DPR 2 on desktop the image is about 0.65× of the needed density, so it looks slightly soft.

The Jekyll build was the existing localhost:4000 watcher, which auto-regenerated. It was not restarted.

Screenshots in `_dev/shots/fit_light/`:
- `{he,en}-{desktop-1440,tablet-1024,tablet-768,mobile-390,mobile-360}-fit.png`
- `*-tech-fit.png` / `*-fit-founder.png`

## Limitations / gaps (honest)
- The `*-tech-fit.png` adjacency clips are offset: they show the top of #fit rather than the technology→fit seam. The 0px gap
  and the order were verified numerically, but the seam was not visually reviewed in a correct clip.
- Old fingerprint QA scripts that expected #fit unchanged were not run, on purpose.
- There are no HiDPI (2×) source assets, because the mocks are the only clean artwork source at this resolution.
- On phones the right-hand IT character's arm meets the feathered image edge. This matches the mock's own crop.
- The HE founder section is `section-sand` (#f7f3ec), right after the ivory #fcf2e5. The change in tone is slight and
  intentional, not an extra band. EN founder is white.

## Preview
http://localhost:4000/#fit and http://localhost:4000/en/#fit (existing watcher).
