# Website chat → Cloudflare gateway (local branch, 5 November 2026)

Branch: `codex/web-chat-turnstile-2026-11-05`, based on `origin/main` at `2b8725f`.
This checkout is isolated from the dirty hero/POC checkouts. Nothing was pushed or published.
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

## Reproduce

From this checkout:

```powershell
node --test _dev/web-chat/client.test.mjs _dev/web-chat/turnstile.test.mjs
ruby _dev/web-chat/build.rb
node _dev/web-chat/mock-server.mjs
```

Preview: <http://127.0.0.1:4285/> and <http://127.0.0.1:4285/en/>.
The build helper uses the existing installed Jekyll 3.10.0 and plugins, without installing gems.
Normal deployment still uses the existing GitHub Pages/Jekyll workflow and requires Founder approval.
`bundle check` tried resolving a newer github-pages dependency set and reported missing gems; it was not used for the successful local build. No dependency files were changed or packages installed.

The mock binds only to `127.0.0.1`, serves `_site`, and never forwards to Cloudflare/External or calls a model. It validates request shape, length, its synthetic cookie and dummy token format. It is **not** a Turnstile verifier and **does not** prove live token verification. Its commands simulate `[429]`, `[409]`, `[503]`, `[404]`, `[502]`, `[504]`, `[limit]`, `[budget]`, `[challenge]`, `[invalid]`; New conversation clears a paused failed batch.

Cloudflare references: [official testing keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), [explicit rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/), [configuration/lifecycle](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/).

## Verification and remaining checks

24 Node tests passed: actual loopback HTTP mock contract and cookie continuity, first/expired/rejected challenges, one-retry bound, combined queue, Retry-After, 409/404/503/502/504, 429 session/daily limits, reset success/failure/pending, size limits, network loss, malformed reply, timeout, missing/invalid mock tokens, hostname key selection, and Turnstile API lifecycle/load failures against a test double.

Jekyll build passed; built Hebrew/English homepages and module assets returned HTTP 200. `_dev` is excluded from generated output. `node --check` and `git diff --check` passed. Plain-text rendering was reviewed in source; an actual DOM/XSS browser check has not been completed.

Browser QA is incomplete. The Codex embedded-browser tool reported `The browser access host is unavailable`. The subsequent native fallback was stopped by Computer Use because it could not determine the Windows browser URL confidently enough to enforce policy. No further browser interaction or workaround was attempted. Consequently no loaded/open embedded tab, visual/mobile QA, actual dummy-token acquisition or browser cookie behavior is claimed.

After deployment approval and backend readiness, the remaining live E2E is: one real conversation from `poworg.com` with a valid token, a missing-token rejection with a clean session, an invalid-token rejection, session continuation/reset and queued follow-up in the real browser. Do not send test keys/tokens to production or change External/Worker to make local tests pass.

Native AI-Bus visibility remains pending: app title/project/sidebar tools were absent in this runner. Existing receipts were inspected; no receipt was marked applied and no native grouping/history presentation is claimed.
