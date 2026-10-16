# Lingua API runbook

Node.js 24+; production baseline is Node 24 LTS. Install with `npm ci`.
This API is a local backend foundation. The public concept does not call it yet.

## Local development

```sh
npm run dev:server
curl http://127.0.0.1:8787/v1/capabilities
curl http://127.0.0.1:8787/v1/analysis \
  -H 'Content-Type: application/json' \
  -d '{"documentId":"example-v1","language":"en","text":"My mother gives me water.","contextStart":0,"selection":{"start":19,"end":24}}'
```

The selected `water` occurrence receives sourced etymology and prepared grammar.
Unknown sentences return `unavailable` layers. Editing source text requires a new
document version/ID; the client must discard stale responses. Offsets are UTF-16,
zero-based and end-exclusive. API analysis currently supports English only.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `NODE_ENV` | development | `production` requires a service key |
| `LINGUA_HOST` | `127.0.0.1` | Any non-loopback bind also requires a key |
| `PORT` | `8787` | TCP port, 1–65535 |
| `LINGUA_API_KEY` | unset | At least 32 characters; use a randomly generated secret |
| `LINGUA_ENABLE_TRANSLATION` | `false` | `true` sends submitted text to translation providers |
| `LINGUA_DEADLINE_MS` | `8000` | Whole translation deadline, max 15000 |
| `LINGUA_CONCURRENCY` | `8` | Maximum in-flight translations, max 64 |
| `LINGUA_RATE_MAX` | `60` | Requests per minute per source IP, max 1000 |
| `DEEPL_API_KEY` | unset | Optional server-side DeepL credential |
| `LIBRETRANSLATE_URL` | unset | Optional trusted LibreTranslate endpoint |

Existing provider selection/fallback is in `src/core/providers.ts`; MyMemory is
the default. Do not enable a paid provider as part of tests. Credentials belong in
a deployment secret store, never Git, Vite variables, localStorage or screenshots.
No `.env` loader is installed; pass environment variables through your shell or
runtime. No CORS is enabled. A service key is for trusted callers, not a browser
session or per-user authorization system.

## Build and verify

```sh
npm test
npm run typecheck
npm run build:server
npm run build:gateway
npm run smoke:server
npm run start:server
```

The smoke test starts the built server on an available loopback port with a test
credential, checks auth and analysis, and verifies exit code 0 after SIGTERM.
It also verifies cancellation after a real HTTP client disconnect. It never calls
external providers. Unit/API tests inject provider outcomes and
exercise deadlines, cancellation, overload, circuit recovery, input rejection,
rate limiting and privacy of logs.

## Container

```sh
docker build --target server -t lingua-api:local .
# Export a strong LINGUA_API_KEY in this shell first, without committing it.
docker run --rm --init --name lingua-api -p 127.0.0.1:8787:8787 \
  -e LINGUA_API_KEY lingua-api:local
```

The image runs as `node`, with production mode, translation off, and no data
volume. `/health/live` and `/health/ready` need no credential. `/v1/*` uses
`Authorization: Bearer <service-key>`. `/v1/openapi.json` returns the contract.
Allow at least 15 seconds before forced container termination.

## Failures and rollout

- 400/413/415: reject malformed or oversized input; do not retry unchanged.
- 401: check the caller's service credential; do not expose it to users.
- 429: respect `Retry-After` and reduce request frequency.
- 503: inspect the stable error code for disabled translation, overload, drain,
  or provider failure. Retain usable analysis layers in the eventual client.
- 504: the translation exhausted its deadline; let the user retry explicitly.
- 408: request was cancelled, including cancellation during shutdown.

Logs contain request ID, route template, status and duration, without user text,
query values or credentials. Correlate failures by `X-Request-Id`. Readiness does
not depend on an external provider; dictionary/analysis can remain available
when translation fails.

Before a public launch, provide TLS, a trusted gateway/session boundary, edge
abuse controls, measured load limits, monitoring and a rollback target. With
`trustProxy=false`, requests behind one gateway share its IP budget. Do not
enable arbitrary forwarded-IP trust to solve this; configure a verified proxy
boundary and shared edge limiting first. In-process limits are not global
across replicas. Hosting with sleep is a demo option, not an uptime guarantee.

Release immutable image tags tied to a reviewed Git commit. Test on staging,
switch traffic only after readiness succeeds, and retain the previous image.
Rollback routes traffic back to that image; this stage has no database migrations
or stored user documents to restore. No public API deploy is configured yet.

## Live grammar alpha (ADR-013, 2026-10-16)

The reading UI calls `/api/analysis` only after **Analyze sentence**. The public
Node adapter exposes only grammar analysis; `/v1/translation` is not exposed by
this entrypoint. `/api/engine` requires the private `LINGUA_API_KEY`.

Local setup (Python 3.12):

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
export LINGUA_API_KEY="$(openssl rand -hex 32)"
export LINGUA_ENGINE_URL=http://127.0.0.1:8790
.venv/bin/python -c 'from http.server import ThreadingHTTPServer; from engine.http_handler import EngineHandler; ThreadingHTTPServer(("127.0.0.1",8790),EngineHandler).serve_forever()'
# In another terminal with the same two exported variables:
npm run dev:api
# In a third terminal:
npm run dev:web
```

Open `http://127.0.0.1:5173/concept/`. Vite proxies `/api` to port 8788. The existing
`dev:server` remains a service-authenticated `/v1` API; set `LINGUA_ENGINE_URL` to
use the model there. Docker `server` runs Node only: configure a reachable engine
worker separately; it does not embed Python or silently download a model.

Vercel variables for both Preview and Production: encrypted `LINGUA_API_KEY`,
`LINGUA_PUBLIC_ORIGIN=https://lingua-lac.vercel.app`. The gateway derives the
private worker address from Vercel's trusted `VERCEL_URL`, never the Host header.
Deployment protection, when enabled, requires Vercel's automation bypass secret
for internal function calls; do not disable protection on unrelated projects.
Node cloud entrypoints import an explicitly bundled `.mjs` gateway to avoid
Electron/CommonJS package semantics leaking into the serverless runtime.
Use `vercel deploy` for preview and `vercel deploy --prod` after validation. The
Python entrypoint must define a `handler` class for runtime discovery. Exclude
Node/UI/build assets from the Python bundle to stay below its size limit.

Run `python -m unittest engine.test_analyzer engine.test_http_handler -v` with the
pinned environment. `python -m scripts.engine-benchmark` records speed/structure,
not linguistic accuracy. Test production with an invented public sentence, confirm
`grammar.status=live`, model/version, unavailable meaning, auth rejection at the
private endpoint, correct-origin enforcement, and note export in a browser.

Limits are per instance (12/minute/IP, two gateway requests, one worker parse),
not global spend protection. Hobby caps may affect this project's availability;
shared account limits may affect other projects. Keep the pilot small. Roll back
to a known static deployment if error/usage limits rise; retain the last good
Vercel deployment ID. No database migration is involved.
