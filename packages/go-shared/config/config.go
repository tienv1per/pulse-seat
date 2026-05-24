// Package config loads service configuration from environment variables.
package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"unicode"
)

// ErrMissingServiceName is returned when SERVICE_NAME is not configured.
var ErrMissingServiceName = errors.New("missing service name")

// Settings contains process-level configuration shared by services and workers.
type Settings struct {
	ServiceName     string
	Environment     string
	HTTPAddr        string
	GRPCAddr        string
	Neon            NeonURLs
	RedisURL        string
	SearchURL       string
	EventBusBrokers []string
	MinIOEndpoint   string
	MinIOBucket     string
	RequireNeon     bool
}

// NeonURLs separates pooled app traffic from direct migration/admin traffic.
type NeonURLs struct {
	Pooled string
	Direct string
}

// Getenv reads an environment variable by key.
type Getenv func(key string) string

// LoadFromEnv loads settings from os.Getenv.
func LoadFromEnv() (Settings, error) {
	return Load(os.Getenv)
}

// LoadForService loads settings from os.Getenv and falls back to the given service name.
func LoadForService(serviceName string) (Settings, error) {
	return LoadForServiceWithEnv(serviceName, os.Getenv)
}

// LoadForServiceWithEnv loads settings using getenv and falls back to the given service name.
func LoadForServiceWithEnv(defaultServiceName string, getenv Getenv) (Settings, error) {
	return load(getenv, defaultServiceName)
}

// Load reads settings using getenv and applies local-safe defaults.
func Load(getenv Getenv) (Settings, error) {
	return load(getenv, "")
}

// DefaultHTTPAddr returns the conventional HTTP bind address for a service.
func DefaultHTTPAddr(serviceName string) string {
	port, ok := defaultHTTPPorts[serviceName]
	if !ok {
		return ":8080"
	}

	return ":" + strconv.Itoa(port)
}

func load(getenv Getenv, defaultServiceName string) (Settings, error) {
	if getenv == nil {
		getenv = os.Getenv
	}

	serviceName := firstNonEmpty(getenv("SERVICE_NAME"), defaultServiceName)
	prefix := serviceEnvPrefix(serviceName)
	settings := Settings{
		ServiceName:     serviceName,
		Environment:     valueOrDefault(getenv("ENVIRONMENT"), "local"),
		HTTPAddr:        loadHTTPAddr(getenv, prefix, serviceName),
		GRPCAddr:        valueOrDefault(getenv("GRPC_ADDR"), ":9090"),
		Neon:            loadNeonURLs(getenv, prefix),
		RedisURL:        getenv("REDIS_URL"),
		SearchURL:       getenv("SEARCH_URL"),
		EventBusBrokers: splitCSV(getenv("EVENT_BUS_BROKERS")),
		MinIOEndpoint:   getenv("MINIO_ENDPOINT"),
		MinIOBucket:     getenv("MINIO_BUCKET"),
		RequireNeon:     parseBool(getenv("PULSE_SEAT_REQUIRE_NEON")),
	}

	if err := settings.Validate(); err != nil {
		return Settings{}, err
	}

	return settings, nil
}

// Validate verifies settings that would cause unsafe or ambiguous service startup.
func (s Settings) Validate() error {
	if strings.TrimSpace(s.ServiceName) == "" {
		return ErrMissingServiceName
	}

	if strings.TrimSpace(s.Environment) == "" {
		return errors.New("missing environment")
	}

	if s.RequireNeon {
		if s.Neon.Pooled == "" {
			return fmt.Errorf("missing pooled Neon URL for service %q", s.ServiceName)
		}
		if s.Neon.Direct == "" {
			return fmt.Errorf("missing direct Neon URL for service %q", s.ServiceName)
		}
	}

	if s.Neon.Pooled != "" && s.Neon.Pooled == s.Neon.Direct {
		return errors.New("pooled and direct Neon URLs must be distinct")
	}

	return nil
}

func loadNeonURLs(getenv Getenv, servicePrefix string) NeonURLs {
	return NeonURLs{
		Pooled: firstNonEmpty(
			getenv(servicePrefix+"_DATABASE_URL_POOLED"),
			getenv("DATABASE_URL_POOLED"),
		),
		Direct: firstNonEmpty(
			getenv(servicePrefix+"_DATABASE_URL_DIRECT"),
			getenv("DATABASE_URL_DIRECT"),
		),
	}
}

func loadHTTPAddr(getenv Getenv, servicePrefix string, serviceName string) string {
	return firstNonEmpty(
		getenv(servicePrefix+"_HTTP_ADDR"),
		getenv("HTTP_ADDR"),
		DefaultHTTPAddr(serviceName),
	)
}

func serviceEnvPrefix(serviceName string) string {
	var builder strings.Builder
	for _, r := range serviceName {
		switch {
		case unicode.IsLetter(r):
			builder.WriteRune(unicode.ToUpper(r))
		case unicode.IsDigit(r):
			builder.WriteRune(r)
		default:
			builder.WriteRune('_')
		}
	}

	return strings.Trim(builder.String(), "_")
}

func valueOrDefault(value string, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}

	return value
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}

	return ""
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed == "" {
			continue
		}
		result = append(result, trimmed)
	}

	return result
}

func parseBool(value string) bool {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "1", "true", "yes", "y":
		return true
	default:
		return false
	}
}

var defaultHTTPPorts = map[string]int{
	"api-gateway":  8080,
	"identity":     8081,
	"search":       8082,
	"booking":      8083,
	"payment":      8084,
	"ticket":       8085,
	"notification": 8086,
}
