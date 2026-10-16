# ADR-015: Night notebook for language exploration

## Status
Accepted 2026-10-16 at the owner's request. Refines the reading surface in
ADR-010/011 using the design research and the owner's clarified priority:
curiosity and self-directed language learning through a coherent tree aesthetic.

## Context
The working concept already has explicit live grammar, lexical evidence,
curated families, notes and exports. Its dense controls and mechanically spaced
tree give little emphasis to exploring a word. A wholesale rewrite would risk
those working features and the separate saved-root collection.

## Decision
Apply Night notebook to `/concept/` in place, keeping the existing routes,
providers, evidence model and browser storage contracts.

- Put a readable passage and Word origins first. The text editor is an explicit
  disclosure, with analysis controls and privacy information available inside.
- Use theme tokens, serif word forms, restrained monospace metadata, a quiet
  dotted canvas and a single selected lineage. Tokyo Night, Light and Graphite
  remain available. No external fonts or new dependencies.
- Keep D3 hierarchy coordinates, React SVG and Motion. Increase vertical room
  for word/language labels. Start with up to three branches sampled across the
  available endpoints; disclose the rest individually or together. This is a
  presentation choice, not a claim about linguistic significance.
- Animate branch entry, exit and retained positions within 320 ms. Initial
  content is immediately available; theme changes never replay the tree.
  Removed nodes are inert during exit. Reduced motion sets duration to zero.
- Keep the selected form and evidence in a field-note inspector. Its clickable
  lineage follows real parent links. Partial live source graphs keep their
  different orientation and typed relations; components are not ancestors.
- Keep dashed omitted stages, reconstructed forms, source/revision links and
  CC BY-SA. Folding all live source branches retains the selected word itself.
  Wide graphs scroll natively, and the inspector stacks below on narrow screens.

## Alternatives Considered
- A new graph renderer or fabricated foliage: rejected; neither improves the
  evidence model, and both introduce unnecessary risk or misleading ancestry.
- Replacing the Dictionary surface now: deferred until the separate feature and
  saved-root migration review. Its existing entry point remains accessible.
- A full frontend migration: deferred. Existing React explorer islands provide
  stable branch state without rewriting analysis, notes or exports.

## Consequences
The word family becomes the visual focus while grammar and meaning remain
available. The editor takes one click to open. Large trees still need horizontal
scrolling; sourced coverage remains limited by Wiktionary extraction. This is
an alpha design improvement, not evidence of retention or production readiness.

## References
- [Design research](../DESIGN_RESEARCH_2026-10-16.md)
- [Tree and analysis interaction](../TREE_AND_ANALYSIS_DESIGN.md)
- [Lexical evidence contract](ADR-014-live-lexical-evidence.md)
