# Local Web content-refusal candidate — 5 November 2026

Branch: `codex/web-content-refusal-local-2026-11-05`, based on website `origin/main` at `d8beb2f`.
This candidate is LOCAL ONLY. No push, merge, live rollback, release or deployment is authorized.
Founder approval of the tested exact version is required before publication. The prior live chat
branches are preserved unchanged.

## Customer behavior

- A confirmed server content refusal is a completed HTTP 200 answer:
  `{"reply":"התוכן שנשלח נמצא לא תקין","outcome":"content_rejected"}`.
  The client displays the server reply as an ordinary agent bubble. It does not infer refusal from
  reply wording or HTTP 403/5xx, replay the refused message, reset the session, or stop later turns.
- Every submitted message is processed separately and sequentially. Pending messages are no longer
  joined into one request: a rejected submission cannot swallow a separate valid submission.
- No Retry or Cancel pending messages controls, queue counters, delivery badges, or recovery
  instructions are present in the customer UI. Per the subsequent Founder request, New conversation
  is also removed: the customer stays in one conversation leading to contact-detail collection.
  Closing and reopening the panel keeps the current conversation.
- Technical/network failures have a separate ordinary error bubble. The affected request is never
  automatically replayed because its server completion may be uncertain. Other accepted messages
  remain ordered and are not silently discarded.
- A Retry-After cooldown delays subsequent accepted messages internally; the rejected rate-limited
  message is not replayed. Daily/session caps remain enforced. A rejected draft stays in the input.
- Same-origin POST body remains exactly `{"message":"..."}` with same-origin credentials. Only
  loopback receives the public Turnstile test key. Public hosts retain the production public key.
- Single-use challenge handling, plain DOM link rendering with same-tab navigation, shared header
  launcher, responsive drawer and disabled WhatsApp placeholders remain intact.

## Offline checks and preview

```powershell
node --test _dev/web-chat/client.test.mjs _dev/web-chat/turnstile.test.mjs _dev/web-chat/links.test.mjs
ruby _dev/web-chat/build.rb
$env:WEB_CHAT_PORT = '4286'
node _dev/web-chat/mock-server.mjs
```

Preview: http://127.0.0.1:4286/ (and /en/). This server is loopback-only and never forwards traffic to
External, Cloudflare, SQL or a model. Turnstile uses the official passing loopback test key.
`[blocked]` or `בדיקת חסימת תוכן` simulates the exact typed-refusal contract; follow with any normal
question. `[links]` shows safe clickable links. `[502]`, `[504]`, `[429]` and other existing mock
commands simulate technical errors. This preview is not a real guardrail/model verdict.

32 Node checks cover ordered independent messages, first-turn/mid-conversation/repeated typed
refusals, same cookie continuity, accepted pending follow-ups, no reset or replay, technical error
separation, one-bound challenge refresh, real cooldown wakeup, caps, draft limits, network loss,
malformed responses, reset safety, test-key isolation, link safety, and widget lifecycle.
Jekyll builds using the installed local gems; `_dev` remains excluded from the generated site.

The matching External candidate is in the separate local product worktree
`PowOrg-AI Platform/tmp/web-content-refusal-product`. Its own tests must validate the actual
orchestrator classification and HTTP response; the UI mock alone cannot prove that mapping or
production behavior. No production chat, guardrail experiment, or production token is authorized.
