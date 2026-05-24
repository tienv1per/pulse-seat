package config

import (
	"errors"
	"reflect"
	"testing"
)

func TestLoad(t *testing.T) {
	tests := []struct {
		name    string
		service string
		env     map[string]string
		want    Settings
		wantErr error
	}{
		{
			name: "loads service defaults and service-specific Neon URLs",
			env: map[string]string{
				"SERVICE_NAME":                "booking",
				"BOOKING_DATABASE_URL_POOLED": "postgres://booking-pooled",
				"BOOKING_DATABASE_URL_DIRECT": "postgres://booking-direct",
				"EVENT_BUS_BROKERS":           "localhost:9092, localhost:9093",
			},
			want: Settings{
				ServiceName: "booking",
				Environment: "local",
				HTTPAddr:    ":8083",
				GRPCAddr:    ":9090",
				Neon: NeonURLs{
					Pooled: "postgres://booking-pooled",
					Direct: "postgres://booking-direct",
				},
				EventBusBrokers: []string{"localhost:9092", "localhost:9093"},
			},
		},
		{
			name: "falls back to global Neon URLs",
			env: map[string]string{
				"SERVICE_NAME":            "payment",
				"DATABASE_URL_POOLED":     "postgres://pooled",
				"DATABASE_URL_DIRECT":     "postgres://direct",
				"REDIS_URL":               "redis://localhost:6379/0",
				"SEARCH_URL":              "http://localhost:9200",
				"MINIO_ENDPOINT":          "http://localhost:9000",
				"MINIO_BUCKET":            "pulse-seat",
				"ENVIRONMENT":             "dev",
				"HTTP_ADDR":               ":8181",
				"GRPC_ADDR":               ":9191",
				"EVENT_BUS_BROKERS":       "localhost:9092",
				"PULSE_SEAT_REQUIRE_NEON": "true",
			},
			want: Settings{
				ServiceName: "payment",
				Environment: "dev",
				HTTPAddr:    ":8181",
				GRPCAddr:    ":9191",
				Neon: NeonURLs{
					Pooled: "postgres://pooled",
					Direct: "postgres://direct",
				},
				RedisURL:        "redis://localhost:6379/0",
				SearchURL:       "http://localhost:9200",
				EventBusBrokers: []string{"localhost:9092"},
				MinIOEndpoint:   "http://localhost:9000",
				MinIOBucket:     "pulse-seat",
				RequireNeon:     true,
			},
		},
		{
			name:    "loads default service name and port",
			service: "booking",
			env:     map[string]string{},
			want: Settings{
				ServiceName:     "booking",
				Environment:     "local",
				HTTPAddr:        ":8083",
				GRPCAddr:        ":9090",
				EventBusBrokers: []string{},
			},
		},
		{
			name:    "service-specific HTTP addr overrides default",
			service: "payment",
			env: map[string]string{
				"PAYMENT_HTTP_ADDR": ":18084",
			},
			want: Settings{
				ServiceName:     "payment",
				Environment:     "local",
				HTTPAddr:        ":18084",
				GRPCAddr:        ":9090",
				EventBusBrokers: []string{},
			},
		},
		{
			name:    "global HTTP addr overrides service default",
			service: "ticket",
			env: map[string]string{
				"HTTP_ADDR": ":19000",
			},
			want: Settings{
				ServiceName:     "ticket",
				Environment:     "local",
				HTTPAddr:        ":19000",
				GRPCAddr:        ":9090",
				EventBusBrokers: []string{},
			},
		},
		{
			name:    "requires service name",
			env:     map[string]string{},
			wantErr: ErrMissingServiceName,
		},
		{
			name: "requires pooled Neon URL when enabled",
			env: map[string]string{
				"SERVICE_NAME":               "ticket",
				"TICKET_DATABASE_URL_DIRECT": "postgres://direct",
				"PULSE_SEAT_REQUIRE_NEON":    "true",
			},
			wantErr: errors.New("missing pooled Neon URL"),
		},
		{
			name: "rejects identical pooled and direct URLs",
			env: map[string]string{
				"SERVICE_NAME":                     "notification",
				"NOTIFICATION_DATABASE_URL_POOLED": "postgres://same",
				"NOTIFICATION_DATABASE_URL_DIRECT": "postgres://same",
			},
			wantErr: errors.New("pooled and direct Neon URLs"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Load(mapGetenv(tt.env))
			if tt.service != "" {
				got, err = LoadForServiceWithEnv(tt.service, mapGetenv(tt.env))
			}
			if tt.wantErr != nil {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				if !errors.Is(err, tt.wantErr) && !contains(err.Error(), tt.wantErr.Error()) {
					t.Fatalf("error = %v; want %v", err, tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("Load() = %+v; want %+v", got, tt.want)
			}
		})
	}
}

func TestDefaultHTTPAddr(t *testing.T) {
	tests := []struct {
		service string
		want    string
	}{
		{service: "api-gateway", want: ":8080"},
		{service: "identity", want: ":8081"},
		{service: "search", want: ":8082"},
		{service: "booking", want: ":8083"},
		{service: "payment", want: ":8084"},
		{service: "ticket", want: ":8085"},
		{service: "notification", want: ":8086"},
		{service: "unknown", want: ":8080"},
	}

	for _, tt := range tests {
		t.Run(tt.service, func(t *testing.T) {
			got := DefaultHTTPAddr(tt.service)
			if got != tt.want {
				t.Fatalf("DefaultHTTPAddr(%q) = %q; want %q", tt.service, got, tt.want)
			}
		})
	}
}

func TestServiceEnvPrefix(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{name: "plain", in: "booking", want: "BOOKING"},
		{name: "hyphen", in: "api-gateway", want: "API_GATEWAY"},
		{name: "spaces", in: " reservation expiry ", want: "RESERVATION_EXPIRY"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := serviceEnvPrefix(tt.in)
			if got != tt.want {
				t.Fatalf("serviceEnvPrefix(%q) = %q; want %q", tt.in, got, tt.want)
			}
		})
	}
}

func mapGetenv(values map[string]string) Getenv {
	return func(key string) string {
		return values[key]
	}
}

func contains(value string, needle string) bool {
	return len(needle) == 0 || len(value) >= len(needle) && index(value, needle) >= 0
}

func index(value string, needle string) int {
	for i := 0; i+len(needle) <= len(value); i++ {
		if value[i:i+len(needle)] == needle {
			return i
		}
	}

	return -1
}
