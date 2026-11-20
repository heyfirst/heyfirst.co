import { closeSearchDb, getSearchDb } from "../src/search/resync";
import { migrateUp } from "../src/search/migrate";

try {
	const applied = await migrateUp(getSearchDb());
	console.log(applied.length ? `search: applied ${applied.join(", ")}` : "search: up to date");
} finally {
	await closeSearchDb();
}
