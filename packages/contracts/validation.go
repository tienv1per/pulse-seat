// Package contracts validates Phase 0 REST, protobuf and event contracts.
package contracts

import (
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"path"
	"strings"
)

//go:embed openapi proto events
var embeddedFiles embed.FS

// ErrInvalidContract is returned when a contract misses a required Phase 0 marker.
var ErrInvalidContract = errors.New("invalid contract")

// EmbeddedFS returns the checked-in contract files.
func EmbeddedFS() fs.FS {
	return embeddedFiles
}

// ValidateAll validates every Phase 0 contract artifact.
func ValidateAll() error {
	if err := ValidateOpenAPI(embeddedFiles, "openapi/pulse-seat-public-v1.yaml"); err != nil {
		return err
	}

	if err := ValidateProto(embeddedFiles, "proto/pulse/seat/v1/payment_intent.proto"); err != nil {
		return err
	}

	if err := ValidateEventContracts(embeddedFiles); err != nil {
		return err
	}

	return nil
}

// ValidateOpenAPI validates the public REST contract shape.
func ValidateOpenAPI(fsys fs.FS, filePath string) error {
	source, err := fs.ReadFile(fsys, filePath)
	if err != nil {
		return fmt.Errorf("read OpenAPI contract %q: %w", filePath, err)
	}

	return ValidateOpenAPISource(source)
}

// ValidateOpenAPISource validates required REST endpoints without depending on a YAML parser.
func ValidateOpenAPISource(source []byte) error {
	requiredMarkers := []string{
		"openapi: 3.1.0",
		"/v1/events/search:",
		"/v1/events/{event_id}:",
		"/v1/performances/{performance_id}/seat-map:",
		"/v1/reservations:",
		"/v1/bookings:",
		"/v1/bookings/{booking_id}:",
		"/v1/tickets/{ticket_id}:",
		"/v1/tickets/{ticket_id}/void:",
		"/v1/check-ins/scan:",
		"Idempotency-Key",
		"X-Correlation-Id",
	}

	return requireMarkers("OpenAPI contract", string(source), requiredMarkers)
}

// ValidateProto validates the Booking-to-Payment gRPC contract shape.
func ValidateProto(fsys fs.FS, filePath string) error {
	source, err := fs.ReadFile(fsys, filePath)
	if err != nil {
		return fmt.Errorf("read protobuf contract %q: %w", filePath, err)
	}

	return ValidateProtoSource(source)
}

// ValidateProtoSource validates the PaymentIntentService contract markers.
func ValidateProtoSource(source []byte) error {
	requiredMarkers := []string{
		`syntax = "proto3";`,
		"service PaymentIntentService",
		"rpc CreateIntent(CreatePaymentIntentRequest) returns (CreatePaymentIntentResponse)",
		"string idempotency_key",
		"string booking_id",
		"string reservation_id",
		"string buyer_ref",
		"Money amount",
		"string currency",
		"PaymentIntentStatus status",
		"ClientAction client_action",
	}

	return requireMarkers("protobuf contract", string(source), requiredMarkers)
}

// ValidateEventContracts validates the event catalog and JSON schema files.
func ValidateEventContracts(fsys fs.FS) error {
	if err := validateEventCatalog(fsys); err != nil {
		return err
	}

	err := fs.WalkDir(fsys, "events/schemas", func(filePath string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() || path.Ext(filePath) != ".json" {
			return nil
		}

		source, err := fs.ReadFile(fsys, filePath)
		if err != nil {
			return fmt.Errorf("read event schema %q: %w", filePath, err)
		}
		if err := ValidateJSONSchemaSource(source); err != nil {
			return fmt.Errorf("%s: %w", filePath, err)
		}

		return nil
	})
	if err != nil {
		return fmt.Errorf("validate event schemas: %w", err)
	}

	return nil
}

// ValidateJSONSchemaSource validates the minimum JSON Schema shape used by Phase 0.
func ValidateJSONSchemaSource(source []byte) error {
	if !json.Valid(source) {
		return fmt.Errorf("%w: schema is not valid JSON", ErrInvalidContract)
	}

	var document map[string]any
	if err := json.Unmarshal(source, &document); err != nil {
		return fmt.Errorf("unmarshal JSON schema: %w", err)
	}

	requiredKeys := []string{"$schema", "title", "type", "properties"}
	for _, key := range requiredKeys {
		if _, ok := document[key]; !ok {
			return fmt.Errorf("%w: JSON schema missing %q", ErrInvalidContract, key)
		}
	}

	if document["type"] != "object" {
		return fmt.Errorf("%w: JSON schema type must be object", ErrInvalidContract)
	}

	return nil
}

type eventCatalog struct {
	Version        string         `json:"version"`
	EnvelopeSchema string         `json:"envelope_schema"`
	Events         []eventCatalog `json:"events"`
	EventType      string         `json:"event_type"`
	EventVersion   int            `json:"event_version"`
	Owner          string         `json:"owner"`
	Topic          string         `json:"topic"`
	PayloadSchema  string         `json:"payload_schema"`
}

func validateEventCatalog(fsys fs.FS) error {
	source, err := fs.ReadFile(fsys, "events/event-catalog.json")
	if err != nil {
		return fmt.Errorf("read event catalog: %w", err)
	}
	if !json.Valid(source) {
		return fmt.Errorf("%w: event catalog is not valid JSON", ErrInvalidContract)
	}

	var catalog eventCatalog
	if err := json.Unmarshal(source, &catalog); err != nil {
		return fmt.Errorf("unmarshal event catalog: %w", err)
	}

	if catalog.Version == "" {
		return fmt.Errorf("%w: event catalog missing version", ErrInvalidContract)
	}
	if catalog.EnvelopeSchema == "" {
		return fmt.Errorf("%w: event catalog missing envelope_schema", ErrInvalidContract)
	}
	if _, err := fs.Stat(fsys, "events/"+catalog.EnvelopeSchema); err != nil {
		return fmt.Errorf("event catalog envelope schema %q: %w", catalog.EnvelopeSchema, err)
	}

	seen := map[string]struct{}{}
	for _, event := range catalog.Events {
		if err := validateCatalogEvent(fsys, event, seen); err != nil {
			return err
		}
		seen[event.EventType] = struct{}{}
	}

	requiredEvents := []string{
		"reservation.held",
		"reservation.expired",
		"payment.captured",
		"booking.confirmed",
		"ticket.issued",
		"notification.requested",
	}
	for _, eventType := range requiredEvents {
		if _, ok := seen[eventType]; !ok {
			return fmt.Errorf("%w: event catalog missing %q", ErrInvalidContract, eventType)
		}
	}

	return nil
}

func validateCatalogEvent(fsys fs.FS, event eventCatalog, seen map[string]struct{}) error {
	if event.EventType == "" || event.EventVersion < 1 || event.Owner == "" || event.Topic == "" {
		return fmt.Errorf("%w: incomplete event catalog entry", ErrInvalidContract)
	}
	if _, ok := seen[event.EventType]; ok {
		return fmt.Errorf("%w: duplicate event type %q", ErrInvalidContract, event.EventType)
	}
	if event.PayloadSchema == "" {
		return fmt.Errorf("%w: event %q missing payload_schema", ErrInvalidContract, event.EventType)
	}
	if _, err := fs.Stat(fsys, "events/"+event.PayloadSchema); err != nil {
		return fmt.Errorf("event %q payload schema %q: %w", event.EventType, event.PayloadSchema, err)
	}

	return nil
}

func requireMarkers(name string, source string, markers []string) error {
	for _, marker := range markers {
		if !strings.Contains(source, marker) {
			return fmt.Errorf("%w: %s missing %q", ErrInvalidContract, name, marker)
		}
	}

	return nil
}
