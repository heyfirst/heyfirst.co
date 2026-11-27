import { Kysely, PostgresDialect, sql, type Transaction } from "kysely";
import pg from "pg";

export type SearchTag = { slug: string; label: string };

export type IndexEntry = {
	collection: string;
	entryId: string;
	slug: string;
	title: string;
	description: string;
	body: string;
	tags: SearchTag[];
	publishedAt: Date | null;
};

type Database = Kysely<unknown>;

let shared: Database | undefined;

export function getSearchDb(): Database {
	if (shared) return shared;
	const connectionString = process.env.DATABASE_URL;
	const pool = new pg.Pool(connectionString ? { connectionString } : {});
	shared = new Kysely<unknown>({ dialect: new PostgresDialect({ pool }) });
	return shared;
}

export async function closeSearchDb(): Promise<void> {
	await shared?.destroy();
	shared = undefined;
}

const INDEX_LOCK_KEY = 7_283_950_113;

async function inLock<T>(
	db: Database,
	work: (trx: Transaction<unknown>) => Promise<T>,
): Promise<T> {
	return db.transaction().execute(async (trx) => {
		await sql`SELECT pg_advisory_xact_lock(${INDEX_LOCK_KEY})`.execute(trx);
		return work(trx);
	});
}

async function upsert(trx: Transaction<unknown>, entry: IndexEntry): Promise<void> {
	await sql`
		INSERT INTO search.search_index
			(collection, entry_id, slug, title, description, body, tags, published_at)
		VALUES (
			${entry.collection}, ${entry.entryId}, ${entry.slug}, ${entry.title},
			${entry.description}, ${entry.body}, ${JSON.stringify(entry.tags)}::jsonb,
			${entry.publishedAt}
		)
		ON CONFLICT (collection, entry_id) DO UPDATE SET
			slug = excluded.slug,
			title = excluded.title,
			description = excluded.description,
			body = excluded.body,
			tags = excluded.tags,
			published_at = excluded.published_at
		WHERE (search_index.slug, search_index.title, search_index.description,
			search_index.body, search_index.tags, search_index.published_at)
			IS DISTINCT FROM (excluded.slug, excluded.title, excluded.description,
			excluded.body, excluded.tags, excluded.published_at)
	`.execute(trx);
}

export async function resyncSearchIndex(
	db: Database,
	source: IndexEntry[] | (() => Promise<IndexEntry[]>),
): Promise<void> {
	await inLock(db, async (trx) => {
		const entries = typeof source === "function" ? await source() : source;
		for (const entry of entries) await upsert(trx, entry);
		const keys = entries.map((entry) => `${entry.collection}/${entry.entryId}`);
		await sql`
			DELETE FROM search.search_index
			WHERE NOT (collection || '/' || entry_id = ANY(${keys}::text[]))
		`.execute(trx);
	});
}

export async function upsertSearchEntry(db: Database, entry: IndexEntry): Promise<void> {
	await inLock(db, (trx) => upsert(trx, entry));
}

export async function deleteSearchEntry(
	db: Database,
	collection: string,
	entryId: string,
): Promise<void> {
	await inLock(db, async (trx) => {
		await sql`
			DELETE FROM search.search_index WHERE collection = ${collection} AND entry_id = ${entryId}
		`.execute(trx);
	});
}
