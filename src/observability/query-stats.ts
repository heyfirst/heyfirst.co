import type { ReadableSpan, SpanProcessor } from "@opentelemetry/sdk-trace-base";

interface QueryStats {
	count: number;
	ms: number;
}

const MAX_TRACES = 1_000;
const KEY = Symbol.for("heyfirst.queryStats");

class QueryStatsProcessor implements SpanProcessor {
	private readonly byTrace = new Map<string, QueryStats>();

	get size(): number {
		return this.byTrace.size;
	}

	onStart(): void {}

	onEnd(span: ReadableSpan): void {
		const traceId = span.spanContext().traceId;
		if (!span.parentSpanContext) {
			// A root span ends the trace. The request span takes its stats before it ends, so
			// whatever is left here belongs to a trace nobody will read.
			this.byTrace.delete(traceId);
			return;
		}
		if (!("db.query.text" in span.attributes)) return;
		const stats = this.byTrace.get(traceId) ?? { count: 0, ms: 0 };
		stats.count += 1;
		stats.ms += span.duration[0] * 1000 + span.duration[1] / 1e6;
		this.byTrace.set(traceId, stats);
		if (this.byTrace.size > MAX_TRACES) this.byTrace.delete(this.byTrace.keys().next().value ?? "");
	}

	take(traceId: string): QueryStats {
		const stats = this.byTrace.get(traceId) ?? { count: 0, ms: 0 };
		this.byTrace.delete(traceId);
		return stats;
	}

	forceFlush = async (): Promise<void> => {};
	shutdown = async (): Promise<void> => {};
}

// The preload and the Vite-bundled middleware are two module graphs; one global keeps one map.
const holder = globalThis as { [KEY]?: QueryStatsProcessor };
holder[KEY] ??= new QueryStatsProcessor();
export const queryStats: QueryStatsProcessor = holder[KEY];
