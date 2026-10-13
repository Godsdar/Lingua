# ADR-012: Node.js backend for bounded language services

## Status
Accepted, 2026-10-13, at the owner's explicit request. Supersedes ADR-009's no-backend restriction and that restriction in ADR-010/011. The $0 budget, privacy, source evidence and independent analysis layers remain binding.

## Context
Lingua needs a server boundary for validation, provider credentials, cancellation, bounded concurrency and future sentence engines. TypeScript is already the main language. A modern framework does not by itself deliver production availability.

## Decision
Use Node.js 24 LTS, strict TypeScript and Fastify 5 as a modular monolith. Pin installed versions in package-lock.json. Keep HTTP transport, application services, external adapters and browser-compatible data contracts separate. Vite builds an ESM Node entry; no Electron or UI runtime is imported by the server.

First implementation: versioned JSON API, generated OpenAPI, prepared sentence/family adapter with explicit provenance, optional live translation through the existing provider module, cancellation, per-process bulkhead and circuit breaker, authentication for production API access, bounded request/IP limits, health/readiness, safe operational logs, graceful shutdown and a non-root container target. No accounts, database, document persistence or background jobs yet.

Keep the public static concept usable independently. The server starts locally; public browser integration requires a same-origin gateway/session design. A service API key must never be embedded in browser code. Do not silently start sending concept text to a new server.

## Alternatives Considered
- Rust/Axum: capable option, but introduces a second language and duplicates existing adapters without a measured CPU bottleneck. Consider an isolated worker if profiling justifies it.
- NestJS: useful conventions, but decorators and an extra framework layer are unnecessary for this bounded service.
- Bare node:http: fewer packages but more custom parsing, validation and lifecycle code to maintain.
- Microservices, Redis and PostgreSQL now: add operational cost without a current persistence or multi-replica requirement. Introduce them only at the documented triggers.

## Consequences
We can exercise backend failure modes locally at $0. This is a tested foundation, not a deployed highly available service or a new live grammar engine. Production rollout still requires measured capacity, TLS/gateway, secret rotation, monitoring and an operating budget or explicitly accepted free-tier limitations. See BACKEND_ARCHITECTURE.md and BACKEND_RUNBOOK.md.
