# ADR-020: Publish the demo at uberlang.vercel.app

## Status
Accepted 2026-10-16 at the owner's explicit request. Updates ADR-019's demo address.

## Decision
Use **https://uberlang.vercel.app/** as the canonical demo link in README and
current deployment guidance. Attach this free Vercel domain to the existing
`lingua` project, ID `prj_6CugFU5BXKdKEUl0HHPr3gqx1x6g`. Do not create a second
service or change another project. Keep the old `lingua-lac.vercel.app` alias
working and assign both to each subsequent production deployment.

Configure `LINGUA_PUBLIC_ORIGIN` with the new origin and
`LINGUA_PREVIOUS_PUBLIC_ORIGIN` with the former origin. The gateway accepts
only these exact configured origins and its trusted Vercel deployment URL;
no wildcard/suffix/Host-header trust is introduced. Private worker credentials,
rates, limits and same-origin client requests remain unchanged.

## Consequences
The address follows the brand without new costs. Local browser storage is scoped
to each origin: existing collections remain recoverable from the old alias and
are not automatically copied. Previously downloaded reports are unchanged.
Check domain persistence on the project, assignment after a new production
deployment, the interface and live grammar/lexical/history routes. Verify missing
and spoofed origins plus unauthenticated private-worker requests remain rejected.
