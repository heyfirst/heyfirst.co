import { shutdown } from "./src/observability/shutdown.ts";

// The Astro node server registers no signal handler. As PID 1 that would ignore SIGTERM, so
// `docker stop` would wait out its timeout and kill it. kamal-proxy has already stopped routing
// to this container, so the only work left is delivering the last spans and logs.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
	process.on(signal, () => void shutdown().finally(() => process.exit(0)));
}
