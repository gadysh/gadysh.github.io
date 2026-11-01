# English Copy Insertion Report — Founder-Approved F12–F37, F39

- **Date:** 2026-10-31
- **Task:** `task-20261031-en-approved-insertion`
- **Base HEAD:** `07b1192` (site-v2, clean tree)
- **Packet:** `docs/strategy/website/claude_approved_english_packet_2026-10-31.md`
- **Copy Source:** `docs/strategy/website/english_copy_draft_2026-10-31.md` (Proposed English column)
- **Implementer:** Antigravity (`pro` / high effort)

---

## 1. Summary of Scope

| Item | Expected | Actual | Status |
|---|---|---|---|
| Inserted rows | 27 rows (F12–F37, F39) | 27 rows inserted | PASS |
| Deferred row | 1 row (F38 / E2) | F38 deferred, marker preserved untouched | PASS |
| Untouched markers | E1, E3 (both EN & HE) | Untouched | PASS |
| HE pages | Untouched | Untouched | PASS |

---

## 2. Marker Counts Check

Expected marker counts (`class="todo-copy"`):
- `en/how-we-work/index.md`: 0
- `en/privacy/index.md`: 0
- `en/contact/index.html`: 0
- `en/accessibility/index.md`: 3
- `accessibility/index.md`: 2

### Source Files Count (`grep -c 'class="todo-copy"'`)

| Source File | Pre-Insertion Count | Post-Insertion Target | Post-Insertion Actual | Status |
|---|---|---|---|---|
| `en/how-we-work/index.md` | 18 | 0 | 0 | PASS |
| `en/privacy/index.md` | 5 | 0 | 0 | PASS |
| `en/contact/index.html` | 3 | 0 | 0 | PASS |
| `en/accessibility/index.md` | 4 | 3 | 3 | PASS |
| `accessibility/index.md` | 2 | 2 | 2 | PASS |

### Built HTML Files Count (`%TEMP%` Stub Build)

| Built HTML File | Post-Build Markers | Expected | Status |
|---|---|---|---|
| `/en/how-we-work/index.html` | 0 | 0 | PASS |
| `/en/privacy/index.html` | 0 | 0 | PASS |
| `/en/contact/index.html` | 0 | 0 | PASS |
| `/en/accessibility/index.html` | 3 | 3 | PASS |
| `/accessibility/index.html` | 2 | 2 | PASS |

---

## 3. Verbatim Text Verification in Built HTML

Each of the 27 approved English strings appears verbatim in the built HTML after tag-stripping:

| Row | Target File | Built HTML Line(s) | Status | Approved English Content |
|---|---|---|---|---|
| F12 | `en/how-we-work/index.html` | 479 | PASS | Every organization starts from a different place. We set the path together. |
| F13 | `en/how-we-work/index.html` | 494, 495 | PASS | Tell us what happens in it today, and we'll look at how AI can carry it out, assist with it or shorten it. ¶ In the first conversation, you describe the process as it happens today: who is involved, which systems you work in, and how many times it happens a day or a month. From there we check together whether AI can do part of the work, assist the people who do it or shorten it, and what it takes to connect it to your systems. |
| F14 | `en/how-we-work/index.html` | 500, 501 | PASS | You don't need to come with a defined problem. We'll map the work in your organization together and identify where it makes sense to start. ¶ We start with a conversation about your work: which teams you have, what repeats itself, and where time goes on manual work in your systems. From there we choose together one or two processes worth examining first, based on the benefit and on what can be connected. |
| F15 | `en/how-we-work/index.html` | 520, 521 | PASS | A conversation about your organization and its work. ¶ What we need from you: the person leading the initiative, and a general description of the work and the systems. |
| F16 | `en/how-we-work/index.html` | 529, 530 | PASS | Together we map the human work, and look at what can be handed over to agents and where AI can assist. ¶ What we need from you: a session with someone who knows the work closely, and examples from the work itself, such as documents, requests or recordings. |
| F17 | `en/how-we-work/index.html` | 538, 539 | PASS | On our infrastructure or in your organization's cloud. ¶ What we need from you: details about the existing systems from your IT owner or vendor. |
| F18 | `en/how-we-work/index.html` | 547, 548 | PASS | We build the solution and connect it to your systems. Before it reaches users, we test it on cases from the actual work. ¶ What we need from you: access to the systems through an interface or through the vendor, and a test environment if there is one. |
| F19 | `en/how-we-work/index.html` | 556, 557 | PASS | Including training, and fitting it into the daily work and into contact with your customers. ¶ What we need from you: users who will work with the solution and give feedback early on. |
| F20 | `en/how-we-work/index.html` | 565, 566 | PASS | We check the results against what was defined at the start, and improve based on feedback. When it works, we decide together whether to expand to more processes. ¶ What we need from you: a decision on what to measure, and a willingness to change rules based on what we learn. |
| F21 | `en/how-we-work/index.html` | 570 | PASS | Not every organization goes through every step, or in the same order. The scope and the form of engagement are set for each case. |
| F22 | `en/how-we-work/index.html` | 584 | PASS | Makes the decisions, sets priorities and connects the people. |
| F23 | `en/how-we-work/index.html` | 589 | PASS | Explains how the work is actually done, including the exceptions, and reviews the outputs. |
| F24 | `en/how-we-work/index.html` | 594 | PASS | Opens access to the systems and approves how we connect to them. |
| F25 | `en/how-we-work/index.html` | 598 | PASS | In a small organization, this can be one person. |
| F26 | `en/how-we-work/index.html` | 608 | PASS | The solution can be built on our infrastructure, which serves as an accelerator, or in the cloud your organization already works with, such as Google Cloud, Microsoft Azure or AWS. The two can also be combined. The choice is made according to your systems, requirements and budget. |
| F27 | `en/how-we-work/index.html` | 613, 614 | PASS | Together we define which actions are allowed, when a person approves, and what is logged. ¶ For every action the system performs, what is allowed and what is not is defined in advance. Sensitive actions go to a person for approval, and every action is recorded, so you can check what was done and why. |
| F28 | `en/how-we-work/index.html` | 629 | PASS | More than 15 years of building enterprise systems and managing development teams. Since 2025, leading AI agent and automation projects in organizations, from defining the requirements, through rollout with users, to seeing real value. |
| F29 | `en/how-we-work/index.html` | 632 | PASS | We work with AI agents too. They write code, test it and document the work. A human team defines the tasks, reviews the outputs and decides what goes live. |
| F30 | `en/contact/index.html` | 480 | PASS | You can come with a process already in mind, or just a wish to check where AI can help. |
| F31 | `en/contact/index.html` | 699, 702, 705 | PASS | 1. We read your inquiry. 2. We get back to you. If it looks like there is something to talk about, we'll suggest an introductory call and some times. 3. In the call, we get to know the work in your organization and explore directions together. |
| F32 | `en/contact/index.html` | 712 | PASS | You can write to us directly at: |
| F33 | `en/privacy/index.html` | 473 | PASS | The inquiry form collects your name, email address and organization name, and what you choose to explore. You can also add a short description, your role and a phone number, but these are optional. Source details are sent with the inquiry as well: the page you contacted us from, the site that referred you, and campaign parameters if the link included them. |
| F34 | `en/privacy/index.html` | 476 | PASS | The details are used only to read your inquiry, get back to you and check whether there is a basis for a conversation. They are not passed on to third parties and are not used for a mailing list. |
| F35 | `en/privacy/index.html` | 479 | PASS | Your inquiry is stored in PowOrg's spreadsheet and mailbox, in the company's Google Workspace account. An inquiry that did not lead to a conversation or to work is deleted after 24 months. |
| F36 | `en/privacy/index.html` | 482 | PASS | You can ask to see, correct or delete your details by emailing contact@poworg.com. Once the request has been carried out, we will confirm it by email. |
| F37 | `en/privacy/index.html` | 485 | PASS | To count page visits, the site uses Cloudflare Web Analytics. The tool does not use cookies and does not store details that identify you. The site has no tracking cookies. |
| F39 | `en/accessibility/index.html` | 479 | PASS | If you run into an accessibility problem on the site, write to our accessibility coordinator and describe which page it is on and what the problem is. |

---

## 4. Mailto Links Verification

| Page | Section / Description | Target Mailto Address | Actual Rendered Markup | Status |
|---|---|---|---|---|
| `/en/privacy/` | Rights and data deletion (F36) | `mailto:contact@poworg.com` | `<a href="mailto:contact@poworg.com">contact@poworg.com</a>` | PASS |
| `/en/privacy/` | Privacy contact | `mailto:contact@poworg.com` | `<a href="mailto:contact@poworg.com">contact@poworg.com</a>` | PASS |
| `/en/contact/` | Direct mail fallback | `mailto:contact@poworg.com` | `<a href="mailto:contact@poworg.com" class="btn btn-secondary direct-mail-link">contact@poworg.com</a>` | PASS |
| `/en/accessibility/` | Accessibility feedback (F39) | `mailto:support@poworg.com` | `<a href="mailto:support@poworg.com">support@poworg.com</a>` (no `lead_fallback` contact@ link) | PASS |

---

## 5. Scope & Network Isolation Verification

- **Diff Scope:** Touches only the 4 EN source files plus `_dev/ENGLISH_INSERTION_REPORT.md`:
  - `en/accessibility/index.md`
  - `en/contact/index.html`
  - `en/how-we-work/index.md`
  - `en/privacy/index.md`
  - `_dev/ENGLISH_INSERTION_REPORT.md`
- **Deferred / Gated Markers:** F38 (E2) preserved on `en/accessibility/index.md`; E1 and E3 markers preserved on both EN and HE accessibility pages.
- **Tracked `_site_stub/`:** Untouched.
- **Evidence & Code:** `_dev/g1/` and `_dev/apps_script` untouched.
- **Network Isolation:** 0 external URLs added in diff.
- **Port:** Port 4000 was not used at any point.

---

## 6. Verdict

**ALL 5 CHECKS PASSED.**
Ready for local commit on `site-v2`:
`EN copy: insert Founder-approved F12–F37, F39 (F38 deferred)`
