# Contributing to Uberlang

Keep changes focused and include a reproducible input and expected result.
Distinguish live dictionary behavior from prepared concept data. New historical
relations need sources; matching spelling or meaning is insufficient.

Keep `src/core/` browser-compatible and network calls in provider adapters.
Preserve Wiktionary attribution. Do not place provider keys in public bundles.

Before opening a pull request, run `npm test`, `npm run typecheck`, and relevant
builds. Changes to the shared core require the desktop, extension, and web builds.
Check layout, keyboard interaction, unavailable-data states, and reduced motion
when changing the interface. Repository-specific instructions are in `AGENTS.md`.
