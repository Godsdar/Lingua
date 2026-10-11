# Reading concept

The reading concept is a separate static page at `/concept/`. Vite copies
`web/public/concept/` into `web/dist/concept/`; the dictionary app continues to use
its React entry. No new backend or paid service is required.

## Files

- `index.html`: shell, layout picker, asset loading, and CSP.
- `concept.css`: product-scoped presentation and theme tokens.
- `concept.js`: selection, prepared-result display, tree layout, session notes,
  serialization, downloads, and workspace switching.
- `fixtures.js`: three handcrafted sentence analyses and two curated families.
- `favicon.svg`: Lingua’s initial-letter and leaf mark.

There are no external scripts, fonts, analytics, or API calls. The CSP disables
network connections. Editing text invalidates the previous result until the
user explores it again. Results come from prepared data, not a live parser.

## Scope and limits

The English editor accepts up to 6000 UTF-16 units. Above 50 words the concept
starts with no selected fragment; choose a word or highlight an expression.
Only exact occurrences inside prepared sentences have grammar. Word origins
are available for the prepared `water` and `mother` lemmas. An expression has an
explanation and contextual grammar, not a fabricated single-word ancestry.

Notes are independent snapshots within each workspace and exist only in memory.
Reloading clears them. Export first to keep a report. JSON contains full source
documents and ranges; exports therefore contain text supplied by the user.
HTML and Markdown include note context. Text is escaped in HTML reports, and
missing data retains its unavailable status.

Markdown, JSON, and HTML can be downloaded. The HTML preview includes a static
family diagram and contextual dependency table. At narrow preview widths a
subset of branches is drawn; the full family remains in the source table.
Standalone reports use a table fallback on small screens. PDF export,
production printing, pan/zoom, durable storage, and motion polish are not shipped.

## Provenance

Sentence fixtures are manually written demonstrations using UD-style POS and
dependency labels. They are not outputs of a validated NLP engine. Russian
translations represent possible readings, not uniquely determined meanings.

Families were curated from English Wiktionary on 2026-10-11. Each node includes
an entry URL; `edgeSource` records relation evidence. `condensed` and `skipped`
identify omitted stages: a parent can mean a condensed lineage rather than one
direct historical step. Reconstructed forms retain `*`. Available consulted
revision IDs remain in each family's sources.

Attribution: English Wiktionary contributors, **CC BY-SA 4.0**.
[License](https://creativecommons.org/licenses/by-sa/4.0/).
The concept adapts entries into curated graph representations; exported reports
preserve attribution, sources, and condensed-path information.

## Integration

The direction is recorded in [ADR-010](decisions/ADR-010-reading-concept.md).
Move interaction into typed application services and React components after
agreeing on the workflow and sentence-analysis contract. Reuse shared domain
types and provider adapters; do not turn fixture matching into a live parser.
