# PowOrg homepage #technology — dark field + original logos (2026-11-01)

Task: AI-Bus `task-20261101-153656-task` (from codex). Implemented and verified personally by Claude Code (Opus 5.5); no Antigravity / subagent / other-platform delegation; no standing-rule, AGENTS or setup edits.
Branch/worktree: `hero-poworg-ai-2026-11-01`, `C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2`. All work uncommitted; earlier hero / entry / domains / scenarios / difference / process work preserved (no reset, stash, discard or cleanup). No commit / push / deploy.

## What changed

| File | Change |
|---|---|
| `index.html` | `#technology`: `section technology-dark`, `aria-labelledby`, two-part layout (copy + `technology-art` include). H2/paragraph verbatim incl. `<bdi>` provider names and the RLM after "Google Cloud,". |
| `en/index.html` | Same; `section-alt` removed from `#technology` (now dark). H2/paragraph verbatim. |
| `_includes/technology-art.html` (new) | `<figure dir="ltr">`: cloud list (3) → static scene → systems list (6). Lists have accessible names (HE/EN params); every chip is named by `alt` or by native visible text (`lang="en"`). |
| `assets/css/site.css` | New block at end ("Homepage section 7 — Technology on a deep petrol field"): petrol/navy field (#052f45→#03263a→#021e2e + restrained teal glow), one crisp teal hairline at the ivory edge, ivory text, ivory stone logo chips, desktop 5fr/7fr grid (copy on reading side: right in HE, left in EN), phone/tablet stack (copy, cloud row, scene, systems 2 cols <480px / 3 cols ≥480px). `.process-journey:has(+ .technology-dark)` keeps section-6 ivory to the edge (no white fade stripe) → clean intentional ivory→dark boundary. Dark→`#fit` is a straight edge onto the existing sand. Scene softened with a radial mask + matching local glow (no rectangular backdrop). |
| `assets/img/technology/technology-scene.webp` (new) | Clean scene (PowOrg AI module, generic cloud, organization-system junction) cropped from the **pre-logo** v1 mock `technology-dark-desktop-v1.png` (box 0,230–900,935, native pixels, feathered alpha). No baked text, no generated logos. Same image at every breakpoint (consistent semantics). |
| `assets/img/technology/logos/*` (new, 9 files) | Original brand files — see source list. |
| `_dev/extract_technology_art.py`, `_dev/run_technology_dark_qa.js` (new) | Extraction + QA scripts. |

No CTA, controls, animation or new copy added (only screen-reader list names and scene alt). `#fit`, `#founder`, `#contact-cta`, footer, detail pages and other sections untouched.

## Original logo sources (no AI-rendered crops, no tracing)

| Brand | File | Source (retrieved 2026-11-01) | Note |
|---|---|---|---|
| Google Cloud | `google-cloud.svg` | https://www.gstatic.com/cgc/google-cloud-logo.svg (Google's own CDN) | full-colour lockup, unmodified |
| Microsoft Azure | `azure.svg` + native text "Microsoft Azure" | Azure "A" symbol `Icons/other/10018-icon-service-Azure-A.svg` from Microsoft's official Azure icon set https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V24.zip (linked from https://learn.microsoft.com/azure/architecture/icons/) | unmodified; Microsoft's icon terms on that page apply (see gaps) |
| AWS | `aws.svg` | Header logo SVG on https://aws.amazon.com/ (inline, "Amazon Web Services homepage" link) | paths unmodified; source used CSS fill, so official colours #252F3E (wordmark) / #FF9900 (smile) were applied as fill attributes; `role="presentation"` removed |
| WhatsApp | `whatsapp-glyph.svg` + native text "WhatsApp" | https://static.whatsapp.net/rsrc.php/y1/r/FJbTMJqMap7.svg (green glyph loaded by https://www.whatsapp.com/) | unmodified. The white full lockup from the same page (`…/yJ/r/twC7frrXavH.svg`) was not used because chips are light |
| Salesforce | `salesforce.svg` | https://c1.sfdcstatic.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg (salesforce.com CDN) | unmodified |
| Microsoft Dynamics 365 | `dynamics-365.svg` + native text "Microsoft Dynamics 365" | `Dynamics 365 Product Family Icons/Dynamics365_scalable.svg` from https://download.microsoft.com/download/498606aa-6d27-4f13-aa5c-1401078c153b/Dynamics-365-icons-scalable.zip (linked from https://learn.microsoft.com/dynamics365/get-started/icons) | unmodified; product-family icon, not an app icon, no certification badge |
| SAP | `sap.svg` | https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg (referenced by sap.com) | unmodified gradient logo |
| Oracle NetSuite | `oracle-netsuite.svg` | https://www.netsuite.com/portal/assets/netsuite-design-system/img/icons/logo.svg (netsuite.com header, alt "Oracle NetSuite") | file unmodified; it is the light (#FBF9F8) variant, rendered on the ivory chip as monochrome dark via CSS `filter: brightness(0)` (shape untouched) |
| Priority | `priority.svg` | Already-acquired official header asset `brand_references/priority-official-header.svg` (priority-software.com) | unmodified |

Retrieval: plain HTTPS GET or headless Chrome page load of the official public page (whatsapp.com, netsuite.com and aws.amazon.com reject plain curl). No accounts, packages, services or permission changes. No terms were accepted.

## Checks actually run

- `jekyll build -d %TEMP%/tech_build`: OK (~1.5 s).
- `node _dev/run_technology_dark_qa.js %TEMP%/tech_build`: **ALL OK** for HE + EN at 1440 / 1024 / 768 / 390 / 360:
  exact H2 + paragraph, 9 distinct named brands, all images loaded, rendered aspect ratio within 3% of each file's own aspect ratio (no distortion), no chip content overflow, no tile overlap, no copy/art overlap, nothing outside the section, no page horizontal overflow, no controls/animation in the section, desktop sides correct (HE copy right / EN copy left), DOM order process → technology → fit, `#technology` heading lands below the sticky header (e.g. 1440: header 72px, h2 324px; 390: header 60px, h2 108px).
  Contrast (worst case over field + glow colours): H2 8.6:1, paragraph 7.3:1.
  First run caught Google Cloud squeezed at 1024/360 → fixed (width-limited sizing), and a faint rectangular halo around the scene at desktop → fixed (radial mask + glow); re-run ALL OK.
- Visual inspection: HE desktop adjacency, EN desktop section, HE 390 section.
- Live preview: http://127.0.0.1:4000/ and /en/ return 200 and contain 9 logo chips each (existing watcher picked the change up; server not restarted).

Screenshots: `_dev/shots/technology_dark/{he,en}-{desktop-1440,tablet-1024,tablet-768,mobile-390,mobile-360}-{technology,adjacency}.png` (20 files).

## Revision 2 (same day, Founder: "למה לא כמו שהועבר לך? זה היה יפה יותר")

The first pass had simplified the logos into flat chip rows. Rebuilt to follow the approved v2 mocks:
- **≥768px (tablet + desktop):** one 1070×870 stage in the v2 desktop frame. Clean scene `technology-stage-desktop.webp` = desktop-v1 box 0,130–925,1000 (stops before the mock's baked heading/paragraph). Cloud marks on dark glass chips with teal rim above the cloud; six system marks on angled ivory stone chips (visible stone edge, `rotateX(12deg) rotate(5–8deg)`) around the junction; static teal SVG connectors (`aria-hidden`). Chip positions/sizes measured on `technology-dark-logos-desktop-v2.png`; logo sizes in container units so the composition scales as one picture. Copy beside the stage from 1200px; stacked above it below that.
- **<768px (phone):** clean phone scene `technology-stage-mobile.webp` (mobile-v1 box 0,770–946,1335) edge to edge, then the marks directly on the dark field in 3-column rows with thin dividers (cloud row, rule, two system rows), as in `technology-dark-logos-mobile-v2.png`.
- **Official colourways per background** (no redrawing): `google-cloud-reversed.svg` (official file, wordmark #5f6368→white, Google's reversed lockup); `aws-reversed.svg` ("aws" letters white, smile #FF9900, as the dark aws.amazon.com header shows it); `oracle-netsuite-color.svg` (official paths, ORACLE #C74634 + NetSuite #312D2A, Oracle's standard colour version) on ivory chips, the original light netsuite.com file on the phone's dark field; Priority official header (dark) on ivory chips and Priority's official footer (white, `priority-reversed.svg`) on the dark field. The CSS monochrome filter is no longer used.
- `run_technology_dark_qa.js` adapted (layout size for aspect checks, untransformed boxes for chip overlap, side order checked from 1200px). Re-run: **ALL OK**, HE + EN × 1440/1024/768/390/360; contrast H2 8.6:1, paragraph 7.3:1.
- `technology-scene.webp` from the first pass was removed (replaced by the two stage files).

## Fidelity / remaining gaps

- Desktop/tablet now follow the v2 composition (glass cloud chips, angled stone system chips, connectors). Connector curves and chip tilts are hand-matched to the mock, not pixel-identical.
- Phone follows the v2 phone mock (scene, then divided rows on the dark field); the mock's blurred foreground foliage is not reproduced (it was generated decoration, not part of the scene file).
- Azure, Dynamics 365 and WhatsApp use the official symbol + native brand name text (the official word-mark lockups for Azure/Dynamics are not in those public packs). Microsoft's icon pages carry usage terms (icons intended for architecture diagrams/docs); Founder/legal should confirm acceptable marketing-page use. Similarly, all nine are shown as examples, not partnership/certification claims; brand-guideline review (clear space, minimum sizes) by the Founder is advisable before publication.
- Prior QA scripts that fingerprint `#technology` as "untouched" (e.g. `run_process_five_stages_qa.js`) will now report that section as changed — expected.
- `#fit` still awaits its own visual review; its top edge now meets the dark field directly.

## Follow-up

None required from codex/antigravity for implementation. Founder visual review of the live preview is the natural next step; commit/merge/publish only on explicit request.

## Bus session

`bus_check_status`: task `task-20261101-153656-task` is in `processing` (RUNNING since 15:36:57) under cwd `gadysh-site-v2`. `bus_open_session` dry-run → `REFUSED_ACTIVE` ("a running session cannot be moved"): the native Claude session ID is recorded by the bus on COMPLETED and can be opened afterwards (as for 150226 → 6b5f8a4e). That opener command's `OPEN_COMMAND_OK` only means the command was received; it does not show that the session is displayed in the Claude Desktop UI.
