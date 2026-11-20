import type { APIRoute } from "astro";
import { searchEntries } from "../../search/query";
import { getSearchDb } from "../../search/resync";

export const prerender = false;

const MAX_QUERY_LENGTH = 200;

export const GET: APIRoute = async ({ url }) => {
	const query = (url.searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
	const tag = url.searchParams.get("tag") ?? undefined;
	const response = await searchEntries(getSearchDb(), { query, tag });
	return Response.json(response, { headers: { "Cache-Control": "no-store" } });
};
