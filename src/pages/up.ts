import type { APIRoute } from "astro";
import { getDb } from "emdash/runtime";
import { sql } from "kysely";
import { log } from "../observability/index.ts";

export const prerender = false;

const HEADERS = { "Cache-Control": "no-store" };
let failing = false;

// The cheat sheet lists no public EmDash readiness check, so this keeps probing its migrations
// table: the entrypoint migrates before the server listens, so 200 means a migrated database.
export const GET: APIRoute = async () => {
	try {
		await sql`select 1 from _emdash_migrations limit 1`.execute(await getDb());
	} catch (error) {
		if (!failing) log({ event: "up.failed", error: error instanceof Error ? error.name : "unknown" });
		failing = true;
		return new Response("database unavailable", { status: 503, headers: HEADERS });
	}
	failing = false;
	return new Response("ok", { status: 200, headers: HEADERS });
};
