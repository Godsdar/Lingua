# Live lexical alpha review — 2026-10-16

## Change

The reading workspace now has two independent explicit requests: sentence
analysis through the private spaCy worker, and headword lookup through English
Wiktionary. A structure-based sentence reading retains negation, modality,
questions and passive cues. Definitions remain sense alternatives. Supported
historical source graphs keep separate etymologies, typed relations, revision
links and CC BY-SA attribution. No paid inference API is involved.

## Review findings resolved

A second agent independently reproduced and reviewed fixes for:

- Uncertain `<unc>` sources incorrectly becoming asserted edges.
- Legacy prose overriding an explicit modern etymon.
- Suppressed source terms (`-`) becoming graph nodes.
- Negated origin statements becoming borrowing edges.
- Cancellation waiting through 429 backoff or an unrelated queued request.

Regressions cover all five cases. The independent lexical/transport rerun passed
11 tests. This review is scoped to the extractor and transport, not a claim of
complete linguistic correctness or a full security audit.

## Validation

- Full `npm test`: 27 core/frontend domain tests and 27 server tests passed.
- Typechecking: desktop, browser and server passed.
- Electron, extension, web, standalone server and bundled gateway builds passed.
- Standalone API startup/auth/SIGTERM and real-socket cancellation smoke passed.
- `docker build --target ci` passed.
- Real local Wiktionary lookups: book, computer, bank, serendipity and cat.
- New sentence-reading regressions cover questions/modality/negation, passive
  subjects, embedded-clause negation and copular complements.

Cloud preview `lingua-g85zv08xa-godsdar.vercel.app` returned live Wiktionary
revision 93583601 for `computer`: six senses and two component edges (`compute`,
`-er`). A separate new passive sentence returned live grammar and a structure-based
reading with an explicit agent phrase. An absent local dictionary entry returned
`unavailable` for both layers.

Native Chrome desktop QA covered a new `book` sentence, live grammar/reading,
18 sourced senses and the `bok` source graph; a lexical-only `computer` lookup,
component selection, the Light theme, session saving and JSON/Markdown/HTML
export, including an actual HTML download. A screenshot was captured. Browser
extension control was unavailable; exact mobile viewport, reduced-motion and
multi-family switching were not rechecked in this turn. Those remain limitations
of this release's manual UI verification, not claimed passes.

## Remaining limits

Only supported source relationships are extracted; this is not recursive history
or a complete multilingual family. Unsupported/uncertain entries stay unavailable.
The first displayed etymology is a browsing default, not automatic sense selection.
Word sense, reference, irony and author intent remain unresolved. Cache/rate limits
are per process; Hobby availability and Wikimedia limits still apply. Notes remain
session-only. No paid accounts, telemetry or automatic outreach were introduced.

Rollback reference: preceding grammar-only deployment
`lingua-2wvbi2e7b-godsdar.vercel.app` (commit `1c26af2`). No data migration.
