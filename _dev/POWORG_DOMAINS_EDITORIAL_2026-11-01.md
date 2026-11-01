# Homepage section 3 — Domains editorial rows (option 3) — 2026-11-01

Bus task: `task-20261101-121227-3` (from codex). Executed personally by Claude Code (Opus 5.5), no delegation.
Native session: `CLAUDE_CODE_SESSION_ID=afc985d1-c510-49fd-a82b-397acbcd5b02` (child session, cwd = worktree below).

- Worktree: `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2`, branch `hero-poworg-ai-2026-11-01`
- Selected source: `C:/Users/msgad/Documents/AI/PowOrg/PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/domains-editorial-routes.png`
- Predecessor work (hero, entry scenes, header, entry-card, CSS) left intact and uncommitted. Nothing committed, pushed or deployed.

## Source changes

| File | Change |
|---|---|
| `_includes/domain-row.html` (new) | Homepage-only editorial row: h3 + framing, static scene (`aria-hidden`, `alt=""`), scenario link list, domain action. Text from `_data/domains.yml` / `scenarios.yml`. HE links unchanged (`/scenarios/<slug>/` with `short` label fallback logic copied from `domain-card.html`; `/solutions/<slug>/` with i18n "להעמקה בתחום"). EN links unchanged (`/en/contact/?from=scenario:<slug>`, `scenario.en.title`, no domain action — as before). |
| `index.html` | `#domains` now `section domains-editorial`, `.domain-rows` + `domain-row.html` instead of `.domains-grid` + `domain-card.html`. Heading and footer note unchanged. |
| `en/index.html` | `#solutions` same swap (inline card markup replaced by the include). Heading/footer note unchanged. |
| `assets/css/site.css` | Appended scoped block "Homepage section 3" (`.domains-editorial`, `.domain-row*`). Reuses `.entry-link` / `.entry-link-icon` for the domain action. No existing rule changed. |
| `assets/img/domains/*.webp` (new) | 3 clean art derivatives cropped from the selected mock (see below). |
| `_dev/run_domains_editorial_qa.js` (new) | QA + screenshots. |

Not touched: `domain-card.html` (still used by `/solutions/` and styleguide), domain/scenario detail pages, later homepage sections, data files, rules/AGENTS files.

## Layout
- ≥1024px: two columns; text + links on the reading side (right in HE, left in EN), scene opposite, thin rule between rows, equal weight.
- <1024px (768 / 390 / 360): one vertical group per row in DOM order: title → framing → scene → scenario links → domain action. No accordion, all links visible.
- Background continues section 2's ivory (`#f8efe4`) and only fades to `--surface-alt` in the last 140px before section 4 (which is unchanged). Scenes use feathered alpha + `mix-blend-mode: multiply`, so the mock's slightly lighter studio backdrop has no visible frame.

## Art derivatives — fidelity / limitations
- `domain-service-sales.webp` 692×360 (phone/WhatsApp chat, headset, customer record cards)
- `domain-operations-documents.webp` 724×331 (document tray → glass processor → system record/database box)
- `domain-knowledge-employees.webp` 692×344 (procedure binders, open book with sourced highlight, employee terminal)
- Cropped with PIL from the 1254×1254 mock: no heading, link text or buttons included (the "אצלכם" descenders above the phone were hard-masked). Generated in-image text was not used; all copy is native HTML from source data.
- **Resolution limit:** derivatives are native mock pixels (~700px wide). Displayed at 561px (1440), 486px (1024), 520px (768), 358/328px (mobile) → crisp at 1×, slightly soft on 2×/3× phones and retina desktop. A higher-resolution regeneration of the same three scenes would fix this; no upscaling was applied.
- Small differences from the mock: the live scenario labels come from `scenarios.yml` (HE row 1 has 3 + action, row 2 has 2 + action, row 3 has 3 + action — matches mock). Desktop text column is slightly narrower than the mock; framing paragraph wraps at 34em. Leaf-shadow backdrop of the mock is kept inside each scene only (not extended to the page).

## Checks run (this task)
- `jekyll build -d %TEMP%/domains_build` — OK.
- `node _dev/run_domains_editorial_qa.js %TEMP%/domains_build` — HE/EN × 1440 / 1024 / 768 / 390 / 360:
  - horizontal overflow: none (10/10); text/link/image overlaps within rows: 0
  - every link ≥44px tall; h3 24–34px, framing 17.3px, links 16.8px
  - rows in order שירות ומכירות / תפעול, מסמכים ומערכות / ידע ועובדים; footer note present
  - all 9 distinct destinations return 200 in the built site (`/scenarios/*` ×5, `/solutions/*` ×3, `/en/contact/`)
- Visual check by eye: HE 1440 section + entry→domains transition, HE 390, EN 360 (after fixes: removed scene halo; chevron alignment on wrapped EN links).
- Not run: axe/Lighthouse, real-device testing, analytics event verification (hrefs unchanged; no tracking attributes existed on these links).

## Screenshots
`C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/domains_editorial/`
- `he-desktop-1440-first-three-sections.png`, `en-desktop-1440-first-three-sections.png` — hero → entry → domains composition
- `{he,en}-{desktop-1440,tablet-1024,tablet-768,mobile-390,mobile-360}-domains.png` — section only
- `{he,en}-{...}-entry-to-domains.png` — entry → domains transition
- `results.json` — raw measurements

## Local preview
`jekyll serve --port 4000` from the worktree → http://127.0.0.1:4000/#domains and http://127.0.0.1:4000/en/#solutions. Not left running.

## Follow-up
- Optional: higher-resolution renders of the three scenes (same composition) for 2× screens.
- Founder/Codex review of the screenshots; commit/merge only on explicit instruction (main may auto-publish).
- Scenario pages: separate concept (not touched).
