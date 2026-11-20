import type { Kysely } from "kysely";
import { type Migration, type MigrationProvider, Migrator } from "kysely/migration";
import * as createSearchIndex from "./migrations/0001_create_search_index";

const migrations: Record<string, Migration> = {
	"0001_create_search_index": createSearchIndex,
};

const provider: MigrationProvider = { getMigrations: async () => migrations };

function migrator(db: Kysely<unknown>) {
	return new Migrator({
		db,
		provider,
		migrationTableSchema: "search",
		migrationTableName: "migration",
		migrationLockTableName: "migration_lock",
	});
}

export async function migrateUp(db: Kysely<unknown>): Promise<string[]> {
	const { error, results } = await migrator(db).migrateToLatest();
	if (error) throw error;
	return (results ?? []).map((result) => result.migrationName);
}

export async function migrateDown(db: Kysely<unknown>): Promise<string[]> {
	const { error, results } = await migrator(db).migrateDown();
	if (error) throw error;
	return (results ?? []).map((result) => result.migrationName);
}
