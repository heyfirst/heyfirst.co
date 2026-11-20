import { htmlCacheControl } from "@/utils/cache-policy";
import { defineMiddleware } from "astro:middleware";

const SECURITY_HEADERS = {
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// EmDash adds X-Frame-Options: SAMEORIGIN after this middleware unless a CSP is already set.
const FRAME_ANCESTORS_CSP = "frame-ancestors 'none'";

export const onRequest = defineMiddleware(async ({ request, url, cookies, locals }, next) => {
	const response = await next();
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(name, value);
	}
	if (!response.headers.has("Content-Security-Policy")) {
		response.headers.set("Content-Security-Policy", FRAME_ANCESTORS_CSP);
	}
	if (url.pathname.startsWith("/_emdash/") || response.headers.has("Cache-Control")) {
		return response;
	}
	const isHtml = response.headers.get("Content-Type")?.startsWith("text/html");
	if (isHtml && request.method === "GET") {
		response.headers.set(
			"Cache-Control",
			htmlCacheControl({
				status: response.status,
				setsCookie: response.headers.has("Set-Cookie") || [...cookies.headers()].length > 0,
				hasSession: Boolean(locals.user),
				isPreview: url.searchParams.has("_preview"),
			}),
		);
	}
	return response;
});
