# Homepage section 4 — Scenario teaser editorial rows (HE + EN) — 2026-11-01

Bus task: `task-20261101-133604-task` (from codex). Executed personally by Claude Code (Opus 5.5); no subagent / Antigravity / other-platform handoff, no rules/AGENTS edits.
Session as seen from inside the process: `CLAUDE_CODE_SESSION_ID=9c264a32-cbdb-40a2-8f72-8befdf6a481c`. This is not the predecessor session id (`afc985d1-…`), so from inside I cannot confirm this run resumed the "original" session; only the bus record can show that. I also cannot see whether the opener showed it in a UI.

- Worktree: `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2`, branch `hero-poworg-ai-2026-11-01`
- Approved sources: `…/visual_concepts_2026-11-01/home-scenarios-editorial-desktop-v1.png` (1024×1536, all five) and `…/home-scenarios-editorial-mobile-detail-v1.png` (830×1896, first two)
- Predecessor work (hero, entry, header, entry-card, domains) kept as it was, uncommitted. Nothing committed, pushed or deployed.

## English question — findings
- **Public site (checked today with `curl https://poworg.com/en/`):** the section ids are `hero, entry-paths, solutions, difference, process, technology, fit, founder, contact-cta`. There is **no `#scenarios`**. `https://poworg.com/` (HE) has `#scenarios` with 5 `scenario-card`s. `main:en/index.html` has the same structure as the public site. So the Founder's observation is correct for the release.
- **Why it was missing:** this was a scope decision, not a code accident. In `claude_website_spec_v2.md` §6.3, English v1 covers home, how-we-work, contact, privacy and accessibility only. "On the English home, the domains and scenarios are shown as **a list with a summary**", and anything without an EN page links to contact with context, never to a Hebrew page. EN therefore had one combined "areas and scenarios" list (`#solutions`; each scenario is a link to `/en/contact/?from=scenario:<slug>`) and no separate teaser block. The `en.title/short/outcome` fields already existed in `_data/scenarios.yml`.
- **Outcome now:** EN gets the same dedicated `#scenarios` section as HE, placed after `#solutions` and before `#difference`. Text comes verbatim from `scenarios.yml` `en.title` / `en.outcome`. The tag uses i18n `scenario_tag.en` ("Scenario tailored to each organization"). The action uses i18n `talk_scenario.en` ("Talk about this scenario"), which is the established label for the contact route, and it links to `/en/contact/?from=scenario:<slug>`. No EN scenario pages were created, and nothing links to Hebrew or to a 404.
- **New EN string (Founder copy check needed):** section heading **"What it can do in practice"**. This is a direct rendering of "מה זה יכול לעשות בפועל"; no approved EN string existed for it. Everything else is existing approved text.

## Source changes (this task)
| File | Change |
|---|---|
| `_includes/scenario-row.html` (new) | Homepage-only row: `article` with `h3` (id), outcome `p`, tag `p` with a small inline doc icon (aria-hidden), static scene (`aria-hidden`, `alt=""`), action link with `aria-describedby` → the h3, so the five identical link texts each get their scenario. HE: `/scenarios/<slug>/` + i18n `explore_scenario.he` ("לעמוד התרחיש"). EN: `/en/contact/?from=scenario:<slug>` + `talk_scenario.en`. |
| `index.html` | `#scenarios` → `section scenarios-editorial`, `.scenario-rows` + `scenario-row.html` (was `section-alt` + `.scenarios-grid` + `scenario-card.html`). Heading unchanged. |
| `en/index.html` | New `#scenarios` section (same include) between `#solutions` and `#difference`; later comment numbers shifted by one. |
| `assets/css/site.css` | `.domains-editorial` background is now solid ivory with bottom padding `space-12` (it used to fade to `--surface-alt` for the old section 4). A new scoped block "Homepage section 4" was appended. No other existing rule changed. |
| `assets/img/scenarios/*.webp` (new, 5) | Clean scene derivatives (see below). |
| `_dev/extract_scenario_art.py` (new) | Reproducible crop/mask/feather of the five scenes from the approved desktop mock. |
| `_dev/run_home_scenarios_qa.js` (new) | QA + screenshots. |

Not touched: `scenario-card.html` (still used by `/solutions/` and the styleguide), scenario/domain detail pages, data files, sections 5+ markup, rules files. No analytics attributes existed on the old scenario links, and none were added. Reduced-motion: the section has no animation, and existing behaviour is unchanged.

## Layout
- **≥1024px:** two columns. The text group (title → outcome → tag → action) is on the reading side (right in HE, left in EN) and vertically centred against the scene. A quiet rule separates rows, and there are no cards.
- **768–1023px:** stacked (tag → title → outcome → scene → action), scene ≤520px, inline action link.
- **<768px:** same stack, with the tag above the title and a full-width outlined pill action (56px tall), as in the approved phone detail. All five rows are in natural scroll.
- **Background:** continues section 3's ivory `#f8efe4` with no seam. It fades only in the last 140px to the next section's colour: `--surface` in HE (`#difference` is plain), and `--surface-alt` in EN through `:has(+ .section-alt)`.

## Art derivatives — fidelity / limitations
| File | px | Content |
|---|---|---|
| `scenario-whatsapp-service-actions.webp` | 616×264 | WhatsApp phone → PowOrg AI cube → completed record ✓ → human agent (handoff) |
| `scenario-agent-assist-onboarding.webp` | 622×266 | headset, agent screen with assisted suggestion panel, procedure/document stack |
| `scenario-documents-across-systems.webp` | 642×244 | document tray → AI processor → system/database ✓ + exception card (!) with person |
| `scenario-knowledge-chat-actions.webp` | 622×256 | laptop Q&A answer with source doc → knowledge binders → system action (gear) |
| `scenario-recording-to-outputs.webp` | 606×224 | recording waveform → AI cube → summary, CRM, checklist/follow-up, analytics outputs |

- All five come from the **desktop** mock at native pixels, without upscaling. Mock headings, paragraphs, tags and buttons are excluded or hard-masked (rows 3 and 4 had heading/paragraph glyphs near the scene edge). Edges are feathered to alpha 0 and blended with `multiply`, the same technique as section 3.
- **Phone-detail source not used:** its first two scenes are *different compositions*, not higher-resolution copies. Scene 1 there has no human-handoff agent, and scene 2 is rearranged with the cube moved. Using them only on phones would show different art for the same scenario at different widths, and would drop the handoff element the brief requires. I kept one consistent set and am reporting this instead.
- **Resolution limit:** about 610–640px native width. They are shown at 561px (1440), 486px (1024), 520px (768) and 358/328px (phones). They are crisp at 1×, slightly soft on 2×/3× phones and retina desktops (same limit as section 3). A higher-resolution render of the same five compositions would fix this.
- The mock's leaf-shadow backdrop stays inside each scene. A faint rectangular tone difference between the scene backdrop and the page ivory can be seen on close inspection, as in section 3.

## Differences from the approved visual
- Desktop text order follows the mock (title, outcome, tag, action), and the phone order follows the phone detail (tag first). This is done with CSS grid areas over a single DOM order (h3, p, tag, scene, link). The tag is non-interactive, so meaning and reading order stay intact.
- Live text wraps differently from the mock (wider text column at 1440). The mock's large decorative blurred foliage at the page edges is not reproduced.
- EN uses the same scenes, mirrored layout (scene right), and the contact-route label instead of "scenario page".

## Checks run (this task)
- `jekyll build -d %TEMP%/scenarios_build`: OK. 5 `.scenario-row` in `/index.html` and 5 in `/en/index.html`.
- `node _dev/run_home_scenarios_qa.js %TEMP%/scenarios_build`, HE/EN × 1440 / 1024 / 768 / 390 / 360:
  - horizontal overflow: none (10/10). Text/action/image overlaps in rows: 0. Images inside rows: yes.
  - scene side: HE desktop/1024 left, EN desktop/1024 right, ≤768 stacked.
  - one `#scenarios` per page, 1 h2 + 5 h3. HE h2 "מה זה יכול לעשות בפועל", EN h2 "What it can do in practice".
  - five titles in data order, tag present on every row in both languages.
  - type: h3 32px (1440) → 23.2px (phones), outcome 17.3px, action 17.6px. Action height 44px (desktop/tablet), 56px (phones).
  - section order HE: `hero>entry-paths>domains>scenarios>difference>process>technology>fit>founder>contact-cta`. EN: `hero>entry-paths>solutions>scenarios>difference>…`. Previous sections are unchanged.
  - language switch: HE → `/en/`, EN → `/`. The anchor `#scenarios` is the same in both languages.
  - destinations: `/scenarios/{5 slugs}/` → 200, and `/en/contact/?from=scenario:{5 slugs}` → 200.
  - EN contact context, all 5: the context bar is visible, hidden `type=scenario`, `slug` is correct, the topic is the EN `short` (e.g. "WhatsApp service and actions"), and `lang=en`.
- Checked by eye: HE 1440 section (all five rows) and HE 390 domains→scenarios transition.
- Not run: axe/Lighthouse, real-device testing, live analytics events, eyeballing every EN/tablet screenshot (metrics only).

## Screenshots
`C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/home_scenarios/`
- `{he,en}-desktop-1440-domains-to-scenarios.png`: desktop composition of the domains → scenarios transition
- `{he,en}-mobile-390-domains-to-scenarios.png`
- `{he,en}-{desktop-1440,tablet-1024,tablet-768,mobile-390,mobile-360}-scenarios.png`: whole section, all five rows
- `en-contact-context-390.png`: EN contact with the scenario context
- `results.json`: raw measurements

## Local preview
`jekyll serve --port 4000` from the worktree → http://127.0.0.1:4000/#scenarios and http://127.0.0.1:4000/en/#scenarios. **Not left running.**

## Follow-up
- Founder copy check for the EN heading "What it can do in practice".
- Optional: higher-resolution renders of the five scenes for 2×/3× screens.
- Commit/merge only on explicit instruction (main auto-publishes).
- Scenario detail pages: separate concept later; not touched.
