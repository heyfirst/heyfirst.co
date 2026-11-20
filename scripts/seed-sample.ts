import { applySeed, type SeedFile } from "emdash";
import { runMigrations } from "emdash/db";
import { createDialect } from "emdash/db/postgres";
import { Kysely } from "kysely";
import sample from "../seed/sample.json";
import baseSeed from "../seed/seed.json";

export async function seedSample(connectionString: string, onConflict: "skip" | "update" = "skip") {
	const db = new Kysely<never>({ dialect: createDialect({ connectionString }) });
	try {
		await runMigrations(db as never);
		const seed = { ...baseSeed, taxonomies: sample.taxonomies, content: sample.content };
		await applySeed(db as never, seed as SeedFile, { includeContent: true, onConflict });
	} finally {
		await db.destroy();
	}
}

if (import.meta.main) {
	const url = process.env.DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL is not set; copy .env.example and start compose");
	await seedSample(url);
	console.log("Sample content applied");
}
