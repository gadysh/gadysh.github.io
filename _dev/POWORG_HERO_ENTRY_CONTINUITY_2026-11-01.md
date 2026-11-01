# PowOrg hero → "שתי דרכי פתיחה" continuity — delivery report (2026-11-01)

- Bus task: task-20261101-111546-task (Claude / opus, executed personally, no delegation).
- Worktree: `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2`, branch `hero-poworg-ai-2026-11-01` — **uncommitted**, not merged/pushed/deployed.
- Recovery: the timed-out hero task's saved work (`_includes/hero-art.html`, `assets/img/hero/*`, hero CSS block, `header_theme: dark`, `site-header--dark`) was inspected and **kept unchanged**; this pass continues on top of it.

## What changed
| File | Change |
|---|---|
| `assets/img/entry/entry-defined-process.webp` (746×470) | NEW. Clean crop of the approved "crafted scenes" image 1 — clipboard / highlighted teal step / optical tool. No baked text, controls or dark top band; feathered alpha edges (no rectangular seam). |
| `assets/img/entry/entry-explore.webp` (752×430) | NEW. Same source — organizational miniature with large teal-glass lens. |
| `_includes/entry-card.html` | Optional `image` / `image_w` / `image_h` params → card-less scene layout with teal text-link + chevron. Without `image` the old card/button output is unchanged (styleguide unaffected). `relative_url`, `?intent=` and `data-track-intent` preserved. |
| `index.html` | Section 2 class `section-alt` → `entry-paths-scenes`; the two includes pass the scene images. Copy/intents unchanged. |
| `en/index.html` | Same structure for EN (same text-free images); copy/intents unchanged. |
| `assets/css/site.css` | Appended block "Hero -> Two entry paths continuity": ivory gradient field starting at the colour sampled from the hero artwork's bottom edge, `.hero-art::after` soft fade of the hero's lower edge into it, open columns with thin vertical rule (desktop), stacked on ≤767px, navy headings, teal text links (44px tall targets), direction-aware chevron. |
| `_dev/run_hero_entry_qa.js` | NEW QA script (rendered screenshots + checks). |

The hero conduit ends at its finished-output tray; section 2 scenes are separate (no pipeline drawn into them). Static only — no new animation. Later sections and inner pages untouched.

## Validation (actually run)
Build: `jekyll build -d %TEMP%/hero_entry_build` — OK (7s).
`node _dev/run_hero_entry_qa.js %TEMP%/hero_entry_build` — he/en × 1440 / 390 / 360:
- No horizontal overflow (6/6); no overlap between scene images, headings, paragraphs and links (6/6).
- `dir=rtl` on HE, `ltr` on EN; H2 "שתי דרכי פתיחה" / "Two ways to start".
- Links: `/contact/?intent=defined_process`, `/contact/?intent=explore` (EN: `/en/contact/...`), `data-track-intent` present, height 44px.
- Click on "לשיחה על תהליך מוגדר" navigated to `/contact/?intent=defined_process` and the contact form's intent field = `defined_process`.
- Visual review (by eye) of HE 1440 and HE 390: hero → ivory transition with no visible seam/band/border; PowOrg AI cube readable; CTAs don't touch art.

Screenshots (full hero + section 2):
- `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/hero_entry/he-desktop-1440-hero-entry.png`
- `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/hero_entry/he-mobile-390-hero-entry.png`
- `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/hero_entry/he-mobile-360-hero-entry.png`
- `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/hero_entry/en-desktop-1440-hero-entry.png`
- `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/hero_entry/en-mobile-390-hero-entry.png`
- `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/hero_entry/en-mobile-360-hero-entry.png`
- results: `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/hero_entry/results.json`

Local preview: `jekyll serve --port 4000` from the worktree → http://127.0.0.1:4000/ (and /en/). Not left running by this task.

## NOT run in this pass / remaining issues
- Older checks were not re-run (axe/a11y via `_dev/run_hero_poworg_ai_qa.js`, appearance gate, weight measurement, tablet 768/1024 widths). The previous hero shots in `_dev/shots/hero_poworg_ai/` predate this change.
- EN screenshots were generated and passed the automatic checks, but only the HE ones were reviewed by eye.
- The scenes are crops of the generated concept (≈750px wide source). They look fine at the rendered max 560px; on very high-DPI desktops they will be a bit soft. A higher-resolution clean render of each scene would fix that.
- The desktop vertical rule and spacing are close to the mockup, not an exact match; the mockup's olive-leaf shadow across the ivory is not reproduced.
- Changes are uncommitted on `hero-poworg-ai-2026-11-01`; commit/merge/deploy require Founder approval.

## Follow-up (same day): phone layout fix after Founder screenshot
Problem seen at ~390px: the mobile crop cut the chain after "systems" (no human oversight / finished output, conduit ran off the edge), the art ended in a hard horizontal line, and a large empty gap preceded section 2.
- `assets/img/hero/poworg-ai-hero-{he,en}-mobile.webp` regenerated from the approved 1536 art: crop [24,410 → 1488×550] = full chain documents → PowOrg AI cube → systems → human → output. `_includes/hero-art.html` dimensions and `_dev/run_hero_poworg_ai_qa.js` CROPS updated.
- `assets/css/site.css` (≤1023px): art fades in from the dark wall at the top and out into the ivory (#dccab9) at the bottom (mask + backing gradient), desktop edge overlay disabled, section-2 top padding reduced.
- Re-ran build + `_dev/run_hero_entry_qa.js`: 6/6 no overflow, no overlaps, contact intent click OK. Visual check by eye of HE 390/360.
- Trade-off: the full chain at phone width makes the cube smaller (~95 CSS px wide at 390). "PowOrg AI" stays legible (source is 1488px wide, so it is sharp at DPR 2–3); the small plaque words on the bases are not readable at that size.
