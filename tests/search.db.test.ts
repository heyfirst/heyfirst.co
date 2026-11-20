import { afterAll, beforeAll, expect, test } from "bun:test";
import type { PluginContentItem as ContentItem, PluginContext } from "emdash";
import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import { createPlugin } from "../src/emdash-plugins/search-sync";
import { toIndexEntry } from "../src/search/entries";
import { migrateDown, migrateUp } from "../src/search/migrate";
import { searchEntries } from "../src/search/query";
import { closeSearchDb, type IndexEntry, resyncSearchIndex } from "../src/search/resync";

const adminUrl = process.env.DATABASE_URL;
const scratchName = `search_test_${process.pid}`;
let db: Kysely<unknown>;
let scratchUrl = "";

async function runAsAdmin(statement: string) {
	const admin = new Bun.SQL(adminUrl ?? "");
	try {
		await admin.unsafe(statement);
	} finally {
		await admin.close();
	}
}

beforeAll(async () => {
	if (!adminUrl) throw new Error("DATABASE_URL is not set; copy .env.example and start compose");
	await runAsAdmin(`CREATE DATABASE ${scratchName}`);
	const url = new URL(adminUrl);
	url.pathname = `/${scratchName}`;
	scratchUrl = url.href;
	db = new Kysely<unknown>({
		dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: scratchUrl }) }),
	});
	await migrateUp(db);
});

afterAll(async () => {
	await db?.destroy();
	await closeSearchDb();
	await runAsAdmin(`DROP DATABASE IF EXISTS ${scratchName} WITH (FORCE)`);
});

function entry(overrides: Partial<IndexEntry> & Pick<IndexEntry, "entryId" | "title">): IndexEntry {
	return {
		collection: "post",
		slug: overrides.entryId,
		description: "",
		body: "",
		tags: [],
		publishedAt: new Date("2026-01-01"),
		...overrides,
	};
}

async function schemaShape() {
	const columns = await sql<{ name: string }>`
		SELECT table_schema || '.' || table_name || '.' || column_name || ':' || data_type AS name
		FROM information_schema.columns WHERE table_schema = 'search' ORDER BY 1`.execute(db);
	const indexes = await sql<{ name: string }>`
		SELECT indexdef AS name FROM pg_indexes WHERE schemaname = 'search' ORDER BY 1`.execute(db);
	return { columns: columns.rows, indexes: indexes.rows };
}

test("migration up, down, up leaves an identical schema, all inside schema search", async () => {
	const before = await schemaShape();
	expect(before.columns.length).toBeGreaterThan(0);
	await migrateDown(db);
	expect(
		(await schemaShape()).columns.filter((column) =>
			column.name.startsWith("search.search_index."),
		),
	).toEqual([]);
	await migrateUp(db);
	expect(await schemaShape()).toEqual(before);

	const strays = await sql<{ relname: string }>`
		SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE n.nspname = 'public'`.execute(db);
	expect(strays.rows).toEqual([]);
	const tables = await sql<{ name: string }>`
		SELECT table_name AS name FROM information_schema.tables
		WHERE table_schema = 'search' ORDER BY 1`.execute(db);
	expect(tables.rows.map((row) => row.name)).toEqual([
		"migration",
		"migration_lock",
		"search_index",
	]);
});

test("resync inserts, updates and removes; from empty it equals the given entries", async () => {
	await resyncSearchIndex(db, [
		entry({ entryId: "a", title: "Alpha guide" }),
		entry({ entryId: "b", title: "Beta guide" }),
	]);
	expect(
		(await searchEntries(db, { query: "guide" })).results.map((hit) => hit.slug).sort(),
	).toEqual(["a", "b"]);

	await resyncSearchIndex(db, [
		entry({ entryId: "a", title: "Alpha renamed zebra" }),
		entry({ entryId: "c", title: "Gamma guide" }),
	]);
	expect((await searchEntries(db, { query: "zebra" })).results.map((hit) => hit.slug)).toEqual([
		"a",
	]);
	expect((await searchEntries(db, { query: "guide" })).results.map((hit) => hit.slug)).toEqual([
		"c",
	]);

	await resyncSearchIndex(db, []);
	expect((await searchEntries(db, { query: "guide" })).results).toEqual([]);
});

test("a slow resync that read an older corpus cannot delete a later publish", async () => {
	const old = entry({ entryId: "old", title: "Old racer" });
	const fresh = entry({ entryId: "fresh", title: "Fresh racer" });
	let release: () => void = () => {};
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	const slow = resyncSearchIndex(db, async () => {
		await gate;
		return [old];
	});
	await Bun.sleep(30);
	const fast = resyncSearchIndex(db, async () => [old, fresh]);
	await Bun.sleep(30);
	release();
	await Promise.all([slow, fast]);
	expect(
		(await searchEntries(db, { query: "racer" })).results.map((hit) => hit.slug).sort(),
	).toEqual(["fresh", "old"]);
});

test("a word deep in the body is found, with a marked excerpt", async () => {
	const filler = "lorem ipsum dolor sit amet ".repeat(400);
	await resyncSearchIndex(db, [
		entry({ entryId: "long", title: "A long post", body: `${filler} quokka ${filler}` }),
	]);
	const [hit] = (await searchEntries(db, { query: "quokka" })).results;
	expect(hit?.slug).toBe("long");
	expect(hit?.excerpt).toContain("<mark>quokka</mark>");
});

test("tag filter narrows results and the facet lists tags of all matches", async () => {
	const web = { slug: "web", label: "Web" };
	const databases = { slug: "databases", label: "Databases" };
	await resyncSearchIndex(db, [
		entry({ entryId: "t1", title: "Indexing basics", tags: [databases] }),
		entry({ entryId: "t2", title: "Indexing the web", tags: [web] }),
	]);
	const all = await searchEntries(db, { query: "indexing" });
	expect(all.results).toHaveLength(2);
	expect(all.tags.map((tag) => tag.slug).sort()).toEqual(["databases", "web"]);
	const narrowed = await searchEntries(db, { query: "indexing", tag: "web" });
	expect(narrowed.results.map((hit) => hit.slug)).toEqual(["t2"]);
});

test("a title match ranks above a body match", async () => {
	await resyncSearchIndex(db, [
		entry({ entryId: "body-hit", title: "Something else", body: "all about walrus habits" }),
		entry({ entryId: "title-hit", title: "Walrus", body: "short" }),
	]);
	const { results } = await searchEntries(db, { query: "walrus" });
	expect(results.map((hit) => hit.slug)).toEqual(["title-hit", "body-hit"]);
});

test("markup in a body is shown as escaped text", async () => {
	await resyncSearchIndex(db, [
		entry({
			entryId: "xss",
			title: "Markup",
			body: 'before <script>alert("x")</script> if a < b && c > d then pelican after <<< here',
		}),
	]);
	const [hit] = (await searchEntries(db, { query: "pelican" })).results;
	expect(hit?.excerpt).not.toContain("<script>");
	expect(hit?.excerpt).toContain("a &lt; b &amp;&amp; c &gt; d");
	expect(hit?.excerpt).toContain("&lt;&lt;&lt;");
	expect(hit?.excerpt).toContain("<mark>pelican</mark>");
});

test("input that is not a query is harmless", async () => {
	expect((await searchEntries(db, { query: "   " })).results).toEqual([]);
	await expect(
		searchEntries(db, { query: `'; DROP TABLE search.search_index; -- & | ! (` }),
	).resolves.toHaveProperty("results");
	await searchEntries(db, { query: `'; DROP TABLE search.search_index; --` });
	const rows = await sql`SELECT 1 FROM search.search_index`.execute(db);
	expect(rows.rows.length).toBeGreaterThan(0);
});

function item(over: Partial<ContentItem> & { data: Record<string, unknown> }): ContentItem {
	return {
		id: "01",
		type: "post",
		slug: "live-post",
		status: "published",
		locale: null,
		createdAt: "",
		updatedAt: "",
		publishedAt: null,
		...over,
	} as ContentItem;
}

test("toIndexEntry skips drafts and flattens the Portable Text body", () => {
	expect(toIndexEntry("post", item({ status: "draft", data: {} }), [])).toBeNull();
	const built = toIndexEntry(
		"post",
		item({
			data: {
				title: "T",
				description: "D",
				publish_date: "2026-02-03",
				body: [
					{
						_type: "block",
						_key: "k",
						style: "normal",
						children: [{ _type: "span", _key: "s", text: "hello deep words", marks: [] }],
						markDefs: [],
					},
				],
			},
		}),
		[{ slug: "x", label: "X" }],
	);
	expect(built?.body).toContain("hello deep words");
	expect(built?.tags).toEqual([{ slug: "x", label: "X" }]);
});

function body(text: string) {
	return [
		{
			_type: "block",
			_key: "k",
			style: "normal",
			children: [{ _type: "span", _key: "s", text, marks: [] }],
			markDefs: [],
		},
	];
}

function pluginHarness(items: Record<string, ContentItem>) {
	const errors: string[] = [];
	const lists: string[] = [];
	const ctx = {
		content: {
			get: async (_collection: string, id: string) => items[id] ?? null,
			list: async (collection: string) => {
				lists.push(collection);
				return {
					items: collection === "post" ? Object.values(items) : [],
					hasMore: false,
				};
			},
		},
		taxonomies: { getEntryTerms: async () => [] },
		log: { error: (message: string) => errors.push(message) },
	} as unknown as PluginContext;
	const hooks = createPlugin().hooks;
	const run = async (name: keyof typeof hooks, event: unknown) => {
		const hook = hooks[name];
		if (!hook || typeof hook === "function") throw new Error(`no ${String(name)} hook`);
		await (hook.handler as (event: unknown, ctx: PluginContext) => unknown)(event, ctx);
	};
	return { ctx, errors, lists, run };
}

function post(id: string, text: string, over: Partial<ContentItem> = {}) {
	return item({
		id,
		slug: `slug-${id}`,
		data: { title: `Post ${id}`, publish_date: "2026-03-01", body: body(text) },
		...over,
	});
}

const slugs = async (query: string) =>
	(await searchEntries(db, { query })).results.map((hit) => hit.slug);

test("hooks upsert or delete only the changed entry", async () => {
	const savedUrl = process.env.DATABASE_URL;
	process.env.DATABASE_URL = scratchUrl;
	try {
		await resyncSearchIndex(db, [entry({ entryId: "bystander", title: "Bystander kiwi" })]);
		const items: Record<string, ContentItem> = { p1: post("p1", "original wording") };
		const { run, lists, errors } = pluginHarness(items);

		await run("content:afterPublish", { content: { id: "p1" }, collection: "post" });
		expect(await slugs("original")).toEqual(["slug-p1"]);
		expect(await slugs("kiwi")).toEqual(["bystander"]);

		items.p1 = post("p1", "rewritten with narwhal");
		await run("content:afterSave", { content: { id: "p1" }, collection: "post", isNew: false });
		expect(await slugs("narwhal")).toEqual(["slug-p1"]);
		expect(await slugs("original")).toEqual([]);

		items.p1 = post("p1", "narwhal", { status: "draft" });
		await run("content:afterUnpublish", { content: { id: "p1" }, collection: "post" });
		expect(await slugs("narwhal")).toEqual([]);

		items.p1 = post("p1", "back from the trash");
		await run("content:afterRestore", { content: { id: "p1" }, collection: "post" });
		expect(await slugs("trash")).toEqual(["slug-p1"]);

		await run("content:afterDelete", { id: "p1", collection: "post", permanent: false });
		expect(await slugs("trash")).toEqual([]);

		await run("content:afterSave", { content: { id: "p1" }, collection: "page", isNew: true });
		await run("content:afterDelete", { id: "bystander", collection: "page", permanent: true });
		expect(await slugs("kiwi")).toEqual(["bystander"]);
		expect(lists).toEqual([]);
		expect(errors).toEqual([]);
	} finally {
		await closeSearchDb();
		if (savedUrl === undefined) delete process.env.DATABASE_URL;
		else process.env.DATABASE_URL = savedUrl;
	}
});

async function withScratchDatabase(work: () => Promise<void>) {
	const savedUrl = process.env.DATABASE_URL;
	process.env.DATABASE_URL = scratchUrl;
	try {
		await work();
	} finally {
		await closeSearchDb();
		if (savedUrl === undefined) delete process.env.DATABASE_URL;
		else process.env.DATABASE_URL = savedUrl;
	}
}

test("cron, activate and the first page request each rebuild the whole index", () =>
	withScratchDatabase(async () => {
		const items = { p2: post("p2", "cron lynx") };

		const cron = pluginHarness(items);
		await resyncSearchIndex(db, []);
		await cron.run("cron", { name: "search-nightly-resync", time: "" });
		expect(await slugs("lynx")).toEqual(["slug-p2"]);

		const activate = pluginHarness(items);
		await resyncSearchIndex(db, []);
		await activate.run("plugin:activate", {});
		expect(await slugs("lynx")).toEqual(["slug-p2"]);

		const boot = pluginHarness(items);
		await resyncSearchIndex(db, []);
		await boot.run("page:metadata", { page: {} });
		await Bun.sleep(200);
		expect(await slugs("lynx")).toEqual(["slug-p2"]);
		expect(boot.lists.length).toBeGreaterThan(0);

		expect([...cron.errors, ...activate.errors, ...boot.errors]).toEqual([]);
	}));

test("a failed full resync logs its error class and retries once", async () => {
	const savedUrl = process.env.DATABASE_URL;
	process.env.DATABASE_URL = scratchUrl;
	try {
		let calls = 0;
		const { ctx, errors } = pluginHarness({});
		const content = ctx.content as unknown as { list: () => Promise<unknown> };
		content.list = async () => {
			calls += 1;
			if (calls === 1) throw new TypeError("schema search does not exist");
			return { items: [], hasMore: false };
		};
		const hook = createPlugin().hooks.cron;
		if (!hook || typeof hook === "function") throw new Error("no cron hook");
		await (hook.handler as (event: unknown, ctx: PluginContext) => unknown)({}, ctx);
		expect(errors).toEqual(["search resync failed"]);
		expect(calls).toBeGreaterThanOrEqual(2);
	} finally {
		await closeSearchDb();
		if (savedUrl === undefined) delete process.env.DATABASE_URL;
		else process.env.DATABASE_URL = savedUrl;
	}
});
