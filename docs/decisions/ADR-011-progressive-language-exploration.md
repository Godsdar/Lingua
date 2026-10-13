# ADR-011: Progressive language exploration

## Status
Accepted. Extends ADR-007 and ADR-010; supersedes ADR-010's copy-only build and deferred graph integration. The dictionary UI remains governed by ADR-008.

## Date
2026-10-13

## Context
The owner prioritizes minimal design, exploratory 2D families, and contextual analysis of words, expressions, and sentences. The $0 concept uses prepared analyses. A flat dependency list and a single “more relatives” switch did not demonstrate this interaction. Copied JavaScript assets also bypassed the typed application build.

## Decision
- Build `/concept/` as a second Vite entry from `web/concept/index.html`. Keep its public URL and the dictionary entry. No backend, keys, accounts, or new dependencies.
- Use typed pure domain functions for occurrence selection, graph validation, and layout. Use React islands for the two explorers, D3 hierarchy for historical families, and Motion for keyed nodes and SVG paths. The surrounding legacy concept controller remains JavaScript for this bounded migration.
- Keep syntax and ancestry as separate graphs. Syntax arrows mean dependent → head. Historical parent links require evidence and carry condensed-stage information; proximity and translation are not evidence.
- Open three modern branches. Reveal individual languages, focus a selected lineage, and offer explicit scale controls. Keep labels legible with a horizontally scrollable canvas instead of shrinking text to fit. Source word remains visible in family mode.
- Use stable source IDs within a family. Animate entering nodes and links and movement of retained nodes for 320 ms; syntax emphasis takes 180 ms. Reduced motion makes these transitions immediate. No ambient animation or fake loading delay.
- Persist only theme/view preferences. Notes remain explicit session snapshots until a versioned notebook with restore, migration, quota handling, and deletion is implemented. Make the limitation visible before a user relies on saving.
- On edits, invalidate the result and prevent exporting it as analysis of new text. An already saved snapshot remains unchanged.
- Reject branching `ety-tree` fallback data while the legacy API can represent only chains. Preserve available wikitext results instead of flattening siblings into invented ancestry.

## Alternatives Considered
- Rewrite all three applications now: deferred until the parser contract is validated.
- Add a heavy graph engine or replace MUI: unnecessary for two small text diagrams; existing dependencies cover the interaction.
- Claim fixture matching is a parser: rejected because arbitrary input has no computed analysis.
- Introduce an LLM endpoint immediately: rejected pending quality/privacy/cost comparison and a $0 operating path.

## Consequences
The concept now exercises the chosen graphics stack and its domain logic is tested. Its DOM controller and HTML report renderer still need gradual typed extraction. Graph navigation is scroll + scale, not drag pan or pinch zoom. Exported graphs retain all source records but remain a separate static renderer. This is a research alpha, not a production language analyzer.
