# English sentence engine evaluation

Status: evaluation plan, 2026-10-13. No candidate has been benchmarked or selected. No hosting or API costs are authorized.

## Candidates

| Candidate | Why compare | Constraints to measure |
|---|---|---|
| Local CPU parser, e.g. spaCy or Stanza | Offline analysis, no submitted text, reproducible version | Model size/license, cold start, packaging, UD mapping, quality |
| Browser/worker parser with an openly licensed downloadable model | Static hosting, user-controlled download, no server | Actual dependency-parser availability, RAM/download, mobile support; not assumed feasible |
| Cloud structured parser or LLM | Explanation and broader coverage | Cost, retention, explicit sending scope, valid offsets/heads, ambiguity, rate limits; no assumed free tier |

A local Python tool can run the comparison; this does not imply shipping a Python backend. Keep provider-specific fields outside the normalized model. Never ship keys to the static web or extension.

## Frozen pilot corpus

Use the three prepared examples plus these cases. Annotate tokens, head relations and expected ambiguity before scoring an engine. These checks are review prompts, not a complete gold dataset.

| Text | What must be examined |
|---|---|
| My mother gives me water. | Subject, object, recipient, present agreement |
| She has been reading the book. | Auxiliary chain, aspect, lexical head |
| The book that I bought yesterday is fascinating. | Relative clause, copula, clause head |
| Did she give him water? | Question auxiliary; subject still she |
| Please give me the book. | Imperative; absent expressed subject |
| I don't think he knows. | Negation scope and embedded clause |
| The book was written by her. | Passive voice and agent |
| I saw her duck. | Competing noun/verb readings; do not force certainty |
| Visiting relatives can be tiring. | Structural ambiguity |
| They saw the man with a telescope. | Attachment ambiguity |
| The water is cold, but the tea is hot. | Coordination and two clauses |
| If it rains, we will stay home. | Conditional clause boundaries |
| The children have two books. | Plural forms and agreement |
| Water, water everywhere. | Repeated occurrences and fragment |
| I'm looking forward to seeing you. | Contraction, multiword expression |
| She gave it up. | Phrasal verb; no fabricated etymology of the phrase |
| Can you open the window? | Form versus possible pragmatic request |
| 🌱 My mother gives me water. | UTF-16 offsets after an astral character |
| Café is a borrowed word. | Combining accent; exact source preservation |
| She reads. He listens. | Separate sentence contexts |

## Common output boundary

Input: document ID, original text, selected UTF-16 `[start,end)`, containing sentence range, language, explicit request ID. Never silently submit the full long document.

Result: engine/model/version, source sentence range, token IDs + original ranges, lemma/POS/features, head/relation, independent statuses for grammar/meaning/translation/etymology, warnings and provenance. Ambiguous interpretations remain separate. Unknown fields are absent, not guessed. Reject invalid/cyclic heads and stale responses before rendering.

## Decision record to produce

For each candidate record exact package/model versions, hardware, warm/cold latency, peak memory, download size, failures, token/range fidelity, morphology and dependency errors, licensing, and cost per 1,000 sentences if applicable. Evaluate explanations separately from syntactic accuracy. Use a linguistically reviewed reference and document disagreements; fixture resemblance is not evidence of general accuracy.

Minimum adapter gate: 100% valid source slices/head references; no stale results after edits; visible unsupported/error states. Quality and latency thresholds require measured baseline and user review before production claims. If no candidate is usable within $0, retain the labeled concept and local research path instead of disguising a paid dependency.
