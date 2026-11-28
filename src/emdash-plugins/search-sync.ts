import { definePlugin, type PluginContext } from "emdash";
import { SEARCHED_COLLECTIONS, toIndexEntry } from "../search/entries";
import {
	deleteSearchEntry,
	getSearchDb,
	type IndexEntry,
	resyncSearchIndex,
	upsertSearchEntry,
} from "../search/resync";

const NIGHTLY_TASK = "search-nightly-resync";
const NIGHTLY_UTC = "0 3 * * *";
const PAGE_SIZE = 100;
const BOOT_RETRY_MS = 30_000;

const searched = new Set<string>(SEARCHED_COLLECTIONS);

type Content = NonNullable<PluginContext["content"]>;
type Taxonomies = NonNullable<PluginContext["taxonomies"]>;

function access(ctx: PluginContext): { content: Content; taxonomies: Taxonomies } {
	const { content, taxonomies } = ctx;
	if (!content || !taxonomies)
		throw new Error("search-sync needs content:read and taxonomies:read");
	return { content, taxonomies };
}

async function collectEntries(ctx: PluginContext): Promise<IndexEntry[]> {
	const { content, taxonomies } = access(ctx);
	const entries: IndexEntry[] = [];
	for (const collection of SEARCHED_COLLECTIONS) {
		let cursor: string | undefined;
		do {
			const page = await content.list(collection, {
				where: { status: "published" },
				limit: PAGE_SIZE,
				...(cursor && { cursor }),
			});
			for (const item of page.items) {
				const terms = await taxonomies.getEntryTerms(collection, item.id, { taxonomy: "tag" });
				const entry = toIndexEntry(collection, item, terms);
				if (entry) entries.push(entry);
			}
			cursor = page.hasMore ? page.cursor : undefined;
		} while (cursor);
	}
	return entries;
}

function errorClass(error: unknown): string {
	return error instanceof Error ? error.name : typeof error;
}

async function attempt(ctx: PluginContext, what: string, work: () => Promise<void>) {
	try {
		await work();
		return true;
	} catch (error) {
		ctx.log.error(`search ${what} failed`, { errorClass: errorClass(error) });
		return false;
	}
}

async function fullResync(ctx: PluginContext): Promise<boolean> {
	const run = () => resyncSearchIndex(getSearchDb(), () => collectEntries(ctx));
	return (await attempt(ctx, "resync", run)) || (await attempt(ctx, "resync retry", run));
}

async function syncEntry(ctx: PluginContext, collection: string, id: string): Promise<void> {
	if (!searched.has(collection)) return;
	await attempt(ctx, "entry sync", async () => {
		const { content, taxonomies } = access(ctx);
		const item = await content.get(collection, id);
		const terms = item ? await taxonomies.getEntryTerms(collection, id, { taxonomy: "tag" }) : [];
		const entry = item ? toIndexEntry(collection, item, terms) : null;
		if (entry) await upsertSearchEntry(getSearchDb(), entry);
		else await deleteSearchEntry(getSearchDb(), collection, id);
	});
}

async function removeEntry(ctx: PluginContext, collection: string, id: string): Promise<void> {
	if (!searched.has(collection)) return;
	await attempt(ctx, "entry delete", () => deleteSearchEntry(getSearchDb(), collection, id));
}

export function createPlugin() {
	let queue: Promise<unknown> = Promise.resolve();
	let pendingFull: Promise<boolean> | undefined;
	let booted = false;
	let lastBootAttempt = 0;

	const enqueue = <T>(job: () => Promise<T>): Promise<T> => {
		const next = queue.then(job, job);
		queue = next.catch(() => undefined);
		return next;
	};

	// A burst of full resyncs shares the one that has not started yet.
	const resyncAll = (ctx: PluginContext): Promise<boolean> => {
		if (pendingFull) return pendingFull;
		const job = enqueue(() => {
			pendingFull = undefined;
			return fullResync(ctx);
		});
		pendingFull = job;
		return job;
	};

	const bootOnce = async (ctx: PluginContext) => {
		if (booted || Date.now() - lastBootAttempt < BOOT_RETRY_MS) return;
		lastBootAttempt = Date.now();
		booted = await resyncAll(ctx);
	};

	const changed = (
		event: { content: Record<string, unknown>; collection: string },
		ctx: PluginContext,
	) => enqueue(() => syncEntry(ctx, event.collection, String(event.content.id)));

	return definePlugin({
		id: "search-sync",
		version: "1.1.0",
		capabilities: ["content:read", "taxonomies:read"],
		hooks: {
			"plugin:activate": async (_event, ctx) => {
				await ctx.cron?.schedule(NIGHTLY_TASK, { schedule: NIGHTLY_UTC });
				booted = await resyncAll(ctx);
			},
			"content:afterSave": changed,
			"content:afterPublish": changed,
			"content:afterUnpublish": changed,
			"content:afterRestore": changed,
			"content:afterDelete": (event, ctx) =>
				enqueue(() => removeEntry(ctx, event.collection, event.id)),
			cron: async (_event, ctx) => {
				booted = (await resyncAll(ctx)) || booted;
			},
			"page:metadata": (_event, ctx) => {
				void bootOnce(ctx);
				return null;
			},
		},
	});
}
