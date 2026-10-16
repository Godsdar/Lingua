# ADR-016: Expand live word histories one cited entry at a time

## Status
Accepted 2026-10-16 at the owner's request. Extends ADR-014's lexical evidence
and ADR-015's Night notebook without a paid API or recursive server crawler.

## Context
A live lookup previously exposed only a word's immediate sources. Readers could
unfold prepared water/mother families but could not continue the history of a
new word. Similar-looking words and complete-looking generated trees would not
meet the requirement for real evidence.

## Decision
Expose an explicit `POST /api/etymology` → authenticated `/v1/etymology` route.
A request has only `{language, term}`. The server derives the English Wiktionary
page title from a bounded language-name map and a validated form; callers cannot
supply a host, URL or namespace. Reconstructed forms use the fixed Reconstruction
namespace. Latin/Old English editorial length marks are normalized for lookup,
while displayed cited forms retain their original spelling.

One click loads one public page using the existing serialized Wiktionary
transport. Headword and continuation requests share the 128-page / 2M-character,
one-hour cache and the two-slot / seven-second dictionary guard. Reject parsing
pages over 500k characters. Public per-instance rate limits and cancellation
remain in place. No sentence text is required for continuation requests.

Parse only the requested language section and supported explicit templates:
inheritance, borrowing, derivation, components, and explicitly marked nonlemma
`form-of` relationships. A word part or inflected form is not historical ancestry.
A nested etymon annotation cannot automatically skip an intermediate cited form.
Unknown qualifiers, language overrides, uncertain prose, unsupported templates
and absence of an entry stop expansion instead of creating plausible edges.

Keep all returned etymology alternatives, including those without a supported
continuation. If more than one exists, the reader chooses one using a definition
summary and the linked entry. Record that choice in the graph and reports; it is
exploration, not automatic word-sense disambiguation. Never join alternatives.

Attach the chosen immediate sources beneath the selected node with stable IDs.
Retain the incoming relation's original revision, replace the inspected node's
entry link with its inspected revision, and cite that revision on new edges.
Repeated forms in the same language along one path stop further expansion.
The browser caps an exploration at 64 forms and eight steps; the server remains
stateless and performs no recursive traversal. Folding changes visibility only.
Source trees use D3 tree layout so short component branches remain near their
parents while another path grows deeper. Historical curated families retain
D3 cluster layout and their existing direction.

Preserve loaded graph data across view changes and in immutable saved notes.
Markdown, JSON and HTML exports retain new forms, parent relationships, revision
links, reader choices and limitations. Editing/changing the selected occurrence
or unmounting the explorer cancels pending work; stale responses are discarded.

## Alternatives Considered
- Recursive server graph generation: rejected for now; it magnifies external
  traffic and ambiguity, with no useful fixed promise of complete coverage.
- Guessing cognates or joining all etymologies: rejected because layout proximity
  is not evidence and distinct senses may have unrelated histories.
- Paid or free hosted LLM inference: unnecessary for traversing explicit sources.
- Flattening inflections into historical descent: rejected; preserve form-of.

## Consequences
New words can produce growing, branching histories using the same animation and
inspection controls as the notebook. Coverage depends on entries and supported
templates. A short tree or stopped branch can be correct; breadth is never a
quota. Descendant/cognate discovery and unsupported-language expansion remain
future work. Language labels and entry revisions are visible at every step.
