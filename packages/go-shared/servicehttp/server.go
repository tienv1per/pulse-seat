// Package servicehttp provides the minimal HTTP runtime shared by services.
package servicehttp

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/tienv1per/pulse-seat/packages/go-shared/config"
)

const (
	readHeaderTimeout = 5 * time.Second
	shutdownTimeout   = 10 * time.Second
)

// NewServer creates an HTTP server with base service and health endpoints.
func NewServer(settings config.Settings) *http.Server {
	return &http.Server{
		Addr:              settings.HTTPAddr,
		Handler:           NewHandler(settings),
		ReadHeaderTimeout: readHeaderTimeout,
	}
}

// NewHandler returns the base HTTP handler for a service.
func NewHandler(settings config.Settings) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/", serviceInfoHandler(settings))
	mux.HandleFunc("/health/live", healthHandler(settings, "live"))
	mux.HandleFunc("/health/ready", healthHandler(settings, "ready"))

	return mux
}

// Run starts a service HTTP server and gracefully shuts it down when ctx is cancelled.
func Run(ctx context.Context, settings config.Settings) error {
	if err := settings.Validate(); err != nil {
		return err
	}

	server := NewServer(settings)
	errCh := make(chan error, 1)
	go func() {
		err := server.ListenAndServe()
		if errors.Is(err, http.ErrServerClosed) {
			errCh <- nil
			return
		}
		errCh <- err
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("shutdown %s: %w", settings.ServiceName, err)
		}

		if err := <-errCh; err != nil {
			return fmt.Errorf("serve %s: %w", settings.ServiceName, err)
		}

		return nil
	case err := <-errCh:
		if err != nil {
			return fmt.Errorf("serve %s: %w", settings.ServiceName, err)
		}

		return nil
	}
}

func serviceInfoHandler(settings config.Settings) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{
			"service":     settings.ServiceName,
			"environment": settings.Environment,
			"status":      "ok",
		})
	}
}

func healthHandler(settings config.Settings, check string) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{
			"service": settings.ServiceName,
			"check":   check,
			"status":  "ok",
		})
	}
}

func writeJSON(w http.ResponseWriter, statusCode int, body map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	encoder := json.NewEncoder(w)
	if err := encoder.Encode(body); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}
