import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await sql`CREATE SCHEMA IF NOT EXISTS search`.execute(db);
	await sql`
		CREATE TABLE search.search_index (
			collection text NOT NULL,
			entry_id text NOT NULL,
			slug text NOT NULL,
			title text NOT NULL,
			description text NOT NULL,
			body text NOT NULL,
			tags jsonb NOT NULL DEFAULT '[]',
			published_at timestamptz,
			document tsvector GENERATED ALWAYS AS (
				setweight(to_tsvector('english', title), 'A') ||
				setweight(to_tsvector('english', description), 'B') ||
				setweight(to_tsvector('english', body), 'C')
			) STORED,
			PRIMARY KEY (collection, entry_id)
		)
	`.execute(db);
	await sql`CREATE INDEX search_index_document_idx ON search.search_index USING GIN (document)`.execute(
		db,
	);
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await sql`DROP TABLE search.search_index`.execute(db);
}
