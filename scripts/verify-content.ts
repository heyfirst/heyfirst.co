import { join } from "node:path";
import { type Converted, convertAll, imageRefs } from "./convert";
import { connect, entryTagSlugs, findEntry, slugify } from "./emdash-client";

const contentRoot = join(import.meta.dir, "../src/content");

type Row = { slug: string; problems: string[] };

const conn = connect(process.env);
const { published } = convertAll(contentRoot);
const rows: Row[] = [];
for (const doc of published) rows.push(await check(doc));

for (const collection of ["post", "snippet"] as const) {
	const docs = published.filter((d) => d.collection === collection);
	let remoteCount = 0;
	for await (const item of conn.client.listAll(collection, { status: "published", limit: 100 })) {
		remoteCount++;
		if (!docs.some((d) => d.slug === item.slug)) {
			rows.push({ slug: `${collection}/${item.slug}`, problems: ["not in old files"] });
		}
	}
	console.log(`${collection}: ${docs.length} old, ${remoteCount} new`);
}
for (const row of rows) {
	console.log(
		`${row.problems.length === 0 ? "ok  " : "FAIL"} ${row.slug} ${row.problems.join("; ")}`,
	);
}
if (rows.some((row) => row.problems.length > 0)) process.exit(1);

function sameInstant(have: unknown, want: string | undefined): boolean {
	if (!want) return have == null;
	return typeof have === "string" && new Date(have).getTime() === new Date(want).getTime();
}

async function check(doc: Converted): Promise<Row> {
	const problems: string[] = [];
	const entry = await findEntry(conn.client, doc.collection, doc.slug);
	if (!entry || entry.status !== "published")
		return { slug: doc.slug, problems: ["missing or unpublished"] };
	if (entry.slug !== doc.slug) problems.push(`slug ${entry.slug}`);
	if (entry.data.title !== doc.title) problems.push(`title "${entry.data.title}"`);
	if (entry.data.description !== doc.description) problems.push("description differs");
	if (!sameInstant(entry.data.publish_date, doc.publishDate)) {
		problems.push(`publishDate ${entry.data.publish_date} != ${doc.publishDate}`);
	}
	if (doc.collection === "post") {
		if (!sameInstant(entry.data.updated_date, doc.updatedDate)) {
			problems.push(`updatedDate ${entry.data.updated_date} != ${doc.updatedDate}`);
		}
		const tags = await entryTagSlugs(conn, doc.collection, entry.id);
		const want = doc.tags.map(slugify).sort();
		if (tags.join() !== want.join()) problems.push(`tags ${tags.join(",")} != ${want.join(",")}`);
	}
	const refs = imageRefs(doc);
	const urls = new Set(
		JSON.stringify(entry.data.body).match(/\/_emdash\/api\/media\/file\/[^"]+/g),
	);
	const cover = entry.data.cover_image as { meta?: { storageKey?: string } } | undefined;
	if (cover?.meta?.storageKey) urls.add(`/_emdash/api/media/file/${cover.meta.storageKey}`);
	if (urls.size !== refs.posts.length + refs.diagrams.length)
		problems.push(`${urls.size} media urls, want ${refs.posts.length + refs.diagrams.length}`);
	for (const url of urls) {
		const response = await fetch(`${conn.baseUrl}${url}`);
		if (!response.ok) problems.push(`${url} -> ${response.status}`);
	}
	return { slug: doc.slug, problems };
}
