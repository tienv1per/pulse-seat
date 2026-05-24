# Neon PostgreSQL Plan

Pulse Seat uses Neon as the default PostgreSQL provider for dev, staging and production. Local Docker Postgres is only a fallback for offline work and runs through the `local-postgres` compose profile.

## Environment Model

| Environment | Neon Setup | Notes |
| --- | --- | --- |
| Dev | One Neon branch per developer or shared dev branch | Use pooled URLs for services; direct URLs for migrations. |
| Preview | Branch per PR | Run migrations and small seed data, then destroy after merge. |
| Staging | Dedicated branch or project | Same schema shape as production with synthetic data. |
| Production | Dedicated Neon project/branch | Warm compute before onsale events and monitor connection pool pressure. |

## Connection Rules

- Application traffic uses service-specific pooled URLs, for example `BOOKING_DATABASE_URL_POOLED`.
- Migrations, backup/restore, `pg_dump`, admin scripts and CDC-like jobs use direct URLs, for example `BOOKING_DATABASE_URL_DIRECT`.
- Do not rely on session-level settings when using pooled URLs.
- Keep a separate database role per service and per access mode:
  - `*_app` for pooled runtime traffic.
  - `*_migrator` for direct migration/admin traffic.
- Booking Service pool limits must be conservative during hot events to avoid saturating Neon compute.

## Required Service URL Pairs

```text
IDENTITY_DATABASE_URL_POOLED
IDENTITY_DATABASE_URL_DIRECT
BOOKING_DATABASE_URL_POOLED
BOOKING_DATABASE_URL_DIRECT
PAYMENT_DATABASE_URL_POOLED
PAYMENT_DATABASE_URL_DIRECT
TICKET_DATABASE_URL_POOLED
TICKET_DATABASE_URL_DIRECT
NOTIFICATION_DATABASE_URL_POOLED
NOTIFICATION_DATABASE_URL_DIRECT
```

## Production Guardrails

- Keep production compute warm before planned onsale campaigns.
- Raise min/max autoscaling bounds only after load testing.
- Monitor active/waiting connections, lock waits, transaction duration, deadlocks and slow queries.
- Run monthly restore drills from a production backup or branch restore.
- Keep direct migration credentials out of service runtime secret sets.
