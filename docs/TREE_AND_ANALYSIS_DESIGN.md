# Lingua: interaction and analysis design

Accepted direction, 2026-10-13. Visual references: Zen Notes and Monkeytype; Tokyo Night, Light, Graphite. This document describes shipped concept behavior and the next implementation gates separately.

## Product promise

Read a small piece of language, understand how it works, and follow a word's history. The entry point is a sentence or selected occurrence, not an automatic translation of a whole document. English UI. Translation is optional and independent from explanation.

## Layers and evidence

| Layer | Question | Representation | Source requirement |
|---|---|---|---|
| Meaning | What is said here? | Short explanation, explicit alternative readings | Curated / parser-supported / generated labels kept distinct |
| Morphology | What form is this? | Lemma, POS, features | Contextual token analysis, not the dictionary's first POS |
| Syntax | How does it connect? | Dependency arcs + accessible relationship list | Token ID, head ID, relation, original offsets |
| Etymology | Where did this form come from? | Ancestors below; sourced modern relatives above | Entry and relation evidence; reconstruction and omitted stages |
| Translation | How might this be expressed in another language? | Optional disclosure | Provider and context; failure must not hide other layers |

An utterance can be a fragment, question, command, or several sentences. The UI must not pretend these always have one root or a uniquely knowable intent. The current syntax explorer accepts one valid dependency tree. Split future multi-sentence input into sentence contexts; never manufacture a connecting root between sentences.

## Historical explorer — implemented

- Start with the selected English word and two related language branches.
- Each language chip reveals or hides its evidenced lineage. English stays anchored.
- A node click selects its historical form and lights its ancestor path. The inspector links both the entry and available relation evidence.
- “Selected path” isolates that node's ancestry. “Family” returns to the disclosed branches. Removing a branch containing the selected node returns selection to English.
- A dashed edge means omitted historical stages; `*` means reconstruction. Neither conveys certainty or chronology by itself. Vertical distance is layout space, not elapsed time.
- Text keeps a legible size. Wider families scroll; scale buttons support 75–150%, with a reset. On narrow screens the inspector moves below the tree.
- Branch changes reuse stable IDs. Retained nodes move; newly disclosed solid links grow; dashed condensed links fade in so their pattern remains legible. Theme changes do not replay the reveal.
- Buttons work by keyboard; graph regions receive focus and support native scrolling. There is no ARIA tree role without full tree keyboard semantics.

## Syntax explorer — implemented

- Preserve word order horizontally. Connect dependent → head; mark the sentence root.
- Default to the selected word's incoming/outgoing connections; optional full connections provide context. Full morphological details stay in the inspector.
- Clicking a diagram word updates the source-text selection, features, and explanation. Keep keyboard focus on the word.
- Selected expressions highlight their participating tokens and contextual connections, without receiving a fictitious single etymology.
- Keep the complete dependency list in a disclosure for reading and export. Punctuation remains in the data even though the compact diagram omits it.
- Long graphs scroll; do not reduce labels to tiny text. Arc height grows to avoid clipping long dependencies.

## Motion contract

| Trigger | Motion | Limit |
|---|---|---|
| Reveal branch | Node fade/short movement, line growth; existing coordinates interpolate | 320 ms |
| Change syntactic selection | Connection emphasis | 180 ms |
| Change theme | Color tokens update | No scene replay |
| Reduced motion preference | Immediate final state | No simulated movement |

Motion explains a user's action. No looping leaves, camera flights, or delayed access to content. Collapsed nodes currently disappear immediately; refined exit transitions can follow usability evidence.

## Next gates

1. Test the three prepared examples with five volunteer learners: ask them to identify subject/head, explain a verb phrase, find an ancestor, distinguish a reconstruction, and export an insight. Do not prompt them through the task. Record confusion and completion manually; no telemetry or unsolicited outreach.
2. Fix unclear interaction labels before adding more visual decoration. Working target: four of five can complete the core sequence in five minutes without help; this is a proposed acceptance target, not a measured result.
3. Compare sentence engines on the corpus in ENGINE_EVALUATION.md. Add ambiguity, question and command cases. Grammar may explain structure; it must not claim certainty about speaker intention.
4. Implement durable local notebooks with schema version, exact text + UTF-16 occurrences, immutable provenance, restore tests, capacity errors, deletion and export recovery. Session saving is not a substitute.
5. Bring the accepted workspace into the typed React application, reuse providers, then offer live-analysis alpha. Desktop/mobile packaging and paid services follow demonstrated usefulness.

## First-user release boundary

The public page must still say “prepared examples”. It is suitable for testing the interaction concept. It is not yet suitable for users expecting arbitrary sentence analysis or durable saved work. Do not remove that disclosure until the relevant gates pass.
