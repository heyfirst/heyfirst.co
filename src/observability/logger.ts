import { trace } from "@opentelemetry/api";
import { type Env, otlpConfig, resourceAttributes } from "./otel.ts";

type Send = (url: string, init?: RequestInit) => Promise<Response>;
export type Log = (line: string) => void;
type Fields = Record<string, unknown>;

export interface Telemetry {
	log: Log;
	flush: () => Promise<void>;
}

interface Options {
	fetch?: Send;
	now?: () => number;
}

interface AnyValue {
	stringValue?: string;
	intValue?: string;
	doubleValue?: number;
	boolValue?: boolean;
}

interface LogRecord {
	timeUnixNano: string;
	severityNumber: number;
	severityText: string;
	body: AnyValue;
	attributes: { key: string; value: AnyValue }[];
	traceId?: string;
	spanId?: string;
}

const FLUSH_EVERY_MS = 5_000;
const BATCH_SIZE = 50;
const HELD_CAP = 1_000;
const SEVERITY_INFO = 9;
const SEVERITY_WARN = 13;
const NANOS_PER_MS = 1_000_000n;

export const createLogger = (env: Env, out: Log, options: Options = {}): Telemetry => {
	const config = otlpConfig(env);
	if (!config) return { log: withTrace(out), flush: async () => {} };
	const send = options.fetch ?? fetch;
	const now = options.now ?? Date.now;
	const url = new URL("v1/logs", `${config.endpoint}/`).href;
	const headers = { "content-type": "application/json", ...config.headers };
	const resource = Object.entries(resourceAttributes(env)).map(([key, value]) => ({
		key,
		value: { stringValue: value },
	}));

	let queue: LogRecord[] = [];
	let held = 0;
	let inFlight: Promise<void> = Promise.resolve();

	const flush = (): Promise<void> => {
		if (queue.length === 0) return inFlight;
		const batch = queue;
		queue = [];
		const body = JSON.stringify({
			resourceLogs: [
				{
					resource: { attributes: resource },
					scopeLogs: [{ scope: { name: "heyfirst-co" }, logRecords: batch }],
				},
			],
		});
		inFlight = inFlight
			.then(() => post(body))
			.finally(() => {
				held -= batch.length;
			});
		return inFlight;
	};

	const post = async (body: string): Promise<void> => {
		try {
			const res = await send(url, {
				method: "POST",
				headers,
				body,
				signal: AbortSignal.timeout(FLUSH_EVERY_MS),
			});
			if (!res.ok) console.error(`telemetry: collector answered HTTP ${res.status}, batch dropped`);
		} catch (e) {
			console.error(`telemetry: collector unreachable, batch dropped (${String(e)})`);
		}
	};

	const log: Log = (line) => {
		const traced = withTraceFields(line);
		out(traced.line);
		if (held >= HELD_CAP) return;
		held += 1;
		queue.push(toRecord(traced.line, traced.fields, now()));
		if (queue.length >= BATCH_SIZE) void flush();
	};

	setInterval(() => void flush(), FLUSH_EVERY_MS).unref();
	return { log, flush };
};

const withTrace =
	(out: Log): Log =>
	(line) =>
		out(withTraceFields(line).line);

const withTraceFields = (line: string): { line: string; fields: Fields } => {
	const fields = parseFields(line);
	const context = trace.getActiveSpan()?.spanContext();
	if (!context) return { line, fields };
	const traced = { ...fields, trace_id: context.traceId, span_id: context.spanId };
	return { line: JSON.stringify(traced), fields: traced };
};

const toRecord = (line: string, fields: Fields, atMs: number): LogRecord => {
	const failed = fields.ok === false;
	return {
		timeUnixNano: String(BigInt(atMs) * NANOS_PER_MS),
		severityNumber: failed ? SEVERITY_WARN : SEVERITY_INFO,
		severityText: failed ? "WARN" : "INFO",
		body: { stringValue: line },
		attributes: Object.entries(fields).flatMap(([key, value]) => {
			const typed = anyValue(value);
			return typed ? [{ key, value: typed }] : [];
		}),
		...(typeof fields.trace_id === "string" && typeof fields.span_id === "string"
			? { traceId: fields.trace_id, spanId: fields.span_id }
			: {}),
	};
};

const parseFields = (line: string): Fields => {
	try {
		const value: unknown = JSON.parse(line);
		return typeof value === "object" && value !== null && !Array.isArray(value)
			? (value as Fields)
			: {};
	} catch {
		return {};
	}
};

const anyValue = (value: unknown): AnyValue | undefined => {
	if (typeof value === "string") return { stringValue: value };
	if (typeof value === "boolean") return { boolValue: value };
	if (typeof value !== "number") return undefined;
	return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
};
