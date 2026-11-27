import type { APIRoute } from "astro";

export function uncached(route: APIRoute): APIRoute {
	return async (context) => {
		const response = await route(context);
		response.headers.set("Cache-Control", "no-store");
		return response;
	};
}
