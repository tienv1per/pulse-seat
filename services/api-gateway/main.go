package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/tienv1per/pulse-seat/packages/go-shared/config"
	"github.com/tienv1per/pulse-seat/packages/go-shared/servicehttp"
)

func main() {
	settings, err := config.LoadForService("api-gateway")
	if err != nil {
		exit(err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := servicehttp.Run(ctx, settings); err != nil {
		exit(err)
	}
}

func exit(err error) {
	fmt.Fprintln(os.Stderr, err)
	os.Exit(1)
}
