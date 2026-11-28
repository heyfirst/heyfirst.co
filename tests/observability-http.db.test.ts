import { afterAll, beforeAll, expect, spyOn, test } from "bun:test";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { InMemorySpanExporter, type ReadableSpan } from "@opentelemetry/sdk-trace-base";
import type { Pool } from "pg";
import { pgInstrumentation, startTracing, type Tracing } from "../src/observability/otel.ts";
import { queryStats } from "../src/observability/query-stats.ts";
import { routeTemplate, tracedRequest } from "../src/observability/request-span.ts";

const exporter = new InMemorySpanExporter();
let tracing: Tracing | undefined;
let pool: Pool;
let server: ReturnType<typeof Bun.serve>;

beforeAll(async () => {
	tracing = startTracing({}, exporter);
	registerInstrumentations({ instrumentations: [pgInstrumentation()] });
	const { Pool: PgPool } = await import("pg");
	pool = new PgPool({ connectionString: process.env.DATABASE_URL });
	server = Bun.serve({
		port: 0,
		fetch: (request) => {
			const url = new URL(request.url);
			const slug = url.pathname.split("/")[2];
			const isPost = url.pathname.startsWith("/posts/");
			return tracedRequest(
				{
					request,
					url,
					routePattern: isPost ? "/posts/[...slug]" : url.pathname,
					params: { slug },
				},
				async () => {
					if (slug === "boom") return new Response("fail", { status: 500 });
					if (slug === "missing") return new Response("none", { status: 404 });
					await pool.query("select 1 from information_schema.tables where table_name = $1", ["a"]);
					await pool.query("select 2 from information_schema.tables where table_name = $1", ["b"]);
					return new Response("ok");
				},
			);
		},
	});
});

afterAll(async () => {
	await server.stop(true);
	await pool.end();
	await tracing?.shutdown();
});

const get = async (path: string, headers: Record<string, string> = {}) => {
	exporter.reset();
	await fetch(`http://localhost:${server.port}${path}`, { headers });
	return exporter.getFinishedSpans();
};
const rootOf = (spans: ReadableSpan[]) => spans.find((span) => !span.parentSpanContext);

test("route template replaces params", () => {
	expect(routeTemplate("/posts/[...slug]")).toBe("/posts/{slug}");
	expect(routeTemplate("")).toBe("/");
});

test("root span uses the route template and carries content and query attributes", async () => {
	const spans = await get("/posts/hello-world?token=secret");
	const root = rootOf(spans);
	expect(root?.name).toBe("GET /posts/{slug}");
	expect(root?.attributes["app.content.collection"]).toBe("posts");
	expect(root?.attributes["app.content.slug"]).toBe("hello-world");
	expect(root?.attributes["app.db.query_count"]).toBe(2);
	expect(Number(root?.attributes["app.db.time_ms"])).toBeGreaterThan(0);
	const children = spans.filter(
		(span) => span.parentSpanContext?.spanId === root?.spanContext().spanId,
	);
	expect(children).toHaveLength(2);
	expect(children[0]?.name).toBe("SELECT information_schema.tables");
});

test("no cookie, auth, forwarded-for or query string on any span", async () => {
	const spans = await get("/posts/hello-world?token=secret", {
		cookie: "session=cookie-value",
		authorization: "Bearer auth-value",
		"x-forwarded-for": "203.0.113.9",
	});
	const dump = JSON.stringify(spans.map((span) => span.attributes));
	for (const leak of ["cookie-value", "auth-value", "203.0.113.9", "secret", "token="]) {
		expect(dump).not.toContain(leak);
	}
});

test("x-request-id is kept only when it matches the pattern", async () => {
	expect(
		rootOf(await get("/posts/a", { "x-request-id": "req-123" }))?.attributes["app.request_id"],
	).toBe("req-123");
	expect(
		rootOf(await get("/posts/a", { "x-request-id": "bad id;drop" }))?.attributes,
	).not.toHaveProperty("app.request_id");
});

test("only 5xx is an error", async () => {
	expect(rootOf(await get("/posts/boom"))?.status.code).toBe(2);
	expect(rootOf(await get("/posts/missing"))?.status.code).toBe(0);
});

test("/up creates no span", async () => {
	expect(await get("/up")).toHaveLength(0);
});

test("a failing request records the exception and logs with the trace ids", async () => {
	const lines: string[] = [];
	const spy = spyOn(console, "log").mockImplementation((line: string) => void lines.push(line));
	const root = rootOf(await get("/posts/boom"));
	spy.mockRestore();
	expect(root?.events.map((event) => event.name)).toContain("exception");
	const entry = lines
		.map((line) => JSON.parse(line))
		.find((line) => line.event === "request.error");
	expect(entry).toMatchObject({
		route: "/posts/{slug}",
		error: "Error",
		trace_id: root?.spanContext().traceId,
		span_id: root?.spanContext().spanId,
	});
});

test("url.path is the real path, http.route the template, server.address the host without port", async () => {
	const root = rootOf(await get("/posts/hello-world?x=1"));
	expect(root?.attributes["url.path"]).toBe("/posts/hello-world");
	expect(root?.attributes["http.route"]).toBe("/posts/{slug}");
	expect(root?.attributes["server.address"]).toBe("localhost");
});

test("the stats map empties once traces end", async () => {
	await get("/posts/hello-world");
	await get("/posts/boom");
	expect(queryStats.size).toBe(0);
});

test("a second module graph shares the same stats instance", async () => {
	const copy = await import(`../src/observability/query-stats.ts?graph=${Date.now()}`);
	expect(copy.queryStats).toBe(queryStats);
});
