import type { APIRoute } from "astro";
import { GET as emdashSitemap } from "emdash/internal/routes/sitemap.xml";

export const prerender = false;

export const GET: APIRoute = async (context) => {
	const response = await emdashSitemap(context);
	response.headers.set("Cache-Control", "no-store");
	return response;
};
