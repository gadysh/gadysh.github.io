# Homepage section 5 — "What sets us apart" (difference-shared), HE + EN — 2026-11-01

- Task: `task-20261101-141145-task` (from codex; implemented and verified by Claude personally, no delegation).
- Native Claude session: `d7864510-7a59-4eb6-9455-214fd934d58d` (env `CLAUDE_CODE_SESSION_ID`; transcript
  `~/.claude/projects/C--Users-msgad-Documents-AI-PowOrg-gadysh-site-v2/d7864510-7a59-4eb6-9455-214fd934d58d.jsonl`), cwd
  `C:\Users\msgad\Documents\AI\PowOrg\gadysh-site-v2`. A new task, so a new session ID, not the predecessor's.
- Branch / worktree: `hero-poworg-ai-2026-11-01`, uncommitted. Nothing committed, pushed, merged or deployed.
- Approved sources: `difference-shared-desktop-v1.png` (semantic/art source) and `difference-shared-mobile-v1.png`
  (phone layout principle), `difference_visual_session_2026-11-01.md`.

## What was done

- `#difference` in `index.html` and `en/index.html` rebuilt: real `h2` + three `h3`/`p` peer groups, copy unchanged
  character for character (HE keeps `<bdi>AI</bdi>`). One decorative static image (`alt=""`, inside an `aria-hidden` wrapper), no CTA, link or button.
  The old `pillars-grid`/`pillar-card` CSS is left in place because `styleguide/index.html` still uses it.
  The EN section lost `section-alt`; the ivory background replaces it.
- Sculpture asset: `assets/img/difference/difference-shared-sculpture.webp` (955×515, 95.6 KB, alpha-feathered edges),
  cut from the approved desktop mockup at native pixels by `_dev/extract_difference_art.py`. The mock's heading/body text column is
  outside the crop, and two stray glyph fragments at the right edge are hard-masked. The same asset is used at every breakpoint,
  so the meaning stays the same everywhere: AI glass control core, process/permissions/exception map, dev terminal + wrench/integration rack,
  one warm stone platform with the PowOrg plate and teal connections.
- Layout: phone/tablet (<1024) heading → sculpture → three groups. Desktop (≥1024) text column on the reading side
  (right in HE, left in EN), sculpture opposite (left in HE, right in EN). Quiet teal hairlines between groups, no cards.
- Transition:
  - **Note:** the CSS currently ends with a "Section 4 — dark variant" block (`#092b3b` scenarios wall, marked
    "Founder preview request 2026-11-01… Delete this block to return to the ivory version"). It was added just before this task and is
    not in the predecessor report. I kept it unchanged.
  - With it active, section 5 starts with a short eased fade (~150px) from the dark wall into the ivory field, so there is no hard
    dark/ivory seam. This rule (`.scenarios-editorial + .difference-shared`) is labelled "delete together" with the dark variant.
  - If the dark variant is removed, `.scenarios-editorial:has(+ .difference-shared)` makes the ivory scenarios section end in the
    section-5 ivory, not white. That ivory fallback was **not** rendered or tested in this pass.
  - Section 5 ends by fading into the next section's background (HE `section-alt` #f4f7fa, EN white).
- No animation was added and no shared templates were changed.

## Changed / new files (this task only)

- `index.html` (only the `#difference` section)
- `en/index.html` (only the `#difference` section)
- `assets/css/site.css` (appended a "Homepage section 5" block at the end; nothing existing was edited)
- new `assets/img/difference/difference-shared-sculpture.webp`
- new `_dev/extract_difference_art.py`, `_dev/run_difference_shared_qa.js`, this report, `_dev/shots/difference_shared/`

All earlier uncommitted work (hero, entry paths, domains, scenario rows, includes, assets, reports) was kept. No reset, stash or discard.

## Checks actually run

- `jekyll build -d %TEMP%/difference_build`: OK. 3 `.difference-group` in `/index.html` and 3 in `/en/index.html`.
- `node _dev/run_difference_shared_qa.js %TEMP%/difference_build` (Chrome/puppeteer-core) at 1440, 1024, 768, 390 and 360, HE and EN:
  - all 10: no horizontal overflow; 0 overlaps between text and image; tags `H2,H3,P,H3,P,H3,P`; copy matches the source strings
    exactly; 0 links/buttons inside the section; one `#difference`; animation `none`; art `aria-hidden`; previous = `scenarios`,
    next = `process`.
  - order: ≥1024 HE art-left / EN art-right; ≤768 heading>art>groups. Image width: 635 (1440), 551 (1024), 640 (768), 358 (390), 328 (360).
  - type: h2 52/43.8/37.6/32 px; h3 29.6–22.4 px; body 17.28 px at all sizes.
- Visual inspection of the screenshots: HE 1440 transition, HE 390 section, EN 1440 transition, HE 1024, EN 390 transition.
- Not re-run: earlier sections' QA scripts. Only the scenarios→difference→process adjacency was checked.

## Screenshots (`_dev/shots/difference_shared/`)

`{he,en}-{desktop-1440,tablet-1024,tablet-768,mobile-390,mobile-360}-difference.png`,
`{he,en}-{desktop-1440,mobile-390}-scenarios-to-difference.png`, `results.json`.

## Comparison with the approved mockups

- Desktop is close to the approved composition: sculpture left, heading + three groups right (HE), ivory field, teal rules.
- Phone follows the approved phone order. It uses the desktop sculpture, as instructed: the phone mock's simplified art variant
  (cube + flow cards + tablet + wrench) was not used, so the objects stay the same across breakpoints.
- Differences:
  - the mock's blurred foreground foliage and full-bleed sunlight shadows are not reproduced on the page; only the soft backdrop inside the crop remains.
  - the EN desktop H2 wraps onto two lines in the narrower text column.

## Limitations

- Resolution: the source mockup is only 1468×1071, so the sculpture is 955×515 native. It is sharp at 1× (displayed at ≤640 px wide).
  On 2× / retina screens it is visibly softer. No upscaling was done or claimed. A higher-resolution render of the same approved scene would fix this.
- A very faint lighter rectangle can be seen around the feathered image edge in places, because the art's studio backdrop varies
  slightly against the flat ivory field.
- The dark→ivory fade only exists because of the unreviewed dark-variant preview block. The Founder should confirm which section-4 variant stays.

## Preview

`jekyll serve` in the worktree, then open `/#difference` and `/en/#difference`. Or serve `%TEMP%/difference_build` statically (the QA script uses port 4076).
No preview server was left running.

## Follow-up

No platform follow-up needed. Founder visual review of the preview, and a decision on the section-4 dark vs ivory variant.
