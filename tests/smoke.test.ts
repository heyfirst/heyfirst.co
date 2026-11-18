import { expect, test } from "bun:test";
import { SQL } from "bun";

test("connects to real postgres", async () => {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is not set; copy .env.example and start compose");
	}
	const db = new SQL(url);
	const [row] = await db`select 1 as one`;
	await db.close();
	expect(row.one).toBe(1);
});
