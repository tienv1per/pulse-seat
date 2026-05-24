.PHONY: fmt vet test coverage validate-contracts dev dev-postgres dev-down run-api-gateway run-identity run-search run-booking run-payment run-ticket run-notification

COMPOSE_FILE ?= infra/docker-compose.local.yml

fmt:
	gofmt -w packages services workers

vet:
	go vet ./...

test:
	go test ./...

coverage:
	go test -coverprofile=coverage.out ./packages/...
	go tool cover -func=coverage.out

validate-contracts:
	go test ./packages/contracts -run TestValidateAllContracts -count=1

dev:
	docker compose -f $(COMPOSE_FILE) up -d

dev-postgres:
	COMPOSE_PROFILES=local-postgres docker compose -f $(COMPOSE_FILE) up -d

dev-down:
	docker compose -f $(COMPOSE_FILE) down

run-api-gateway:
	go run ./services/api-gateway

run-identity:
	go run ./services/identity

run-search:
	go run ./services/search

run-booking:
	go run ./services/booking

run-payment:
	go run ./services/payment

run-ticket:
	go run ./services/ticket

run-notification:
	go run ./services/notification
