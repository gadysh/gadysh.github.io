# Website chat → Cloudflare gateway (5 November 2026)

Branch: `codex/web-chat-turnstile-2026-11-05`, based on `origin/main` at `2b8725f`.
This checkout is isolated from the dirty hero/POC checkouts. The Founder authorized publishing this chat and the larger desktop panel in AI-Bus task `task-20261105-083631-enlarge-desktop-chat`.
The homepage UI and its optional WhatsApp-link include were carried forward from the existing POC. Scenario-page changes, WhatsApp destinations and DEV-only WhatsApp previews were not imported.

## Behavior

- Hebrew RTL and English homepage chat, same-origin `POST /api/external/web/messages`, exact `{"message":"..."}`, `credentials: "same-origin"`. Cookie/session values remain inaccessible to JavaScript.
- Lazy explicit Managed Turnstile widget. Public production key on public hosts; official passing test site key only on loopback. No query-string override. Tokens are single use, kept in memory and sent only in `X-PowOrg-Turnstile`.
- First turn gets a token. `403 challenge_required` refreshes it and retries that exact batch once. A repeated requirement or `challenge_failed` pauses for an explicit retry. No automatic retry of network errors or potentially processed messages.
- Input/send stays available during reply processing. All accepted waiting lines are joined with newlines into one next message after success. Only one request can be in flight, including challenge retry and reset.
- Both individual messages and the next combined batch are capped at 1,000 UTF-16 characters. A submission exceeding the remaining queue space stays in the input. Existing accepted messages stay queued.
- Failures retain the failed batch and later queued text. Retry resends that batch first; later text follows only after success. A 429 honors `Retry-After` before retry can run. Session/daily-limit errors keep their own friendly message. No raw error codes are displayed.
- New conversation sends a bodyless reset POST. History/queue are cleared only on 204; draft text stays. Reset is disabled during inference and sends cannot be accepted while reset is pending.
- Replies use `textContent` and preserve line breaks; no HTML rendering.
- Desktop (768px and above): fixed console up to 36rem wide and 56rem tall, bounded by viewport edges and the site header. The middle grid row uses the remaining height with independent scrolling. New messages and reopening scroll to the latest message after layout settles. The mobile bottom-drawer rules are preserved.

## Reproduce

From this checkout:

```powershell
node --test _dev/web-chat/client.test.mjs _dev/web-chat/turnstile.test.mjs
ruby _dev/web-chat/build.rb
node _dev/web-chat/mock-server.mjs
```

Preview: <http://127.0.0.1:4285/> and <http://127.0.0.1:4285/en/>.
The build helper uses the existing installed Jekyll 3.10.0 and plugins, without installing gems.
Deployment uses the existing GitHub Pages/Jekyll flow from `main`; publication is explicitly approved for this release.
`bundle check` tried resolving a newer github-pages dependency set and reported missing gems; it was not used for the successful local build. No dependency files were changed or packages installed.

The mock binds only to `127.0.0.1`, serves `_site`, and never forwards to Cloudflare/External or calls a model. It validates request shape, length, its synthetic cookie and dummy token format. It is **not** a Turnstile verifier and **does not** prove live token verification. Its commands simulate `[429]`, `[409]`, `[503]`, `[404]`, `[502]`, `[504]`, `[limit]`, `[budget]`, `[challenge]`, `[invalid]`; New conversation clears a paused failed batch.

Cloudflare references: [official testing keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), [explicit rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/), [configuration/lifecycle](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/).

## Verification and remaining checks

24 Node tests passed: actual loopback HTTP mock contract and cookie continuity, first/expired/rejected challenges, one-retry bound, combined queue, Retry-After, 409/404/503/502/504, 429 session/daily limits, reset success/failure/pending, size limits, network loss, malformed reply, timeout, missing/invalid mock tokens, hostname key selection, and Turnstile API lifecycle/load failures against a test double.

Jekyll build passed; built Hebrew/English homepages and module assets returned HTTP 200. `_dev` is excluded from generated output. `node --check` and `git diff --check` passed. Plain-text rendering was reviewed in source; an actual DOM/XSS browser check has not been completed.

Claude's independent browser QA of the previous mock build passed Hebrew RTL/opening, combining two follow-ups during a pending reply into one request, friendly 429/Retry-After with Retry, and the 375×812 mobile bottom drawer. This task does not repeat those checks. For the desktop enlargement, Codex's embedded browser reported `The browser access host is unavailable`; the native fallback was stopped because it could not determine the current browser URL confidently enough to enforce policy. No further browser input or workaround was attempted. Calculated console dimensions at a 16px root font are 576×496 at 800×600, 576×664 at 1366×768, and 576×896 at 1920×1080. These are CSS geometry checks, not rendered viewport/screenshot verification; visual acceptance of the enlargement remains unverified.

The backend's missing-token, invalid-token and foreign-Origin rejections were verified independently by Claude. After publication, the Founder performs the first real conversation, a follow-up while pending, and New conversation. Publication verification uses only read-only HTTP asset checks: no automated chat messages, reset requests, or tokens go to production. Turnstile is loaded lazily when the first message requires verification; fetching the homepage alone does not load or render its challenge.

Native AI-Bus visibility remains pending: app title/project/sidebar tools were absent in this runner. Existing receipts were inspected; no receipt was marked applied and no native grouping/history presentation is claimed.
