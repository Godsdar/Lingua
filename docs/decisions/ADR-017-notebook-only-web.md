# ADR-017: Retire the Dictionary web shell and make Night notebook the home page

## Status
Accepted 2026-10-16 at the owner's explicit request. Supersedes the two-web-entry
product arrangement in ADR-010/011 and activates the owner brief's removal plan.

## Context
The old Translator / Language tree / My roots app and Night notebook have separate
designs and entry points. The owner wants the old Dictionary app removed from the
product. Its browser entry imports a renderer shared with Electron, while the
notebook's live lexical engine is independent of that shell.

## Decision
Serve the existing notebook at `/` and `/index.html`. Delete `web/src/main.tsx`
and its obsolete browser API declaration; exclude the old renderer and its MUI
bundle from the web build. Remove the Dictionary navigation and README entry.
The former `/concept/` and `/concept/index.html` serve a tiny external-script
redirect using `location.replace`, retaining query/hash and repository prefixes.
A plain fallback link works without JavaScript. Do not redirect the home page.

Existing `?q=` URLs prefill literal text, limited to the editor's 6000 characters;
they never trigger automatic network analysis or interpret HTML. Legacy language
parameters do not override the notebook's English-only analysis contract.

## Feature and data review
| Earlier feature | Disposition |
|---|---|
| Translator and language picker | Retired from the web; notebook retains its explicitly prepared translations |
| Dictionary meanings and word sources | Preserved through the notebook's explicit lexical lookup and history expansion |
| Language overview / translation comparison tree | Retired; no guessed connections are transplanted into evidence graphs |
| My roots collection | Original `lingua.roots.v1` key untouched; conditional local JSON backup action preserves the payload verbatim, even unknown fields or damaged JSON |
| PNG share card | Retired web UI; current Markdown/JSON/HTML study reports remain |
| `?q=` share URLs | Prefill in the notebook, with no automatic request |
| Session study notes, themes, grammar, trees | Existing notebook behavior retained |

The backup is not an import or a migration into session notes. Browser origins
remain separate; we cannot recover another origin's collection from the current
one. No user collection is inspected by a developer or uploaded. Electron storage
is not modified. Shared renderer/core/IPC and the extension remain in the repository
because they support earlier local prototypes; none restores the removed web app.
Desktop notebook migration is separate future work, not an implicit new release.

## Alternatives Considered
Removing only the link leaves the unwanted app publicly accessible at `/`.
Deleting shared renderer/core code breaks other local surfaces without helping
the web product. A server-only redirect would fail on static Pages. Automatically
converting roots into study notes would invent missing context and evidence.

## Consequences
There is one published web workspace. Bookmarks keep working, and the production
web bundle no longer includes the old interface. Existing root data remains
recoverable locally; no data keys, API credentials or hosting identifiers change.
Verify root and old URLs, nested static paths, literal query input, backup fidelity,
and existing notebook interactions. Maintain all existing build/CI gates.
