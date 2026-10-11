# AGENTS.md

Living list of non-discoverable landmines and workflow rules. `README.md` covers
commands; `docs/` covers product and architecture intent. If something can be
learned by reading the repo, it does not belong here.

## Scope & routing

- One shared core (`src/core/`) feeds three surfaces: Electron (`src/main`,
  `src/preload`, `src/renderer`), the Chrome MV3 extension (`extension/`), and the
  static web app (`web/`). **A change in `src/core/` affects all three** — verify
  them all before finishing:
  `npm run typecheck && npm run build && npm run build:ext && npm run build:web`.
- Product/UX intent lives in `docs/DESIGN.md`, `docs/POSITIONING.md`,
  `docs/GRAPHICS.md`. Record architectural decisions as new ADRs in
  `docs/decisions/` (`ADR-00N-*.md`, sequential; never delete old ones).

## Non-discoverable commands

- Tests use Node’s built-in runner (`npm test`); Node 24+ is required for the
  TypeScript tests. The gate is tests, `npm run typecheck`, and the three builds.
- Validate the container pipeline locally with `docker build --target ci .`
  (typecheck + all builds inside the image).

## Landmines / do-not-touch

- **`src/core/**` must stay browser-compatible.** It is imported by the web app
  and the MV3 extension, so it may use only web APIs (`fetch`, `URLSearchParams`,
  `AbortController`); read env defensively (`typeof process !== 'undefined'`).
  No `fs`, `path`, `child_process`.
- **Translation goes through `src/core/providers.ts` only.** Do NOT reintroduce
  unofficial Google Translate endpoints (`translate.googleapis.com`,
  `clients5.google.com`) — removed on purpose (ADR-003). Default is MyMemory;
  DeepL / LibreTranslate are opt-in via `DEEPL_API_KEY` / `LIBRETRANSLATE_URL`.
- **Never ship provider keys in client code.** The web and extension bundles are
  public; `DEEPL_API_KEY` / `LIBRETRANSLATE_URL` must stay server-side (desktop env
  or a proxy). There is no backend today by design (ADR-009).
- **Wiktionary requests must stay batched and throttled** (`src/core/wiktionary.ts`:
  `queryBatch`, `getLexicons`, the scheduler). Do not add parallel per-word fetches
  or bypass the min-gap/429 handling — Wikimedia rate-limits hard.
- **IPC contract is `src/shared/types.ts`** (`TranslateRequest`, `AnalyzeRequest`,
  `LinguaApi`, `IPC`). Change it once, then update main, preload, and renderer together.
- **Adding a new network host** (data source) requires updating CSP `connect-src` in
  `src/renderer/index.html`, `web/index.html`, and `extension/public/manifest.json`
  (+ `host_permissions` in the manifest), or requests are silently blocked.
- **Graphics stack is fixed (ADR-007):** `d3-hierarchy` layout + React-rendered SVG
  + `motion` + `modern-screenshot`. Do not introduce PixiJS/ECharts/Three/Konva for
  the tree, and never let heavy renderers enter the extension popup bundle (MV3).
- **Existing application visual language (ADR-008 / `docs/GRAPHICS.md`):** "Linguist's Atlas" —
  `ultramarine` = shared ancestor, `gold` = the single "aha" accent. Do not
  reintroduce the generic cream `#f4f1ea` + terracotta `#c2410c` theme.
- **TypeScript 7:** `baseUrl` was removed — `tsconfig` `paths` must use relative
  targets (`./src/...`). The typecheck scripts pass `--composite false` on purpose.

- The separate reading concept uses theme tokens and prepared data (ADR-010).
  Its grammar is not a live parser; do not describe it as one.

## Data & privacy (non-negotiable)

- Etymology/POS/translations come from English Wiktionary under **CC BY-SA** — keep
  the attribution in the UI; never scrape Etymonline.
- No accounts, no telemetry; nothing leaves the device beyond the dictionary and
  translation requests. Keep user collections in `localStorage`.

## Gotchas

- Share-card canvas (`ShareCard.tsx`): `await document.fonts.ready` before drawing,
  and reset `ctx.textAlign` at the start of every draw (the context is reused).
- Etymology is rendered by `src/renderer/src/components/EtymologyTree.tsx` (SVG +
  `motion`, laid out with `d3-hierarchy`). The tree model is built in
  `src/core/etymologyTree.ts` (`buildEtymologyTree`). Animation must be `motion`
  (ADR-007), not GSAP or canvas renderers.
