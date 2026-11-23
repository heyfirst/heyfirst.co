import { type Kysely, sql } from "kysely";
import type { SearchTag } from "./resync";

export type SearchHit = {
	collection: string;
	slug: string;
	url: string;
	title: string;
	excerpt: string;
	tags: SearchTag[];
};

export type SearchResponse = {
	results: SearchHit[];
	tags: (SearchTag & { count: number })[];
};

type SearchOptions = { query: string; tag?: string | undefined; limit?: number };

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
// Control characters never occur in a post, unlike `<<<` (a shell here-string).
const START_MARK = "\u0002";
const STOP_MARK = "\u0003";

const URL_PREFIX: Record<string, string> = { post: "/posts/", snippet: "/snippets/" };

export async function searchEntries(
	db: Kysely<unknown>,
	{ query, tag, limit = DEFAULT_LIMIT }: SearchOptions,
): Promise<SearchResponse> {
	const text = query.trim();
	if (!text) return { results: [], tags: [] };
	const capped = Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
	const tsquery = sql`websearch_to_tsquery('english', ${text})`;
	const tagFilter = tag ? sql`AND tags @> ${JSON.stringify([{ slug: tag }])}::jsonb` : sql``;

	const hitsQuery = sql<{
		collection: string;
		slug: string;
		title: string;
		excerpt: string;
		tags: SearchTag[];
	}>`
		SELECT collection, slug, title, tags,
			ts_headline('english', body, ${tsquery},
				${`StartSel=${START_MARK}, StopSel=${STOP_MARK}, MaxFragments=2, MaxWords=30, MinWords=12`}) AS excerpt
		FROM search.search_index
		WHERE document @@ ${tsquery} ${tagFilter}
		ORDER BY ts_rank_cd(document, ${tsquery}) DESC, published_at DESC NULLS LAST
		LIMIT ${capped}
	`.execute(db);

	const facetsQuery = sql<{ slug: string; label: string; count: string }>`
		SELECT tag ->> 'slug' AS slug, tag ->> 'label' AS label, count(*) AS count
		FROM search.search_index, jsonb_array_elements(tags) AS tag
		WHERE document @@ ${tsquery}
		GROUP BY 1, 2
		ORDER BY count(*) DESC, 1
	`.execute(db);
	const [hits, facets] = await Promise.all([hitsQuery, facetsQuery]);

	return {
		results: hits.rows.map((row) => ({
			collection: row.collection,
			slug: row.slug,
			url: `${URL_PREFIX[row.collection] ?? "/"}${row.slug}/`,
			title: row.title,
			excerpt: markExcerpt(row.excerpt),
			tags: row.tags,
		})),
		tags: facets.rows.map((row) => ({
			slug: row.slug,
			label: row.label,
			count: Number(row.count),
		})),
	};
}

function markExcerpt(headline: string): string {
	return escapeHtml(headline).replaceAll(START_MARK, "<mark>").replaceAll(STOP_MARK, "</mark>");
}

function escapeHtml(text: string): string {
	return text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
