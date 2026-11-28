import {
	context,
	type Span,
	SpanKind,
	SpanStatusCode,
	TraceFlags,
	trace,
} from "@opentelemetry/api";
import type { MiddlewareHandler } from "astro";
import { log } from "./index.ts";
import { queryStats } from "./query-stats.ts";

const REQUEST_ID = /^[A-Za-z0-9-]{1,64}$/;
const UNTRACED_PATHS = new Set(["/up"]);
const CONTENT_PREFIXES = new Set(["posts", "snippets", "projects"]);

interface RequestContext {
	request: Request;
	url: URL;
	routePattern: string;
	params: Record<string, string | undefined>;
}

export const routeTemplate = (pattern: string): string =>
	pattern.replace(/\[(?:\.\.\.)?(\w+)\]/g, "{$1}") || "/";

const UNSAMPLED_PARENT = trace.wrapSpanContext({
	traceId: "00000000000000000000000000000001",
	spanId: "0000000000000001",
	traceFlags: TraceFlags.NONE,
});

const untraced = (next: () => Promise<Response>): Promise<Response> =>
	context.with(trace.setSpan(context.active(), UNSAMPLED_PARENT), next);

const failSpan = (span: Span, error: unknown, route: string): void => {
	const failure = error instanceof Error ? error : new Error(String(error));
	span.setAttribute("error.type", failure.name);
	span.recordException(failure);
	span.setStatus({ code: SpanStatusCode.ERROR });
	context.with(trace.setSpan(context.active(), span), () =>
		log({ event: "request.error", route, error: failure.name }),
	);
};

export const tracedRequest = async (
	{ request, url, routePattern, params }: RequestContext,
	next: () => Promise<Response>,
): Promise<Response> => {
	if (UNTRACED_PATHS.has(url.pathname)) return untraced(next);

	const route = routeTemplate(routePattern);
	const span = trace.getTracer("heyfirst-co").startSpan(`${request.method} ${route}`, {
		kind: SpanKind.SERVER,
		attributes: {
			"http.request.method": request.method,
			"http.route": route,
			"url.path": url.pathname,
		},
	});
	const host = request.headers.get("host")?.replace(/:\d+$/, "");
	if (host) span.setAttribute("server.address", host);
	const requestId = request.headers.get("x-request-id");
	if (requestId && REQUEST_ID.test(requestId)) span.setAttribute("app.request_id", requestId);
	const collection = route.split("/")[1] ?? "";
	if (CONTENT_PREFIXES.has(collection) && params.slug) {
		span.setAttribute("app.content.collection", collection);
		span.setAttribute("app.content.slug", params.slug);
	}

	try {
		const response = await context.with(trace.setSpan(context.active(), span), next);
		span.setAttribute("http.response.status_code", response.status);
		if (response.status >= 500) {
			failSpan(span, new Error(`HTTP ${response.status}`), route);
		}
		return response;
	} catch (error) {
		failSpan(span, error, route);
		throw error;
	} finally {
		const stats = queryStats.take(span.spanContext().traceId);
		span.setAttribute("app.db.query_count", stats.count);
		span.setAttribute("app.db.time_ms", Math.round(stats.ms * 100) / 100);
		span.end();
	}
};

export const onRequest: MiddlewareHandler = (ctx, next) => tracedRequest(ctx, next);
