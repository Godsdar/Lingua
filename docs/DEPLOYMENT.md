# Static deployment

## Vercel

Production concept: https://lingua-lac.vercel.app/concept/
Dictionary app: https://lingua-lac.vercel.app/

`vercel.json` uses `npm ci`, `npm run build:web`, and the `web/dist` output.
There are no server functions or paid inference services. Existing GitHub CI
checks tests, types, all four builds, and the Docker images.

To publish using your own Vercel account:

```sh
vercel link
vercel deploy --prod
```

The current project is published through the CLI; this does not imply that every
GitHub push automatically publishes to Vercel. Connecting a Git integration is a
separate configuration step. Do not commit `.vercel/`, `.env*`, or access tokens.

## GitHub Pages

Mirror: https://godsdar.github.io/Lingua/concept/
The repository is named `Godsdar/Lingua`; use that capitalization in Pages paths.
The Pages workflow runs tests and typechecking before uploading its web build.

The concept is a second Vite entry at `web/concept/index.html`, built into `web/dist/concept/`. Vercel runs tests and typechecking before building; GitHub Pages retains its own equivalent gates.
Relative assets work on Vercel’s root and the Pages repository prefix.

## Verification

Check `/`, `/concept/`, favicon, theme selection, Reading/Study switching, and a
report download. Concept notes are session-only and disappear when reloading.

## Opt-in backend (ADR-012)

The static Vercel/Pages sites do not start the new API. Run it locally or use the
separate `server` Docker target; see [BACKEND_RUNBOOK.md](BACKEND_RUNBOOK.md).
CI builds and smoke-tests both the compiled Node process and the API container.
No public API host, service credential, paid plan, or client integration is
provisioned by this change. Never set `LINGUA_API_KEY` as a public Vite variable.
