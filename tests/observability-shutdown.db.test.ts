import { afterAll, beforeAll, expect, test } from "bun:test";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const received: string[] = [];
let sink: ReturnType<typeof Bun.serve>;

beforeAll(() => {
	sink = Bun.serve({
		port: 0,
		fetch: async (request) => {
			received.push(`${new URL(request.url).pathname} ${await request.text()}`);
			return new Response("{}");
		},
	});
});

afterAll(() => void sink.stop(true));

test("SIGTERM delivers the final span, then exits 0 within the hard timeout", async () => {
	const script = `
		import { trace } from "@opentelemetry/api";
		trace.getTracer("t").startSpan("final-span").end();
		console.log("ready");
		setInterval(() => {}, 1000);
	`;
	const child = Bun.spawn(
		[
			"bun",
			"--preload",
			"./docker-preload.ts",
			"--preload",
			"./src/observability/preload.ts",
			"-e",
			script,
		],
		{
			cwd: root,
			stdout: "pipe",
			stderr: "inherit",
			env: { ...process.env, OTEL_EXPORTER_OTLP_ENDPOINT: `http://127.0.0.1:${sink.port}` },
		},
	);
	const reader = child.stdout.getReader();
	await reader.read();
	const started = performance.now();
	child.kill("SIGTERM");
	expect(await child.exited).toBe(0);
	expect(performance.now() - started).toBeLessThan(3_500);
	expect(
		received.some((entry) => entry.startsWith("/v1/traces") && entry.includes("final-span")),
	).toBe(true);
});
