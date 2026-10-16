# Live grammar alpha verification — 2026-10-16

## Verified

- Python spaCy3.8.7/en_core_web_sm3.8.0 real parsing, 11 unit/HTTP tests and a 20-sentence structural corpus. Structural validity is not an accuracy score.
- Node/API/domain tests, all typechecks and desktop/extension/web/server/gateway builds.
- Real local HTTP cancellation, compiled gateway import, standalone shutdown and Node24 Docker CI build.
- Browser: new sentence with `can't`, separate contraction tokens, three report formats, immutable saved context after edits, live warnings, sourced water family, keyboard branch toggles, three themes, 390px viewport without page overflow, reduced motion.
- Vercel preview full gateway+worker path: `The children have two books.` returns live grammar, child/Plur/nsubj, exact ranges, model provenance; meaning/etymology unavailable. Private worker separately returned an authenticated real parse.

## Runtime findings fixed

Cloud Node entrypoints need explicit ESM bundling because the Electron project has CommonJS defaults. Vercel also rejected the newer light-my-request/cookie CJS-to-ESM boundary. A compatible 6.6.0 adapter is pinned; API tests use `--no-experimental-require-module` to reproduce that restriction.

## Remaining pilot gates

No linguistic accuracy certification, context-sensitive semantic explanations for arbitrary text, broad etymology coverage, durable notes, distributed quotas or uptime guarantee. CPU inference may finish after request cancellation. Per-instance limits and Hobby caps are suitable for a small personal alpha, not proof of production capacity. Do not scale promotion until the manual correctness/usefulness pilot in LAUNCH_STRATEGY.md passes.
