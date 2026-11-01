# PowOrg — "איך עובדים" five-stage journey (HE + EN) — 2026-11-01

Status: **COMPLETED** (implemented and verified by Claude personally; no delegation).
Task: `task-20261101-150226-task` (from codex). Branch `hero-poworg-ai-2026-11-01`,
worktree `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2`. No commit, push, merge, stash or reset.
All earlier uncommitted work (hero/entry/domains/scenarios/difference) preserved as found.

## Approved references
- Desktop: `PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/process-five-stages-desktop-v1.png` (1586x992)
- Phone: `.../process-five-stages-mobile-v1.png` (876x1796)

## Files
Changed:
- `index.html` — only the `#process` section (lines of the old `.work-steps-row` block) replaced.
- `en/index.html` — only the `#process` section replaced.
- `assets/css/site.css` — appended a scoped `.process-journey` block at the end, plus one adjacency rule
  `.difference-shared:has(+ .process-journey) { --difference-fade-to: #f9eee2; }` (section-5 bottom fade).
  The old `.work-steps-row/.work-step-col/.step-num-badge` rules are untouched (still available to other pages).

New:
- `_includes/process-stage.html` — one `<li>` per stage (visual ordinal `aria-hidden`, `<h3>` title, `aria-hidden` `<picture>`).
- `assets/img/process/process-{1..5}-desktop.webp` (327x318, 285x315, 325x310, 330x282, 310x258)
- `assets/img/process/process-{1..5}-mobile.webp` (426x264, 392x246, 422x274, 395x254, 415x214)
- `_dev/extract_process_art.py` — reproducible extraction (native crops, feathered alpha edges, no upscaling).
- `_dev/run_process_five_stages_qa.js` — render QA.
- `_dev/shots/process_five_stages/` — screenshots + `qa-results.json`.

## Implementation
- Markup: `<section class="section process-journey" id="process" aria-labelledby="process-title">` → `<h2 id="process-title">`
  → `<ol class="process-stages">` with five `<li>` in source order 1..5 → footer note (+ HE link).
- Copy is exact (HE/EN H2, five stage titles, footer note). No descriptions, metrics, timelines or claims added.
- HE onward link kept: `איך עובדים ›` → `{{ '/how-we-work/' | relative_url }}`, same `btn btn-secondary` class.
  EN had no onward link before; none added.
- Surface: continues section 5's ivory `#f9eee2`; section 5 now fades into it (no white/grey stripe). The section
  fades at its bottom to the next band (`--surface` in HE, `--surface-alt` in EN via `:has(+ .section-alt)`), so
  #technology is untouched.
- Desktop (>= 1024px): 5-column grid following document direction (HE 1 at right → 5 at left; EN 1 at left → 5 at right),
  teal ordinal + label above each station, stations bottom-aligned, one faint native teal path line at connector height.
- Phone/tablet (< 1024px): vertical list top-to-bottom; ordinal on the start side on a thin teal path, label, scene on
  the end side; quiet hairline between stages. All five visible in natural scroll; no accordion/hiding.
- Art: desktop uses the five stations cropped from the desktop mock; phone/tablet uses the five scenes cropped from the
  phone mock (`<picture>` + `media="(min-width: 1024px)"`). Baked mock titles, ordinals, rules and button excluded.
- Anchor: `scroll-margin-block-start` = header height (60px phone / 72px desktop) on `.process-journey`.
- No animation added; nothing touches reduced-motion behaviour.

## Checks actually run
- `jekyll build -d %TEMP%/process_build`: OK (1.6 s). 5 `process-stage` items in `/index.html` and `/en/index.html`.
- `node _dev/run_process_five_stages_qa.js %TEMP%/process_build` — **ALL OK** for HE + EN at 1440, 1024, 768, 390, 360:
  - h2 text; `<ol>` with exactly 5 `<li>`; titles exact and in order 1..5; ordinals 1..5; footer note exact.
  - visual order: desktop HE x decreasing / EN x increasing on one row; phone/tablet y increasing; phone ordinal on
    start side and scene on end side (RTL/LTR).
  - all 10 images loaded; no image clipped by viewport; 0 text/image box overlap; 0 document/section horizontal overflow.
  - min stage-title font: 20.4px (1440), 17.6px (1024), 22.1px (768), 18.7px (390), 18.4px (360).
  - rendered scene widths: desktop 207-240px @1440, 173-201px @1024; phone 162-176px @390, 146-158px @360, 362-394px @768.
  - section 5 bottom == section 6 top (no gap); HE link href `/how-we-work/`, target returns 200; EN has no link.
  - direct `#process` navigation: h2 top 120px vs sticky header bottom 72px (desktop/1024); 92px vs 60px (phone/768).
- Live preview `http://127.0.0.1:4000/` (Founder's server, not restarted/replaced): already serving the new section
  (5 `process-stage` items in `/` and `/en/`), i.e. its watcher regenerated.

## Screenshots (`_dev/shots/process_five_stages/`)
`{he,en}-{desktop-1440,tablet-1024,tablet-768,mobile-390,mobile-360}-{section,transition,anchor}.png`
(30 files) + `qa-results.json`. Inspected visually: he-desktop-1440-section, he-desktop-1440-transition,
he-mobile-390-section, en-tablet-1024-section, en-mobile-360-section.

## Comparison with approved mocks / material differences
- Desktop HE matches the mock composition: heading on the reading side, five stations right→left with teal ordinals and
  labels above, shared teal path, note + `איך עובדים ›` button below. Differences: labels fit on one line at 1440
  (mock wraps two lines); stations sit in one level row instead of the mock's slight perspective diagonal; neighbouring
  stations no longer physically join — their baked connector stubs fade at feathered edges and a native thin teal line
  carries the path between them; faint tonal halos around some stations where the mock floor (dappled light) is a
  shade different from the flat ivory field.
- EN desktop uses the same station art in LTR order (no mirroring, so screen glyphs like `</>` stay correct). The baked
  connector stubs therefore point to the "wrong" neighbour side in EN; at this scale they read as generic connectors.
- Phone matches the mock structure (vertical path, ordinals on start side, scenes opposite, rules, note, button).
  Rendered scenes are smaller than in the mock at 360/390 (≈146-176px vs ≈48% of width in the mock) to keep labels ≥18px.
  At 360 EN, "Measurement," sits close to the stage-5 scene's feathered edge (no box overlap).
- Desktop vs phone art differ in arrangement (from the two independent mocks) but keep each stage's meaning:
  1 two chairs + table + open brief + speech cue; 2 process blueprint + teal lens (phone adds boundary blocks = scope);
  3 laptop/terminal + wrench + server/connector; 4 user workstation (desktop: seated user; phone: hand on checklist
  screen + manual = rollout/training cue); 5 bar chart + dial (desktop: up-arrow; phone: three "+" = expansion).
  No numerical outcomes in any art.
- 1024px tablet uses the desktop five-station row (labels 17.6px, readable, no squeeze); 768 and below use the vertical
  path. If the Founder wants 1024 portrait-style too, change the breakpoint in the `.process-journey` desktop media query
  and the `<source media>` in `_includes/process-stage.html`.

## Resolution / fidelity
Native mock pixels only, never upscaled. Desktop stations are 285-330px native and render at 173-240px (downscaled,
sharp at DPR 1; at DPR 2 they are ~1.4x upsampled by the browser, so soft compared to native retina art). Phone scenes
are 392-426px native, render at 146-176px on phones (sharp up to DPR ~2.5) and 362-394px at 768 (≈ native, soft at DPR 2).
The source mocks themselves are AI-rendered at modest resolution; higher-resolution re-renders would be needed for
crisp retina art.

## Untouched
`#technology`, `#fit`, `#founder`, `#contact-cta` and footer markup/CSS not edited in either language (edit was a slice
replacement of `#process` only + appended scoped CSS). Only adjacent continuity: section 5's bottom fade colour.

## Session identity
Read from the running process environment (not inferred): `CLAUDE_CODE_SESSION_ID=6b5f8a4e-f32f-4ad5-9f41-ea552dc11c56`,
`CLAUDE_CODE_ENTRYPOINT=sdk-cli`, `CLAUDE_CODE_CHILD_SESSION=1`, `CLAUDE_CODE_SESSION_ATTENDED=0`, cwd
`C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2`, model Opus 5.5, effort high. This confirms the headless bus-opened
session received and ran the task; it does not prove the session is shown in the native Claude UI — check that separately.
