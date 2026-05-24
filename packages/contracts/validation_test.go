package contracts

import (
	"errors"
	"io/fs"
	"testing"
	"testing/fstest"
)

func TestValidateAllContracts(t *testing.T) {
	if err := ValidateAll(); err != nil {
		t.Fatalf("ValidateAll() error = %v", err)
	}
}

func TestEmbeddedFS(t *testing.T) {
	if _, err := fs.Stat(EmbeddedFS(), "openapi/pulse-seat-public-v1.yaml"); err != nil {
		t.Fatalf("EmbeddedFS() missing OpenAPI contract: %v", err)
	}
}

func TestValidateOpenAPIReadError(t *testing.T) {
	err := ValidateOpenAPI(fstest.MapFS{}, "missing.yaml")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestValidateOpenAPISource(t *testing.T) {
	tests := []struct {
		name    string
		source  string
		wantErr bool
	}{
		{
			name: "valid markers",
			source: `openapi: 3.1.0
paths:
  /v1/events/search: {}
  /v1/events/{event_id}: {}
  /v1/performances/{performance_id}/seat-map: {}
  /v1/reservations: {}
  /v1/bookings: {}
  /v1/bookings/{booking_id}: {}
  /v1/tickets/{ticket_id}: {}
  /v1/tickets/{ticket_id}/void: {}
  /v1/check-ins/scan: {}
components:
  parameters:
    Idempotency-Key: {}
    X-Correlation-Id: {}
`,
		},
		{
			name:    "missing endpoint",
			source:  "openapi: 3.1.0\npaths: {}\n",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateOpenAPISource([]byte(tt.source))
			assertErr(t, err, tt.wantErr)
		})
	}
}

func TestValidateProtoSource(t *testing.T) {
	valid := `syntax = "proto3";
service PaymentIntentService {
  rpc CreateIntent(CreatePaymentIntentRequest) returns (CreatePaymentIntentResponse);
}
message CreatePaymentIntentRequest {
  string idempotency_key = 1;
  string booking_id = 2;
  string reservation_id = 3;
  string buyer_ref = 4;
  Money amount = 5;
  string currency = 6;
}
message CreatePaymentIntentResponse {
  PaymentIntentStatus status = 1;
  ClientAction client_action = 2;
}`

	tests := []struct {
		name    string
		source  string
		wantErr bool
	}{
		{
			name:   "valid markers",
			source: valid,
		},
		{
			name:    "missing idempotency",
			source:  `syntax = "proto3"; service PaymentIntentService {}`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateProtoSource([]byte(tt.source))
			assertErr(t, err, tt.wantErr)
		})
	}
}

func TestValidateProtoReadError(t *testing.T) {
	err := ValidateProto(fstest.MapFS{}, "missing.proto")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestValidateJSONSchemaSource(t *testing.T) {
	tests := []struct {
		name    string
		source  string
		wantErr bool
	}{
		{
			name:   "valid schema",
			source: `{"$schema":"https://json-schema.org/draft/2020-12/schema","title":"X","type":"object","properties":{}}`,
		},
		{
			name:    "invalid json",
			source:  `{`,
			wantErr: true,
		},
		{
			name:    "missing title",
			source:  `{"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{}}`,
			wantErr: true,
		},
		{
			name:    "wrong type",
			source:  `{"$schema":"https://json-schema.org/draft/2020-12/schema","title":"X","type":"array","properties":{}}`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateJSONSchemaSource([]byte(tt.source))
			assertErr(t, err, tt.wantErr)
		})
	}
}

func TestValidateEventContracts(t *testing.T) {
	tests := []struct {
		name    string
		fsys    fs.FS
		wantErr bool
	}{
		{
			name: "valid",
			fsys: validEventFS(),
		},
		{
			name:    "missing catalog",
			fsys:    fstest.MapFS{},
			wantErr: true,
		},
		{
			name: "invalid catalog json",
			fsys: fstest.MapFS{
				"events/event-catalog.json": {Data: []byte(`{`)},
			},
			wantErr: true,
		},
		{
			name: "missing schema file",
			fsys: func() fstest.MapFS {
				fsys := validEventFS()
				delete(fsys, "events/schemas/ticket-issued.schema.json")
				return fsys
			}(),
			wantErr: true,
		},
		{
			name: "invalid schema json",
			fsys: func() fstest.MapFS {
				fsys := validEventFS()
				fsys["events/schemas/ticket-issued.schema.json"] = &fstest.MapFile{Data: []byte(`{`)}
				return fsys
			}(),
			wantErr: true,
		},
		{
			name: "missing required event",
			fsys: catalogOnlyFS(`{
				"version":"0.1.0",
				"envelope_schema":"schemas/event-envelope.schema.json",
				"events":[]
			}`),
			wantErr: true,
		},
		{
			name: "duplicate event type",
			fsys: catalogOnlyFS(`{
				"version":"0.1.0",
				"envelope_schema":"schemas/event-envelope.schema.json",
				"events":[
					{"event_type":"reservation.held","event_version":1,"owner":"booking","topic":"booking.reservations","payload_schema":"schemas/reservation-held.schema.json"},
					{"event_type":"reservation.held","event_version":1,"owner":"booking","topic":"booking.reservations","payload_schema":"schemas/reservation-held.schema.json"}
				]
			}`),
			wantErr: true,
		},
		{
			name: "incomplete event",
			fsys: catalogOnlyFS(`{
				"version":"0.1.0",
				"envelope_schema":"schemas/event-envelope.schema.json",
				"events":[{"event_type":"reservation.held","event_version":0,"payload_schema":"schemas/reservation-held.schema.json"}]
			}`),
			wantErr: true,
		},
		{
			name: "missing payload schema",
			fsys: catalogOnlyFS(`{
				"version":"0.1.0",
				"envelope_schema":"schemas/event-envelope.schema.json",
				"events":[{"event_type":"reservation.held","event_version":1,"owner":"booking","topic":"booking.reservations"}]
			}`),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateEventContracts(tt.fsys)
			if tt.wantErr {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
		})
	}
}

func assertErr(t *testing.T, err error, wantErr bool) {
	t.Helper()

	if wantErr {
		if err == nil {
			t.Fatal("expected error, got nil")
		}
		if !errors.Is(err, ErrInvalidContract) {
			t.Fatalf("error = %v; want ErrInvalidContract", err)
		}
		return
	}

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func validEventFS() fstest.MapFS {
	fsys := catalogOnlyFS(validCatalog)
	for _, filePath := range []string{
		"events/schemas/reservation-expired.schema.json",
		"events/schemas/payment-captured.schema.json",
		"events/schemas/booking-confirmed.schema.json",
		"events/schemas/ticket-issued.schema.json",
		"events/schemas/notification-requested.schema.json",
	} {
		fsys[filePath] = &fstest.MapFile{Data: []byte(minimalJSONSchema)}
	}

	return fsys
}

func catalogOnlyFS(catalog string) fstest.MapFS {
	return fstest.MapFS{
		"events/event-catalog.json":                 {Data: []byte(catalog)},
		"events/schemas/event-envelope.schema.json": {Data: []byte(minimalJSONSchema)},
		"events/schemas/reservation-held.schema.json": {
			Data: []byte(minimalJSONSchema),
		},
	}
}

const minimalJSONSchema = `{
	"$schema":"https://json-schema.org/draft/2020-12/schema",
	"title":"Minimal",
	"type":"object",
	"properties":{}
}`

const validCatalog = `{
	"version": "0.1.0",
	"envelope_schema": "schemas/event-envelope.schema.json",
	"events": [
		{"event_type":"reservation.held","event_version":1,"owner":"booking","topic":"booking.reservations","payload_schema":"schemas/reservation-held.schema.json"},
		{"event_type":"reservation.expired","event_version":1,"owner":"booking","topic":"booking.reservations","payload_schema":"schemas/reservation-expired.schema.json"},
		{"event_type":"payment.captured","event_version":1,"owner":"payment","topic":"payment.events","payload_schema":"schemas/payment-captured.schema.json"},
		{"event_type":"booking.confirmed","event_version":1,"owner":"booking","topic":"booking.events","payload_schema":"schemas/booking-confirmed.schema.json"},
		{"event_type":"ticket.issued","event_version":1,"owner":"ticket","topic":"ticket.events","payload_schema":"schemas/ticket-issued.schema.json"},
		{"event_type":"notification.requested","event_version":1,"owner":"notification","topic":"notification.events","payload_schema":"schemas/notification-requested.schema.json"}
	]
}`
