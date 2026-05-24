---
title: "Pulse Seat MVP - Implementation Plan"
description: "Phased FE/BE implementation plan for Pulse Seat based on system design and technical report, using Next.js, Go microservices, managed Neon PostgreSQL, gRPC Booking-to-Payment, and event-driven workers."
audience: [ai-agents, developers]
tags: [implementation, pulse-seat, nextjs, go, microservices, neon, postgres, grpc, event-driven]
created: 2026-05-24
updated: 2026-05-24
category: "product-planning"
status: draft
related:
  - /docs/pulse-seat-system-design.md
  - /docs/pulse-seat-technical-report.md
---

# Pulse Seat MVP Implementation Plan

## 1. Executive Summary

Plan này triển khai Pulse Seat MVP end-to-end gồm FE Next.js và BE Go microservices. Scope bám theo:

- [Pulse Seat System Design](../../../pulse-seat-system-design.md)
- [Pulse Seat Technical Report](../../../pulse-seat-technical-report.md)

Quyết định cập nhật: PostgreSQL production không tự dựng mặc định. MVP dùng **managed PostgreSQL trên Neon** cho dev/staging/prod, với Docker Postgres chỉ là local fallback khi developer cần chạy offline. Booking Service vẫn là consistency boundary cho reserve/confirm, nên Neon phải được cấu hình theo hướng production-safe: pooled connection cho app traffic, direct connection cho migrations/admin, compute luôn warm cho hot events, theo dõi lock wait/connection pool.

Target MVP:

- Fan discovery, event detail, seat map, reservation, checkout, ticket wallet.
- Organizer/Admin event workspace, ticket tiers, seat map builder, dashboard cơ bản.
- Staff scanner web, duplicate/void/refund detection.
- Go services: API Gateway, Identity/RBAC, Search, Booking, Payment, Ticket, Notification.
- Workers: Reservation Expiry Worker, CDC/Sync Job, outbox publisher/consumers.
- Data/infra: Neon PostgreSQL, Redis, Elasticsearch/OpenSearch, MinIO/S3-compatible storage, Redpanda/Kafka-compatible event bus.
- Internal sync call: Booking Service -> Payment Service `PaymentIntentService.CreateIntent` bằng gRPC.
- Public/API Gateway surface: REST/JSON.

## 2. Architecture Decisions For Implementation

| Decision | Implementation Consequence |
|---|---|
| Next.js App Router for FE | One web app with route groups for public/fan/organizer/staff; SSR/ISR only for safe read routes. |
| Go microservices | Each service owns package boundary, config, migrations, health checks, metrics, and Dockerfile. |
| Neon managed PostgreSQL | No production self-hosted Postgres in MVP; service schemas/databases on Neon, branch-per-env/preview, pooled app connections. |
| Booking owns availability/reservation/booking | All reserve/confirm correctness lives in Booking Service transaction. |
| Booking -> Payment create intent via gRPC | Protobuf contract required in Phase 0; Payment Service exposes gRPC server; Booking has gRPC client with deadline/idempotency. |
| Payment confirm via event bus | PSP webhook stores payment and publishes `payment.captured`; Booking confirms asynchronously and idempotently. |
| Transactional outbox | All domain events are written in the same DB transaction as business state. |
| Search/detail eventual consistency | Search uses Elasticsearch/OpenSearch read model and Redis cache; reserve always checks Booking DB. |

## 3. Managed PostgreSQL Plan: Neon

### Decision

Use Neon as default managed PostgreSQL provider for MVP environments.

### Environment Model

| Environment | Neon Setup | Notes |
|---|---|---|
| Local default | Neon dev branch or local Docker fallback | Prefer Neon dev branch for parity; Docker Postgres when offline. |
| Preview/PR | Neon branch per PR | Run migrations on branch, seed small dataset, destroy branch after merge. |
| Staging | Dedicated Neon branch or project | Same schema shape as prod; safe synthetic data. |
| Production | Dedicated Neon project/branch with paid plan | Warm compute, PITR/backups, monitored connection pool and lock waits. |

### Connection Rules

- App services use Neon pooled connection strings for normal request traffic.
- Migrations, `pg_dump`, restore, logical replication/CDC-like tasks and admin operations use direct connection strings.
- Do not rely on session-level settings in pooled mode; set schema search path at role level or fully qualify schemas.
- Each service owns its schema/database and migration history:
  - `identity`
  - `booking`
  - `payment`
  - `ticket`
  - `notification`
  - `outbox_sync` if shared operational metadata is needed
- Use separate DB roles per service with least privilege.
- Booking Service pool size must be tuned conservatively to avoid saturating Neon compute during hot events.

### Production Guardrails

- Do not allow production compute to cold-start during planned onsale/hot events. Keep minimum compute > 0 and warm before campaigns.
- Use Neon autoscaling range only within tested bounds. Raise min/max before large events if load test requires it.
- Monitor:
  - active/waiting pool connections
  - transaction duration
  - lock wait time by `performance_id`, `tier_id`, `section_id`
  - deadlocks
  - connection errors
  - slow queries
- Use direct connection for monthly backup verification and restore drills.

### External References

- Neon connection pooling uses PgBouncer and pooled connection strings; app traffic should use pooled connections, while migrations/admin tasks should use direct connections: https://neon.com/docs/connect/connection-pooling
- Neon autoscaling dynamically adjusts compute within a configured range: https://neon.com/docs/introduction/autoscaling
- Neon branching supports database branches for workflows such as preview/staging: https://neon.com/docs/introduction/branching
- Neon restore/point-in-time workflows are available through branch restore APIs/docs: https://api-docs.neon.tech/reference/restoreprojectbranch

## 4. Proposed Repository Layout

```text
pulse-seat/
  apps/
    web/                         # Next.js App Router
  services/
    api-gateway/
    identity/
    search/
    booking/
    payment/
    ticket/
    notification/
  workers/
    reservation-expiry/
    cdc-sync/
  packages/
    contracts/
      openapi/
      proto/
      events/
    go-shared/
      config/
      logger/
      postgres/
      outbox/
      errors/
  infra/
    docker-compose.local.yml
    neon/
    k8s-or-compose/
  db/
    migrations/
      identity/
      booking/
      payment/
      ticket/
      notification/
  docs/
```

## 5. Phase Overview

| Phase | Title | Primary Output | Estimate | Dependencies |
|---|---|---|---:|---|
| 0 | Foundation, Contracts, Repo Setup | Monorepo, contracts, local infra, Neon plan | 5 days | None |
| 1 | Next.js FE Shell And Design System | App shell, route groups, auth layout, UI primitives | 6 days | Phase 0 |
| 2 | Backend Service Skeleton And Gateway | Go services, REST gateway, health, telemetry | 7 days | Phase 0 |
| 3 | Neon Data Layer And Migrations | Schemas, migrations, seed, repository transaction helpers | 8 days | Phase 0, 2 |
| 4 | Discovery And Event Management | Booking event catalog, Search Service, MinIO, sync pipeline | 10 days | Phase 1-3 |
| 5 | Seat Map, Availability, Reservation | Seat map, GA/reserved hold algorithms, expiry worker | 12 days | Phase 3-4 |
| 6 | Checkout, Payment gRPC, Ticketing, Notification | gRPC payment intent, PSP adapter, ticket QR, email/SMS | 12 days | Phase 5 |
| 7 | Organizer/Admin And Staff Scanner | Dashboard, seat map builder, scanner/check-in | 10 days | Phase 4-6 |
| 8 | Hardening, Load Test, Production Readiness | Observability, security, load tests, deploy runbooks | 10 days | All prior |

Critical path: Phase 0 -> Phase 3 -> Phase 5 -> Phase 6 -> Phase 8. FE Phase 1 can run in parallel with BE Phase 2/3 after contracts are stubbed.

## 6. Phase 0: Foundation, Contracts, Repo Setup

**Goal**: Create the project skeleton and shared contracts before writing domain logic.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P0-01 | Create monorepo folders and base tooling | Both | `apps/`, `services/`, `workers/`, `packages/`, `db/`, `infra/` exist with README placeholders. | planning-skill |
| P0-02 | Define OpenAPI public REST contract v1 | BE | Search, detail, seat-map, reservations, bookings, tickets, check-in endpoints stubbed. | api-design |
| P0-03 | Define Protobuf contract for `PaymentIntentService.CreateIntent` | BE | Request/response includes idempotency, booking/reservation refs, amount, currency, buyer ref, status, client action. | microservices-architect, golang-pro |
| P0-04 | Define event envelope and core event schemas | BE | JSON schema or proto/json definitions for reservation/payment/booking/ticket/notification events. | microservices-architect |
| P0-05 | Configure local infra compose | BE | Redis, Elasticsearch/OpenSearch, MinIO and Redpanda/Kafka-compatible broker available locally. Postgres local is optional fallback. Logging and monitoring stack deferred to a later phase. | solution-architect |
| P0-06 | Configure Neon projects/branches plan | BE | Dev/staging/prod connection env vars documented; pooled/direct URLs separated. | database-optimizer |
| P0-07 | Defer CI workflow | Both | No GitHub Actions workflow is enabled in Phase 0; local lint/test/build commands are documented. CI will be added in a later phase once service and web app structure stabilizes. | solution-architect |

Quality gate:

- Contracts compile or validate.
- `make dev` or equivalent starts local dependencies.
- `.env.example` documents Neon pooled/direct variables without real secrets.

Backend unit test gate:

- Add unit tests for backend contract validation, config loading and shared envelope parsing before closing Phase 0.
- `go test ./...` passes locally for all backend packages created in this phase.
- New backend packages target at least 80% statement coverage; any exception must be documented in the phase notes.

## 7. Phase 1: Next.js FE Shell And Design System

**Goal**: Build the application shell before connecting real backend data.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P1-01 | Initialize `apps/web` with Next.js App Router + TypeScript | FE | App builds, route groups exist, `loading.tsx`/`error.tsx` patterns included. | nextjs-developer, react-expert |
| P1-02 | Implement layout shells | FE | Public, fan, organizer, staff layouts render responsive navigation. | nextjs-developer |
| P1-03 | Build design system primitives | FE | Buttons, inputs, tabs, tables, badges, modals, toasts, icons, dark mode tokens. | design-principles, react-expert |
| P1-04 | Configure API client layer | FE | Browser client and server-side BFF client call API Gateway REST only; no direct DB access. | nextjs-developer |
| P1-05 | Add route cache policy helpers | FE | `no-store` helpers for checkout/scan/payment; short revalidate helper for discovery/detail. | nextjs-developer |
| P1-06 | Stub pages with mocked data | FE | Discovery, event detail, checkout, organizer dashboard, scanner render from fixture data. | react-expert |

Quality gate:

- `next build` passes.
- Checkout/scanner routes are explicitly dynamic/no-store.
- UI works on mobile and desktop breakpoints.

## 8. Phase 2: Backend Service Skeleton And Gateway

**Goal**: Establish Go service runtime, gateway, shared libraries and observability.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P2-01 | Create Go module/service layout | BE | Each service has `cmd/`, `internal/`, config, health endpoints. | golang-pro, golang-code-style |
| P2-02 | API Gateway REST skeleton | BE | Routes forward to service clients or stubs; request IDs propagated. | api-design, golang-pro |
| P2-03 | Shared config/logger/OTel package | BE | JSON logs, `X-Correlation-Id`, trace/span IDs, metrics and trace propagation implemented. | monitoring-expert, golang-pro |
| P2-04 | Shared Postgres package | BE | Supports pooled/direct DSNs, transaction helper, retry classification. | database-optimizer, golang-pro |
| P2-05 | gRPC infrastructure for Payment Service | BE | Payment gRPC server stub and Booking gRPC client stub compile. | golang-pro, microservices-architect |
| P2-06 | Event bus abstraction | BE | Producer/consumer interface with test fake and Redpanda/Kafka adapter skeleton. | microservices-architect |
| P2-07 | Identity/RBAC baseline | BE | JWT/session middleware and role context stubbed at gateway. | hexagonal-architecture |

Quality gate:

- All services expose `/health/live` and `/health/ready`.
- Gateway can route mock endpoints.
- gRPC Booking-to-Payment smoke test passes locally.

Backend unit test gate:

- Add unit tests for gateway routing, middleware, config/logger helpers, transaction helper behavior and event bus fakes before closing Phase 2.
- `go test ./...` passes with race-prone shared packages covered by table-driven tests.
- Backend coverage must not drop below the Phase 0 baseline; new shared packages target at least 80% statement coverage.

## 9. Phase 3: Neon Data Layer And Migrations

**Goal**: Implement schemas, migration pipeline and DB access patterns on Neon.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P3-01 | Neon environment setup | BE | `DATABASE_URL_POOLED_*` and `DATABASE_URL_DIRECT_*` documented per service/env. | database-optimizer |
| P3-02 | Migration runner | BE | Migrations use direct Neon connection; per-service migration history tracked. | golang-pro, database-optimizer |
| P3-03 | Booking schema | BE | Events, performances, venues, seat maps, tiers, availability, reservations, bookings, outbox tables created. | database-optimizer |
| P3-04 | Payment schema | BE | Payment intents, payments, refunds, PSP refs, raw webhooks, outbox tables created. | database-optimizer |
| P3-05 | Ticket schema | BE | Tickets, ticket scans, QR token hashes, outbox tables created. | database-optimizer |
| P3-06 | Notification schema | BE | Templates, send queue, delivery logs, outbox tables created. | database-optimizer |
| P3-07 | Identity schema | BE | Users, sessions, roles, organizer scopes created. | database-optimizer |
| P3-08 | Repository transaction helpers | BE | `WithTx`, idempotency helpers, outbox insert helpers, lock timeout config. | golang-pro, hexagonal-architecture |
| P3-09 | Seed data | Both | Dev/staging seed includes venues, events, tiers, seat maps and test users. | golang-testing |

Neon-specific quality gate:

- App services use pooled DSN.
- Migrations and backup/restore commands use direct DSN.
- No migration relies on pooled transaction-mode session behavior.
- Booking reservation tests run against Neon dev branch and local fallback.

Backend unit test gate:

- Add unit tests for migration discovery, repository transaction helpers, idempotency helpers and outbox insert helpers before closing Phase 3.
- Repository tests use test doubles where possible and Neon/local integration tests are tagged separately from fast unit tests.
- `go test ./...` passes; changed backend packages target at least 80% statement coverage.

## 10. Phase 4: Discovery And Event Management

**Goal**: Ship event catalog, search read model, media upload and discovery UI.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P4-01 | Booking event management APIs | BE | CRUD for event/performance/venue/tier/media metadata behind organizer auth. | golang-pro, api-design |
| P4-02 | MinIO/S3 media adapter | BE | Presigned upload/download or object proxy works; DB stores object keys only. | solution-architect |
| P4-03 | Search index mapping | BE | Elasticsearch/OpenSearch mapping supports artist, venue, city, genre, price, date, availability status. | database-optimizer |
| P4-04 | CDC/Sync Job v1 | BE | Booking outbox events update search index and invalidate Redis keys. | microservices-architect |
| P4-05 | Search Service APIs | BE | `/v1/events/search` and suggestions use Redis cache + Elasticsearch/OpenSearch. | golang-pro |
| P4-06 | Fan discovery UI | FE | Search filters, sort, cards, loading/error states using real API. | nextjs-developer, react-expert |
| P4-07 | Event detail UI | FE | Metadata/media/tier display with short SSR/ISR strategy. | nextjs-developer |
| P4-08 | Organizer event setup UI | FE | Create/edit event and tiers via API. | react-expert |

Quality gate:

- Search p95 target is measurable.
- Search stale state copy is visible in UI.
- Event detail does not claim exact availability as final purchase truth.

Backend unit test gate:

- Add unit tests for event catalog services, media adapter contract, search query builder, cache invalidation and outbox-to-search projection before closing Phase 4.
- API handlers must cover success, validation failure, auth failure and downstream error mapping.
- `go test ./...` passes; new backend service packages target at least 80% statement coverage.

## 11. Phase 5: Seat Map, Availability, Reservation

**Goal**: Implement no-double-sell reserve path and seat map interactions.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P5-01 | Seat map domain APIs | BE | Sections, rows, seats, tier assignment and blocked/hold seats persisted. | golang-pro |
| P5-02 | Availability initialization | BE | Creates `seat_availability` rows and `ga_availability_buckets` per performance. | database-optimizer |
| P5-03 | Reserved seat hold algorithm | BE | Uses `SELECT ... FOR UPDATE`, idempotency, status transition `AVAILABLE -> HELD`. | golang-concurrency, database-optimizer |
| P5-04 | GA hold algorithm | BE | Locks bucket row and enforces `held_count + sold_count <= total_capacity`. | database-optimizer |
| P5-05 | Reservation Expiry Worker | BE | Expires `HELD` reservations, releases seats/GA count, publishes events. | golang-concurrency |
| P5-06 | Anti-abuse baseline | BE | Active hold limit, ticket limit, rate limit hooks and access code validation. | api-design |
| P5-07 | Seat map UI | FE | Interactive seat selection, legend, unavailable states, alternatives on conflict. | react-expert, design-principles |
| P5-08 | Checkout reservation UI | FE | TTL countdown, reserve conflict UX, no-store API calls. | nextjs-developer |
| P5-09 | Reservation contention tests | BE | Concurrent tests prove no duplicate hold/sold state under 100 attempts/s scenario. | golang-testing |

Quality gate:

- No double sell under concurrent reserve tests.
- Neon lock wait metrics are visible.
- Reservation writes do not call Payment/PSP inside lock transaction.

Backend unit test gate:

- Add unit tests for seat-map parsing, availability initialization, reservation state transitions, idempotency replay and expiry worker behavior before closing Phase 5.
- Keep contention tests for reserve flow, but do not count them as a replacement for fast unit tests.
- `go test ./...` passes; critical booking domain packages target at least 85% statement coverage.

## 12. Phase 6: Checkout, Payment gRPC, Ticketing, Notification

**Goal**: Complete checkout lifecycle from payment intent to QR ticket and confirmation.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P6-01 | Implement `PaymentIntentService.CreateIntent` gRPC server | BE | Payment Service creates idempotent payment intent with deadline-aware handler. | golang-pro, microservices-architect |
| P6-02 | Implement Booking gRPC client | BE | Booking calls Payment with metadata `x-correlation-id`, deadline, idempotency key. | golang-pro |
| P6-03 | PSP sandbox adapter | BE | Stripe/PayOS/MoMo/ZaloPay adapter interface with at least one sandbox provider. | solution-architect |
| P6-04 | PSP webhook handler | BE | Verifies signature, stores raw webhook, handles duplicate callbacks. | golang-pro |
| P6-05 | Payment captured event flow | BE | Payment publishes `payment.captured`; Booking confirms idempotently. | microservices-architect |
| P6-06 | Booking confirm transaction | BE | `HELD -> CONFIRMED`, seats `HELD -> SOLD`, GA held -> sold in one transaction. | database-optimizer |
| P6-07 | Ticket issue service | BE | Ticket Service consumes `booking.confirmed`, issues signed QR and stores token hash. | golang-pro |
| P6-08 | Notification service | BE | Email/SMS jobs enqueue/send/retry; failures do not rollback booking. | microservices-architect |
| P6-09 | Checkout UI | FE | Buyer info, payment action, pending state, confirmation state, ticket link. | nextjs-developer |
| P6-10 | Ticket wallet UI | FE | Shows QR, status, booking details and resend notification action. | react-expert |
| P6-11 | Payment race tests | BE | Late PSP success after expiry triggers refund/reversal path, not confirm. | golang-testing |

Quality gate:

- Booking -> Payment gRPC has contract tests and timeout tests.
- Payment confirm is idempotent.
- Notification provider outage does not affect confirmed booking.

Backend unit test gate:

- Add unit tests for gRPC handlers/clients, PSP adapter interface, webhook dedupe, booking confirm transaction, ticket issue service and notification retry policy before closing Phase 6.
- Mock external PSP/email/SMS providers; unit tests must verify idempotency and timeout/error mapping.
- `go test ./...` passes; critical checkout/payment/ticket packages target at least 85% statement coverage.

## 13. Phase 7: Organizer/Admin And Staff Scanner

**Goal**: Complete operational workflows for organizers and event-day staff.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P7-01 | Organizer dashboard APIs | BE | Sales, held, available, refund, check-in summaries by event/performance/tier. | golang-pro |
| P7-02 | Organizer dashboard UI | FE | Tables, filters, metrics, tabs and export placeholder implemented. | nextjs-developer, react-expert |
| P7-03 | Seat map builder UI | FE | Select/pan/section/row/seat/tier tools with right inspector. | react-expert, design-principles |
| P7-04 | Ticket check-in API | BE | Atomic `ACTIVE -> USED`, duplicate info, void/refund rejection. | golang-concurrency |
| P7-05 | Staff scanner UI | FE | Camera/manual entry, accepted/rejected states, duplicate context. | nextjs-developer |
| P7-06 | RBAC enforcement | Both | Organizer/staff roles scoped by organizer/event/performance. | hexagonal-architecture |
| P7-07 | Audit log UI/API | Both | Price/tier/seat map/refund/void admin actions produce audit entries. | golang-pro, react-expert |

Quality gate:

- Duplicate scan returns deterministic first scan info.
- Staff scanner works on mobile viewport.
- Organizer cannot access another organizer's events.

Backend unit test gate:

- Add unit tests for organizer dashboard aggregations, check-in status transitions, RBAC enforcement and audit-log creation before closing Phase 7.
- Authorization tests must include cross-organizer denial and staff-scope denial cases.
- `go test ./...` passes; changed backend packages target at least 80% statement coverage.

## 14. Phase 8: Hardening, Load Test, Production Readiness

**Goal**: Make the MVP reviewable and deployable.

| ID | Task | FE/BE | Acceptance Criteria | Assigned Skills |
|---|---|---|---|---|
| P8-01 | End-to-end observability | Both | Logs, metrics and traces cover search, reserve, checkout gRPC, webhook confirm, ticket issue, notification. | monitoring-expert |
| P8-02 | Metrics dashboards | BE | Reservation conflict/timeout, lock wait, PSP latency, gRPC deadline, outbox lag, DLQ count. Grafana is default dashboard; Kibana is optional if Elastic is selected for logs. | monitoring-expert |
| P8-03 | Load tests | Both | Search 2K QPS, reservation 100 TPS, gRPC payment intent, scanner 100 QPS tested. | golang-testing |
| P8-04 | Neon production readiness drill | BE | Connection pool, direct migration, restore branch, backup verification and warm compute checklist complete. | database-optimizer |
| P8-05 | Security hardening | Both | JWT/session expiry, RBAC, PII redaction, QR signing key rotation plan, PSP signature checks. | solution-architect |
| P8-06 | Deployment manifests | Both | Next.js, API Gateway, services, workers, env vars and secrets documented. | solution-architect |
| P8-07 | Runbooks | Both | Hot event, PSP incident, Elasticsearch lag, Redis outage, Neon connection saturation, event cancellation. | monitoring-expert |
| P8-08 | Final docs update | Both | System design, technical report and this plan align. | planning-skill |
| P8-09 | Logging pipeline | BE | Structured JSON logs flow from services/workers to collector/backend with redaction, service name, environment, correlation ID, trace ID and span ID. | monitoring-expert |
| P8-10 | Distributed tracing pipeline | BE | OpenTelemetry spans cover REST, gRPC, DB transactions, Redis, Kafka/outbox and PSP calls with sampling configured per env. | monitoring-expert, golang-pro |
| P8-11 | Alert rules | BE | Alerts exist for checkout error rate, reservation lock contention, payment webhook failures, outbox lag, Redis/Elasticsearch degradation and Neon connection saturation. | monitoring-expert |

Observability implementation scope:

- Logging: use structured JSON logs from every Go service, worker and API Gateway; include `service.name`, `env`, `correlation_id`, `trace_id`, `span_id`, `user_id_hash` when available, latency, route/method/status and sanitized business IDs such as `booking_external_id`.
- Tracing: instrument OpenTelemetry for REST, gRPC Booking -> Payment, DB transactions, Redis cache calls, Kafka/outbox publish-consume, PSP adapter calls and notification provider calls.
- Metrics: expose Prometheus-compatible `/metrics` from services and workers; use RED metrics for APIs/gRPC and business metrics for reservations, payments, tickets, notifications and outbox.
- Dashboards: create service overview, checkout funnel, reservation correctness, payment/PSP, ticket/check-in, outbox/eventing, Neon/Postgres, Redis, Elasticsearch/OpenSearch and worker dashboards.
- Alerts: define page-worthy alerts only for user-impacting symptoms and exhausted capacity; keep debug signals visible in dashboards without paging.
- Default stack: OpenTelemetry Collector + Prometheus + Grafana + Loki + Tempo for MVP. Alternative stack: Elastic Agent/OTel Collector + Elasticsearch + Kibana if the team chooses Elastic as primary log/search observability platform.

Quality gate:

- MVP can run in staging with Neon staging branch.
- Rollback/restore drill documented.
- Load test results are attached or summarized before production pilot.
- Observability stack shows correlated logs, traces and metrics for a complete reserve -> payment -> ticket issue flow.

Backend unit test gate:

- Add or update unit tests for hardening changes, security helpers, observability middleware and incident-safe fallback paths before closing Phase 8.
- CI must publish backend coverage summary and fail if coverage drops from the agreed baseline without an approved exception.
- `go test ./...` and race-enabled tests for critical packages pass before production pilot.

## 15. Implementation Milestones

| Milestone | Exit Criteria |
|---|---|
| M1: Skeleton Ready | Next.js app, Go service skeletons, contracts and Neon env plan exist. |
| M2: Discovery Ready | Event setup, media, search index, discovery/detail UI work with real data. |
| M3: Reservation Correctness Ready | Reserved/GA hold and expiry worker pass concurrency tests. |
| M4: Checkout Ready | Booking -> Payment gRPC, PSP sandbox, confirm event, ticket issue and notification work. |
| M5: Operations Ready | Organizer dashboard and staff scanner work for a pilot event. |
| M6: Production Pilot Ready | Load tests, observability, Neon readiness and runbooks complete. |

## 16. Cross-Cutting Acceptance Criteria

- All write APIs are idempotent.
- All public APIs return stable error envelopes.
- Every request/event/gRPC call propagates correlation ID.
- Booking Service never confirms an expired/released reservation.
- Redis/Elasticsearch stale data never decides purchase correctness.
- Neon pooled/direct connection usage is documented and enforced by env naming.
- FE checkout/scan/payment routes are no-store and cannot be cached by Next.js.
- Payment Service stores raw PSP webhook before processing.
- Event consumers are idempotent and track processed event IDs.
- Services emit structured logs with correlation ID and trace/span IDs; PII, tokens and raw payment secrets are redacted.
- Critical REST/gRPC/worker paths expose metrics and OpenTelemetry traces.
- Every backend phase must add or update unit tests for the backend code changed in that phase.
- Backend CI must run `go test ./...` on every PR and publish coverage summary.
- Critical booking/payment/ticket domain packages should target at least 85% statement coverage; other changed backend packages should target at least 80%.

## 17. Risk Mitigation

| Risk | Mitigation |
|---|---|
| Neon pooled transaction mode breaks migration/admin assumptions | Use direct DSN for migrations/admin/backup; keep pooled DSN only for app request traffic. |
| Neon cold start or low compute during hot event | Paid prod project, min compute > 0 before campaign, warm-up checklist, autoscaling range tested. |
| Hot GA bucket lock contention | Split GA buckets by section/channel if lock wait crosses threshold. |
| gRPC PaymentIntent timeout | Deadline, idempotency key, circuit breaker, safe retry policy, pending/payment status polling. |
| Event bus lag causes stale search/dashboard | Monitor consumer lag, DLQ, replay from outbox, user-facing stale copy. |
| Next.js route caching stale checkout/scan | `cache: 'no-store'`, dynamic route config, E2E tests for state freshness. |
| PSP webhook arrives after expiry | Booking confirm condition `WHERE status='HELD'`; refund/reversal event. |

## 18. Suggested Work Order For Agents

1. Start Phase 0 contracts and repo layout.
2. Run Phase 1 FE shell in parallel with Phase 2 BE skeleton.
3. Prioritize Phase 3 Booking schema and Neon transaction helpers before any reservation code.
4. Build Phase 4 discovery while Phase 5 reservation algorithms are developed behind tests.
5. Implement Phase 6 payment gRPC only after reservation/booking draft states are stable.
6. Add Phase 7 operational UI after core fan checkout is complete.
7. Keep Phase 8 observability/load tests active throughout, not only at the end.

## 19. Review Questions

- Neon plan: use one Neon project with branches per env, or separate projects for staging/prod?
- Should each service use separate database or separate schema inside one Neon database for MVP?
- Which PSP adapter is first: Stripe, PayOS, MoMo or ZaloPay?
- Which event bus should be default: Redpanda/Kafka-compatible, NATS JetStream or RabbitMQ?
- Is offline scanner required for MVP pilot or can it be post-MVP?
- Do we deploy Next.js on Vercel or self-host standalone with the backend platform?
- What exact deadline should `PaymentIntentService.CreateIntent` use in production?
