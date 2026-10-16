# ADR-013: Explicit live grammar through a free same-origin gateway

## Status
Accepted 2026-10-16 at the owner's request to connect live analysis, the UI, and a deployed backend. Supersedes the static-only rollout boundary in ADR-012 and the prepared-only reading boundary in ADR-010/011. The $0 budget and separation of linguistic evidence remain.

## Context
A real dependency parser is needed before inviting readers with their own sentences. Node remains the HTTP/application boundary; a compact CPU model is more practical in Python than rewriting its runtime. spaCy 3.8.7 and en_core_web_sm 3.8.0 are MIT-licensed. The evaluated Linux installation is 271 MiB; see ENGINE_EVALUATION.md for measurements and observed weaknesses.

## Decision
Deploy the existing Vercel `lingua` project with a public stateless Node `/api/analysis` function and a private Python `/api/engine` function. Only the Node gateway holds/sends the service credential. The browser submits one selected sentence after an explicit action; it never holds a service key or invokes paid translation. Input is not stored. Prepared examples remain usable locally.

The gateway accepts only the exact configured origin/deployment origin and JSON, limits bodies to 16 KiB, delegates schema validation to Fastify, limits requests to 12/minute/IP per warm instance and model work to two concurrent requests per gateway. Vercel-overwritten client IP is trusted only inside the Vercel entrypoint. Model worker concurrency is one, with no queue; model loading is cached per process. Grammar calls have a 20-second total deadline and functions a 30-second maximum. Cancellation prevents stale UI results; already-running Python CPU inference may finish after disconnect. Do not claim preemptive inference cancellation.

Origin checking reduces browser misuse; it is not user authentication. In-memory quotas are not distributed edge quotas. This is a small, non-commercial personal alpha on confirmed Hobby, not a highly available or abuse-proof commercial API. Revisit shared rate limiting and quota isolation before broader promotion. Do not enable paid plans, paid providers or usage overages automatically.

Keep native spaCy dependency labels (OntoNotes-style). Validate exact UTF-16 source slices, full token coverage, one root, head bounds and acyclicity on both sides. Preserve engine/model versions and warnings. Grammar/morphology are statistical; meaning remains curated/unavailable, and etymology uses only sourced curated families. The UI aborts/rejects stale requests and exports original context plus provenance.

## Alternatives Considered
- UDPipe hosted endpoint: technically works, but selected models have non-commercial restrictions and submitted-text reuse terms. Rejected as the default.
- POS-only JS tagging: does not satisfy dependency parsing; not presented as syntax.
- Paid LLM: no budget; structured fluent output would still require validation and a separate quality evaluation.
- Separate always-on VM or managed Python service: not needed for the bounded personal alpha; adds infrastructure/account setup. Container architecture remains available for later deployment.

## Consequences
We can test real arbitrary English sentences without an inference bill. Cold starts, usage limits and parsing mistakes remain observable limitations. CPU cost, error rates and pilot usefulness must be measured before growth. Free hosting is not an uptime promise, and account quotas can be shared with other projects.

## References
- https://vercel.com/docs/functions/runtimes/python
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/headers/request-headers
- https://spacy.io/models/en#en_core_web_sm

## Runtime compatibility

Vercel's Node runtime rejected `require()` of the ESM-only `cookie@2` imported by
Fastify's request adapter `light-my-request@6.8.0` (ERR_REQUIRE_ESM). Reproduced
locally with `--no-experimental-require-module`. Pin the compatible
`light-my-request@6.6.0` (inside Fastify's supported ^6 range, cookie ^1.0.1) via
npm override, and run API tests with the same flag. Re-evaluate this override when
Vercel supports the newer module boundary; do not remove it without a deployed
smoke test. Cloud entrypoints remain explicitly bundled ESM.
