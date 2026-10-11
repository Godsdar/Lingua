# ADR-010: Separate reading concept and selectable minimal themes

## Status
Accepted for the concept. Production integration remains proposed.

## Date
2026-10-11

## Context
The owner wants sentence meaning and detailed grammar, selective exploration
within longer text, and exported notes. Preferred references are Zen Notes and
Monkeytype with selectable themes. Hosting and inference budgets are zero.
The dictionary application cannot yet provide contextual syntax analysis.

## Decision
- Publish a separate static `/concept/` alongside the dictionary app through
  Vite's public directory and the existing GitHub Pages deployment.
- Label analyses and families as prepared examples. Arbitrary text must not
  receive invented linguistic results.
- Provide Reading/Study layouts and Tokyo Night/Light/Graphite tokens. This
  refines ADR-008 for the concept; the existing Atlas application remains until
  deliberate React integration.
- Separate styles, interaction, and prepared data. Load only local assets and
  retain no dependency on the conversation's presentation runtime.
- Translation is optional. Explore long text through selected occurrences or
  expressions and the containing sentence's context.
- Export session notes as Markdown, JSON, or HTML with ranges, provenance,
  dependencies, and historical sources.
- Preserve ADR-009's no-backend decision. Compare engines before choosing live
  grammar infrastructure; defer paid services and signed releases.

## Alternatives Considered
- Replace React immediately: rejected because prepared analyses do not implement
  a live sentence engine.
- Require a paid API: rejected because it conflicts with the budget and does not
  establish grammatical correctness.
- Publish the conversation wrapper: rejected to avoid host-specific dependencies.

## Consequences
The repository contains a usable workflow reference, not a production NLP
feature. Notes are session-only. Durable storage, engine evaluation, typed
integration, and reduced-motion-aware animation remain planned work.
Historical documentation is preserved.
