# ADR-018: Use Uberlang as the visible product name

## Status
Accepted 2026-10-16 at the owner's explicit request and spelling correction.

## Decision
The product is **Uberlang**, with only U uppercase. Apply the name to current
UI copy, document/page/window headings, README, new study reports and filenames.
New JSON study reports add `application: "Uberlang"`; their existing schema version,
documents, provenance and occurrence coordinates remain compatible. Root backups
retain their original payload, with the new brand only in the download filename.
The existing initial-letter favicon uses U and retains its notebook/leaf styling.
Refresh README screenshots from the actual interface at 2× resolution.

Keep repository Godsdar/Lingua, Vercel project/domain, npm/package identity,
Electron packaging identity, IPC/API contracts, DOM IDs and local-storage keys.
Renaming those would be a separate migration with consequences for URLs, installs
and existing collections. Window and renderer labels of the retained local
prototypes use the current brand, but this is not a desktop release.
Do not rewrite earlier ADRs, historical exports or user text.

## Owner correction

The owner subsequently chose **L** for the logo and favicon. This supersedes
the initial U-symbol choice above; the product name remains **Uberlang**.

## Consequences
Readers see one consistent name while existing links and data remain valid.
The owner brief and implementation playbook record the exact spelling.
Verify visible text, page title, favicon, responsive header and downloaded
Markdown/JSON/HTML reports; run the repository build gates.
