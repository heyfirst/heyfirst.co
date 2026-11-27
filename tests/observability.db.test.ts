import { afterAll, beforeAll, expect, test } from "bun:test";
import { context, trace } from "@opentelemetry/api";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { InMemorySpanExporter, type ReadableSpan } from "@opentelemetry/sdk-trace-base";
import type { Pool } from "pg";
import { createLogger } from "../src/observability/logger.ts";
import {
	pgInstrumentation,
	sqlSpanName,
	startTracing,
	type Tracing,
} from "../src/observability/otel.ts";

const exporter = new InMemorySpanExporter();
let tracing: Tracing | undefined;
let pool: Pool;

beforeAll(async () => {
	tracing = startTracing({ GIT_SHA: "abc123" }, exporter);
	registerInstrumentations({ instrumentations: [pgInstrumentation()] });
	const { Pool: PgPool } = await import("pg");
	pool = new PgPool({ connectionString: process.env.DATABASE_URL });
});

afterAll(async () => {
	await pool.end();
	await tracing?.shutdown();
});

const sqlSpans = (): ReadableSpan[] =>
	exporter.getFinishedSpans().filter((span) => "db.query.text" in span.attributes);

test("a query becomes a child span named after the verb and table", async () => {
	exporter.reset();
	const tracer = trace.getTracer("test");
	await tracer.startActiveSpan("root", async (root) => {
		await pool.query("select 1 as one from information_schema.tables where table_name = $1", [
			"secret-value",
		]);
		root.end();
	});
	const [sql] = sqlSpans();
	const rootSpan = exporter.getFinishedSpans().find((span) => span.name === "root");
	expect(sql?.name).toBe("SELECT information_schema.tables");
	expect(sql?.parentSpanContext?.spanId).toBe(rootSpan?.spanContext().spanId);
});

test("attributes use the stable names and never carry parameter values", async () => {
	exporter.reset();
	await pool.query("select $1::text as v", ["secret-value"]);
	const [sql] = sqlSpans();
	expect(sql?.attributes["db.system.name"]).toBe("postgresql");
	expect(sql?.attributes["db.query.text"]).toBe("select $1::text as v");
	expect(Object.keys(sql?.attributes ?? {})).not.toContain("db.statement");
	expect(Object.keys(sql?.attributes ?? {})).not.toContain("db.system");
	expect(JSON.stringify(sql?.attributes)).not.toContain("secret-value");
});

test("a failing query leaves no parameter value or error text on the span", async () => {
	exporter.reset();
	await pool.query("select $1::int as v", ["secret-value"]).catch(() => undefined);
	const [sql] = sqlSpans();
	expect(sql?.status.code).toBe(2);
	expect(JSON.stringify([sql?.status, sql?.events, sql?.attributes])).not.toContain("secret-value");
	expect(sql?.status.message).toBeUndefined();
});

test("a logger line shares the trace id with its SQL span", async () => {
	exporter.reset();
	const printed: string[] = [];
	const bodies: string[] = [];
	const { log, flush } = createLogger(
		{ OTEL_EXPORTER_OTLP_ENDPOINT: "http://collector.invalid" },
		(line) => printed.push(line),
		{
			fetch: async (_url, init) => {
				bodies.push(String(init?.body));
				return new Response(null, { status: 200 });
			},
		},
	);
	await trace.getTracer("test").startActiveSpan("root", async (root) => {
		await pool.query("select 1");
		log(JSON.stringify({ msg: "hello", ok: true }));
		root.end();
	});
	await flush();
	const [sql] = sqlSpans();
	const traceId = sql?.spanContext().traceId;
	expect(traceId).toMatch(/^[0-9a-f]{32}$/);
	expect(JSON.parse(printed[0] ?? "{}").trace_id).toBe(traceId);
	const record = JSON.parse(bodies[0] ?? "{}").resourceLogs[0].scopeLogs[0].logRecords[0];
	expect(record.traceId).toBe(traceId);
	expect(record.spanId).toMatch(/^[0-9a-f]{16}$/);
});

test("a logger line outside any span is passed through untouched", () => {
	const printed: string[] = [];
	const { log } = createLogger({}, (line) => printed.push(line));
	context.with(context.active(), () => log('{"msg":"plain"}'));
	expect(printed).toEqual(['{"msg":"plain"}']);
});

test("sqlSpanName reads verb and table, and falls back to the verb", () => {
	expect(sqlSpanName('INSERT INTO "ec_posts" (a) values ($1)')).toBe("INSERT ec_posts");
	expect(sqlSpanName("update users set a = 1")).toBe("UPDATE users");
	expect(sqlSpanName("select 1")).toBe("SELECT");
	expect(sqlSpanName("vacuum")).toBe("SQL");
});

test("tracing is a no-op with no endpoint and no exporter", () => {
	expect(startTracing({})).toBeUndefined();
});

test("resource carries the stable service attributes", () => {
	const [span] = (() => {
		exporter.reset();
		trace.getTracer("test").startSpan("probe").end();
		return exporter.getFinishedSpans();
	})();
	expect(span?.resource.attributes["service.name"]).toBe("heyfirst-co");
	expect(span?.resource.attributes["service.version"]).toBe("abc123");
	expect(span?.resource.attributes["service.instance.id"]).toMatch(/^[0-9a-f-]{36}$/);
	expect(span?.resource.attributes["deployment.environment.name"]).toBeString();
});
