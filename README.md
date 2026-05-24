# Pulse Seat

Pulse Seat is an MVP ticketing platform for event discovery, reservations, checkout, QR tickets and staff check-in.

This repository starts as a monorepo:

- `apps/` - frontend applications.
- `services/` - Go services.
- `workers/` - Go background jobs.
- `packages/` - shared contracts and Go libraries.
- `db/` - per-service migrations.
- `infra/` - local dependencies and environment infrastructure.

## Phase 0 Commands

```sh
make test
make validate-contracts
make dev
make dev-postgres
```

`make dev` starts local infrastructure dependencies using `infra/docker-compose.local.yml`.
`make dev-postgres` includes the optional PostgreSQL fallback profile for offline work.

## Service Entrypoints

Each Go service has a standalone `main.go` and a default HTTP port:

| Service | Command | Port |
| --- | --- | --- |
| API Gateway | `go run ./services/api-gateway` | `8080` |
| Identity | `go run ./services/identity` | `8081` |
| Search | `go run ./services/search` | `8082` |
| Booking | `go run ./services/booking` | `8083` |
| Payment | `go run ./services/payment` | `8084` |
| Ticket | `go run ./services/ticket` | `8085` |
| Notification | `go run ./services/notification` | `8086` |

Every service exposes `/`, `/health/live` and `/health/ready`.
