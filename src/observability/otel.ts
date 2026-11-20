import { randomUUID } from "node:crypto";
import { trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
	BatchSpanProcessor,
	SimpleSpanProcessor,
	type SpanExporter,
	type SpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { queryStats } from "./query-stats.ts";

export type Env = Record<string, string | undefined>;

export interface Tracing {
	provider: NodeTracerProvider;
	shutdown: () => Promise<void>;
}

export interface OtlpConfig {
	endpoint: string;
	headers: Record<string, string>;
}

const SERVICE_NAME = "heyfirst-co";
const SQL_VERB = /^\s*(select|insert|update|delete|with)\b/i;
const SQL_TABLE = /\b(?:from|into|update|join)\s+"?([\w.]+)"?/i;

export const otlpConfig = (env: Env): OtlpConfig | undefined => {
	const endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();
	if (!endpoint) return undefined;
	return {
		endpoint: endpoint.replace(/\/+$/, ""),
		headers: parseHeaders(env.OTEL_EXPORTER_OTLP_HEADERS),
	};
};

export const resourceAttributes = (env: Env): Record<string, string> => ({
	"service.name": SERVICE_NAME,
	"service.version": env.GIT_SHA ?? "unknown",
	"service.instance.id": randomUUID(),
	"deployment.environment.name": env.DEPLOYMENT_ENVIRONMENT ?? env.NODE_ENV ?? "development",
});

export const startTracing = (env: Env, exporter?: SpanExporter): Tracing | undefined => {
	const processor = spanProcessor(env, exporter);
	if (!processor) return undefined;
	const provider = new NodeTracerProvider({
		resource: resourceFromAttributes(resourceAttributes(env)),
		spanProcessors: [processor, queryStats],
	});
	provider.register();
	return {
		provider,
		shutdown: async () => {
			await provider.shutdown();
			trace.disable();
		},
	};
};

export const pgInstrumentation = (): PgInstrumentation => {
	process.env.OTEL_SEMCONV_STABILITY_OPT_IN ??= "database";
	return new PgInstrumentation({
		enhancedDatabaseReporting: false,
		ignoreConnectSpans: true,
		requestHook: (span, { query }) => {
			span.updateName(sqlSpanName(query.text ?? ""));
		},
	});
};

export const sqlSpanName = (sql: string): string => {
	const verb = SQL_VERB.exec(sql)?.[1]?.toUpperCase();
	if (!verb) return "SQL";
	const table = SQL_TABLE.exec(sql)?.[1];
	return table ? `${verb === "WITH" ? "SELECT" : verb} ${table}` : verb;
};

const spanProcessor = (env: Env, exporter?: SpanExporter): SpanProcessor | undefined => {
	if (exporter) return new SimpleSpanProcessor(exporter);
	const config = otlpConfig(env);
	if (!config) return undefined;
	return new BatchSpanProcessor(
		new OTLPTraceExporter({ url: `${config.endpoint}/v1/traces`, headers: config.headers }),
	);
};

export const parseHeaders = (raw: string | undefined): Record<string, string> => {
	const headers: Record<string, string> = {};
	for (const pair of raw?.split(",") ?? []) {
		const at = pair.indexOf("=");
		if (at <= 0) continue;
		headers[pair.slice(0, at).trim()] = pair.slice(at + 1).trim();
	}
	return headers;
};
