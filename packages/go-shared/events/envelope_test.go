package events

import (
	"encoding/json"
	"errors"
	"testing"
	"time"
)

func TestParseEnvelope(t *testing.T) {
	validEnvelope := `{
		"event_id": "evtmsg_123456",
		"event_type": "reservation.held",
		"event_version": 1,
		"source": "booking",
		"aggregate_type": "reservation",
		"aggregate_id": "rsv_123",
		"occurred_at": "2026-07-20T12:00:00Z",
		"correlation_id": "corr_123",
		"idempotency_key": "idem_123",
		"payload": {
			"reservation_id": "rsv_123",
			"status": "HELD"
		},
		"metadata": {
			"schema": "reservation-held.v1"
		}
	}`

	tests := []struct {
		name    string
		data    string
		wantErr bool
	}{
		{name: "valid", data: validEnvelope},
		{name: "bad json", data: `{`, wantErr: true},
		{name: "missing event type", data: replace(validEnvelope, `"event_type": "reservation.held",`, ""), wantErr: true},
		{name: "missing version", data: replace(validEnvelope, `"event_version": 1,`, `"event_version": 0,`), wantErr: true},
		{name: "missing occurred at", data: replace(validEnvelope, `"occurred_at": "2026-07-20T12:00:00Z",`, ""), wantErr: true},
		{name: "missing payload", data: replace(validEnvelope, `"payload": {
			"reservation_id": "rsv_123",
			"status": "HELD"
		},`, ""), wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseEnvelope([]byte(tt.data))
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

func TestEnvelopePayloadInto(t *testing.T) {
	envelope := Envelope{
		EventID:       "evtmsg_123456",
		EventType:     "ticket.issued",
		EventVersion:  1,
		Source:        "ticket",
		AggregateType: "ticket",
		AggregateID:   "tkt_123",
		OccurredAt:    time.Date(2026, 7, 20, 12, 0, 0, 0, time.UTC),
		CorrelationID: "corr_123",
		Payload:       json.RawMessage(`{"ticket_id":"tkt_123","status":"ACTIVE"}`),
	}

	var payload struct {
		TicketID string `json:"ticket_id"`
		Status   string `json:"status"`
	}
	if err := envelope.PayloadInto(&payload); err != nil {
		t.Fatalf("PayloadInto() error = %v", err)
	}

	if payload.TicketID != "tkt_123" || payload.Status != "ACTIVE" {
		t.Fatalf("payload = %+v; want ticket_id/status populated", payload)
	}
}

func TestEnvelopePayloadIntoRejectsNilTarget(t *testing.T) {
	envelope := Envelope{
		EventID:       "evtmsg_123456",
		EventType:     "ticket.issued",
		EventVersion:  1,
		Source:        "ticket",
		AggregateType: "ticket",
		AggregateID:   "tkt_123",
		OccurredAt:    time.Date(2026, 7, 20, 12, 0, 0, 0, time.UTC),
		CorrelationID: "corr_123",
		Payload:       json.RawMessage(`{"ticket_id":"tkt_123"}`),
	}

	err := envelope.PayloadInto(nil)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if errors.Is(err, ErrInvalidEnvelope) {
		t.Fatalf("error = %v; want nil target error", err)
	}
}

func replace(value string, old string, next string) string {
	for i := 0; i+len(old) <= len(value); i++ {
		if value[i:i+len(old)] == old {
			return value[:i] + next + value[i+len(old):]
		}
	}

	return value
}
