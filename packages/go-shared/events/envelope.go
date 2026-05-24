// Package events provides the shared event envelope used on the event bus.
package events

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

// ErrInvalidEnvelope is returned when a message does not match the shared envelope.
var ErrInvalidEnvelope = errors.New("invalid event envelope")

// Envelope wraps service domain events before they are written to outbox or published.
type Envelope struct {
	EventID        string            `json:"event_id"`
	EventType      string            `json:"event_type"`
	EventVersion   int               `json:"event_version"`
	Source         string            `json:"source"`
	AggregateType  string            `json:"aggregate_type"`
	AggregateID    string            `json:"aggregate_id"`
	OccurredAt     time.Time         `json:"occurred_at"`
	CorrelationID  string            `json:"correlation_id"`
	IdempotencyKey string            `json:"idempotency_key,omitempty"`
	Payload        json.RawMessage   `json:"payload"`
	Metadata       map[string]string `json:"metadata,omitempty"`
}

// ParseEnvelope parses and validates an event envelope.
func ParseEnvelope(data []byte) (Envelope, error) {
	var envelope Envelope
	if err := json.Unmarshal(data, &envelope); err != nil {
		return Envelope{}, fmt.Errorf("decode event envelope: %w", err)
	}

	if err := envelope.Validate(); err != nil {
		return Envelope{}, err
	}

	return envelope, nil
}

// Validate checks required envelope fields and validates the raw JSON payload.
func (e Envelope) Validate() error {
	required := map[string]string{
		"event_id":       e.EventID,
		"event_type":     e.EventType,
		"source":         e.Source,
		"aggregate_type": e.AggregateType,
		"aggregate_id":   e.AggregateID,
		"correlation_id": e.CorrelationID,
	}
	for field, value := range required {
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("%w: missing %s", ErrInvalidEnvelope, field)
		}
	}

	if e.EventVersion < 1 {
		return fmt.Errorf("%w: event_version must be >= 1", ErrInvalidEnvelope)
	}

	if e.OccurredAt.IsZero() {
		return fmt.Errorf("%w: missing occurred_at", ErrInvalidEnvelope)
	}

	if len(e.Payload) == 0 {
		return fmt.Errorf("%w: missing payload", ErrInvalidEnvelope)
	}
	if !json.Valid(e.Payload) {
		return fmt.Errorf("%w: payload is not valid JSON", ErrInvalidEnvelope)
	}

	return nil
}

// PayloadInto decodes the payload into target after envelope validation.
func (e Envelope) PayloadInto(target any) error {
	if err := e.Validate(); err != nil {
		return err
	}
	if target == nil {
		return errors.New("target cannot be nil")
	}

	if err := json.Unmarshal(e.Payload, target); err != nil {
		return fmt.Errorf("decode event payload: %w", err)
	}

	return nil
}
