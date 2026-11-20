import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { computeContentHash } from "emdash";
import type { MediaItemWithUrl } from "emdash/client";
import { type Block, type Converted, convertAll, imageRefs, loadSources } from "./convert";
import {
	type Connection,
	connect,
	entryTagSlugs,
	findEntry,
	setEntryTags,
	slugify,
} from "./emdash-client";

const contentRoot = join(import.meta.dir, "../src/content");
const diagramRoot = join(import.meta.dir, "diagrams");
const sourceDirs = new Map(loadSources(contentRoot).map((s) => [docKey(s), s.dir]));

const NOT_IN_COLLECTION = {
	post: ["lang"],
	snippet: ["updated_date", "cover_image"],
} as const;

type Media = Pick<
	MediaItemWithUrl,
	"id" | "url" | "filename" | "mimeType" | "width" | "height" | "size" | "contentHash"
>;
type MediaLookup = (doc: Converted, src: string, diagram: boolean) => Media;

if (import.meta.main) {
	const dryRun = process.argv.includes("--dry-run");
	const { published, drafts } = convertAll(contentRoot);
	console.log(`${published.length} to import, drafts skipped: ${drafts.join(", ") || "none"}`);
	if (dryRun) writeDryRun(published);
	else await importAll(published);
}

function writeDryRun(docs: Converted[]): void {
	const dir = mkdtempSync(join(tmpdir(), "import-content-"));
	for (const doc of docs)
		writeFileSync(join(dir, `${doc.slug}.json`), JSON.stringify(doc, null, 2));
	console.log(`dry run: wrote ${docs.length} files to ${dir}, no network`);
}

async function importAll(docs: Converted[]): Promise<void> {
	const conn = connect(process.env);
	const uploaded = await uploadMedia(conn, docs);
	const terms = await tagTerms(conn, docs);
	const lookup: MediaLookup = (doc, src, diagram) => {
		const found = uploaded.get(mediaName(doc, src, diagram));
		if (!found) throw new Error(`${doc.slug}: ${src} was not uploaded`);
		return found;
	};
	for (const doc of docs)
		console.log(`${await upsert(conn, doc, lookup, terms)}  ${doc.collection}/${doc.slug}`);
}

function docKey(doc: { collection: string; slug: string }): string {
	return `${doc.collection}/${doc.slug}`;
}

function mediaName(doc: Converted, src: string, diagram: boolean): string {
	return diagram ? basename(src) : `${doc.slug}--${basename(src)}`;
}

async function uploadMedia(conn: Connection, docs: Converted[]): Promise<Map<string, Media>> {
	const have = new Map<string, Media>();
	let cursor: string | undefined;
	do {
		const page = await conn.client.mediaList(cursor ? { limit: 100, cursor } : { limit: 100 });
		for (const item of page.items) have.set(item.filename, item);
		cursor = page.nextCursor;
	} while (cursor);

	for (const doc of docs) {
		const refs = imageRefs(doc);
		const files = [
			...refs.posts.map((src) => ({
				name: mediaName(doc, src, false),
				path: join(sourceDir(doc), src),
			})),
			...refs.diagrams.map((src) => ({
				name: mediaName(doc, src, true),
				path: join(diagramRoot, src),
			})),
		];
		for (const file of files) {
			const bytes = readFileSync(file.path);
			const existing = have.get(file.name);
			if (existing && (await sameBytes(existing, bytes))) continue;
			have.set(file.name, await conn.client.mediaUpload(bytes, file.name));
		}
	}
	return have;
}

async function sameBytes(existing: Media, bytes: Uint8Array): Promise<boolean> {
	if (existing.contentHash) return existing.contentHash === (await computeContentHash(bytes));
	return existing.size === bytes.byteLength;
}

function sourceDir(doc: Converted): string {
	const dir = sourceDirs.get(docKey(doc));
	if (!dir) throw new Error(`${doc.slug}: source not found`);
	return dir;
}

async function tagTerms(conn: Connection, docs: Converted[]): Promise<Map<string, string>> {
	const wanted = new Set(docs.flatMap((doc) => doc.tags));
	const read = async () => (await conn.client.terms("tag", { limit: 500 })).items;
	let items = await read();
	for (const label of wanted) {
		if (items.some((t) => t.slug === slugify(label))) continue;
		await conn.client.createTerm("tag", { slug: slugify(label), label });
		items = await read();
	}
	return new Map(items.map((t) => [t.slug, t.id]));
}

export function entryData(doc: Converted, lookup: MediaLookup): Record<string, unknown> {
	const data: Record<string, unknown> = {
		title: doc.title,
		description: doc.description,
		publish_date: doc.publishDate,
		body: doc.body.map((block) => resolveBlock(block, doc, lookup)),
	};
	data.updated_date = doc.updatedDate ?? null;
	data.lang = doc.lang ?? null;
	data.cover_image = doc.coverImage
		? mediaValue(lookup(doc, doc.coverImage.src, false), doc.coverImage.alt)
		: null;
	for (const field of NOT_IN_COLLECTION[doc.collection]) delete data[field];
	return data;
}

function mediaValue(media: Media, alt: string) {
	return {
		provider: "local",
		id: media.id,
		src: media.url,
		filename: media.filename,
		mimeType: media.mimeType,
		width: media.width,
		height: media.height,
		alt,
	};
}

function resolveBlock(block: Block, doc: Converted, lookup: MediaLookup): unknown {
	if (block._type === "image") {
		const media = lookup(doc, block.src, block.diagram === true);
		return {
			_type: "image",
			_key: block._key,
			alt: block.alt,
			asset: { _ref: media.id, url: media.url },
			width: media.width,
			height: media.height,
		};
	}
	if (block._type === "admonition" || block._type === "footer") {
		return { ...block, body: block.body.map((b) => resolveBlock(b, doc, lookup)) };
	}
	return block;
}

type Existing = NonNullable<Awaited<ReturnType<typeof findEntry>>>;

function unchanged(existing: Existing, data: Record<string, unknown>): boolean {
	return Object.entries(data).every(([field, value]) =>
		covers(existing.data[field], field === "cover_image" ? withoutSrc(value) : value),
	);
}

function withoutSrc(value: unknown): unknown {
	if (value === null) return null;
	const { src: _stored, ...rest } = value as Record<string, unknown>;
	return rest;
}

function covers(have: unknown, want: unknown): boolean {
	if (want === null) return have == null;
	if (Array.isArray(want))
		return (
			Array.isArray(have) &&
			have.length === want.length &&
			want.every((item, i) => covers(have[i], item))
		);
	if (want !== null && typeof want === "object") {
		if (have === null || typeof have !== "object") return false;
		const haveRecord = have as Record<string, unknown>;
		return Object.entries(want).every(([key, value]) => covers(haveRecord[key], value));
	}
	return have === want;
}

async function upsert(
	conn: Connection,
	doc: Converted,
	lookup: MediaLookup,
	terms: Map<string, string>,
): Promise<"created" | "updated" | "same"> {
	const data = entryData(doc, lookup);
	const existing = await findEntry(conn.client, doc.collection, doc.slug);
	let id: string;
	let result: "created" | "updated" | "same" = "same";
	if (!existing) {
		const created = await conn.client.create(doc.collection, { data, slug: doc.slug });
		await conn.client.publish(doc.collection, created.id, { publishedAt: doc.publishDate });
		id = created.id;
		result = "created";
	} else {
		id = existing.id;
		if (existing.status !== "published" || !unchanged(existing, data)) {
			const updated = await conn.client.update(doc.collection, id, {
				data,
				...(existing._rev ? { _rev: existing._rev } : {}),
			});
			await conn.client.publish(doc.collection, updated.id, { publishedAt: doc.publishDate });
			result = "updated";
		}
	}
	if (doc.collection === "post" && (await syncTags(conn, doc, id, terms)))
		result = result === "same" ? "updated" : result;
	return result;
}

async function syncTags(conn: Connection, doc: Converted, id: string, terms: Map<string, string>) {
	const want = doc.tags.map(slugify).sort();
	const have = await entryTagSlugs(conn, doc.collection, id);
	if (want.join() === have.join()) return false;
	const termIds = want.map((slug) => terms.get(slug));
	if (termIds.some((t) => t === undefined)) throw new Error(`${doc.slug}: tag term missing`);
	await setEntryTags(
		conn,
		doc.collection,
		id,
		termIds.filter((t): t is string => t !== undefined),
	);
	return true;
}
