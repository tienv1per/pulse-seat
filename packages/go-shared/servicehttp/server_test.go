package servicehttp

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/tienv1per/pulse-seat/packages/go-shared/config"
)

func TestNewHandler(t *testing.T) {
	settings := config.Settings{
		ServiceName: "booking",
		Environment: "test",
		HTTPAddr:    ":8083",
	}

	tests := []struct {
		name       string
		path       string
		wantStatus int
		wantBody   map[string]string
	}{
		{
			name:       "service info",
			path:       "/",
			wantStatus: http.StatusOK,
			wantBody: map[string]string{
				"service":     "booking",
				"environment": "test",
				"status":      "ok",
			},
		},
		{
			name:       "liveness",
			path:       "/health/live",
			wantStatus: http.StatusOK,
			wantBody: map[string]string{
				"service": "booking",
				"check":   "live",
				"status":  "ok",
			},
		},
		{
			name:       "readiness",
			path:       "/health/ready",
			wantStatus: http.StatusOK,
			wantBody: map[string]string{
				"service": "booking",
				"check":   "ready",
				"status":  "ok",
			},
		},
		{
			name:       "not found",
			path:       "/missing",
			wantStatus: http.StatusNotFound,
		},
	}

	handler := NewHandler(settings)
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tt.path, nil)
			rec := httptest.NewRecorder()

			handler.ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d; want %d", rec.Code, tt.wantStatus)
			}
			if tt.wantBody == nil {
				return
			}

			var got map[string]string
			if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			for key, want := range tt.wantBody {
				if got[key] != want {
					t.Fatalf("body[%q] = %q; want %q", key, got[key], want)
				}
			}
		})
	}
}

func TestNewServer(t *testing.T) {
	settings := config.Settings{
		ServiceName: "payment",
		Environment: "test",
		HTTPAddr:    ":8084",
	}

	server := NewServer(settings)
	if server.Addr != ":8084" {
		t.Fatalf("Addr = %q; want :8084", server.Addr)
	}
	if server.ReadHeaderTimeout != 5*time.Second {
		t.Fatalf("ReadHeaderTimeout = %s; want 5s", server.ReadHeaderTimeout)
	}
	if server.Handler == nil {
		t.Fatal("Handler is nil")
	}
}

func TestRunRejectsInvalidSettings(t *testing.T) {
	err := Run(context.Background(), config.Settings{})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestRunReturnsListenError(t *testing.T) {
	settings := config.Settings{
		ServiceName: "booking",
		Environment: "test",
		HTTPAddr:    "bad addr",
	}

	err := Run(context.Background(), settings)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(err.Error(), "serve booking") {
		t.Fatalf("error = %v; want service context", err)
	}
}

func TestRunShutsDownWhenContextIsCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	settings := config.Settings{
		ServiceName: "search",
		Environment: "test",
		HTTPAddr:    "127.0.0.1:0",
	}

	if err := Run(ctx, settings); err != nil {
		t.Fatalf("Run() error = %v", err)
	}
}
