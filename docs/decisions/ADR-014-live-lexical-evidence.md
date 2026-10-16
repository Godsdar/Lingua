# ADR-014: Free lexical evidence and grammar-based sentence readings

## Status
Accepted 2026-10-16 at the owner's request. Extends ADR-013 beyond prepared
meanings and two curated word families. The budget remains $0.

## Context
Readers need to explore new words in their own text. spaCy supplies morphology
and syntax but cannot explain lexical senses, resolve irony or prove ancestry.
Free generative endpoints have unstable availability, privacy and quality terms;
they are not a sound dependency for this alpha.

## Decision
Keep three distinct sources of evidence:

1. A deterministic sentence reading describes the main predicate and explicit
   grammatical roles from validated spaCy tokens. It retains question, negation,
   modality and passive cues, flags additional clauses, and states its limits.
   This is a structure-based explanation, not full semantic interpretation.
2. An explicit word lookup requests dictionary senses from English Wiktionary.
   Senses are alternatives, not a claim that the first sense fits this sentence.
3. The same lookup builds bounded historical source graphs from supported
   etymology templates. Distinct etymologies remain separate. The graph may show
   only a short lineage or no safely extracted relationship. Similar spelling,
   translation, cognate mentions and neighboring templates do not prove descent.

Expose a fixed `/api/lexicon` → `/v1/lexicon` route using the existing Node
gateway's authentication, input validation, body limits and origin boundary.
The service contacts only the fixed English Wiktionary API through the shared
throttled transport. Send a selected headword, never the containing sentence or
full document, to Wiktionary. Keep lexical lookup independent from grammar so a
dictionary outage does not discard a usable parse. No provider keys or new
third-party hosts enter the reading browser bundle.

Preserve entry/revision URLs, relation evidence, reconstructed `*` forms and
CC BY-SA attribution in the UI and exported snapshots. Label extraction limits
and alternate origins. Cache public lexical data with bounded capacity and
expiry; never cache readers' sentences as lexical entries. Network and output
sizes, concurrency and request duration remain bounded; cancellation reaches
the shared provider transport. No recursive unbounded crawling.

## Alternatives Considered
- Hosted free LLM tiers: rejected as a required runtime dependency; availability,
  quotas and text processing terms vary, and fluent output still needs evidence.
- A local LLM: useful future optional experiment, but large downloads and hardware
  requirements do not fit the current public browser experience.
- Treating grammar templates as complete meaning: rejected. Definitions, syntax,
  contextual interpretation and translation have different evidence requirements.
- Treating every template as a parent: rejected. Homonyms, cognates, components,
  uncertain origins and borrowings require distinct relationships.

## Consequences
New words can acquire live definitions and source-backed history without an
inference bill. Coverage depends on Wiktionary and the conservative extractor;
absence of a graph means no supported extraction, not that the word has no
history. A graph is evidence navigation, not a complete historical family.
Manual linguistic review is still required before making quality claims.
Hobby hosting and Wikimedia availability/rate limits remain external limits.

## References
- https://en.wiktionary.org/wiki/Wiktionary:Copyrights
- https://www.mediawiki.org/wiki/API:Etiquette
- https://en.wiktionary.org/wiki/Category:Etymology_templates
- https://creativecommons.org/licenses/by-sa/4.0/
