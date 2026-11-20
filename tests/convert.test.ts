import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	type Block,
	type Converted,
	convert,
	convertAll,
	imageRefs,
	loadSources,
} from "../scripts/convert";

const contentRoot = join(import.meta.dir, "../src/content");
const { published, drafts } = convertAll(contentRoot);
const bySlug = new Map(published.map((doc) => [doc.slug, doc]));

function doc(slug: string): Converted {
	const found = bySlug.get(slug);
	if (!found) throw new Error(`${slug} not converted`);
	return found;
}

function counts(blocks: Block[]): Record<string, number> {
	const out: Record<string, number> = {};
	for (const block of blocks) out[block._type] = (out[block._type] ?? 0) + 1;
	return out;
}

const expected: Record<
	string,
	{ title: string; publishDate: string; tags: string[]; blocks: Record<string, number> }
> = {
	"done-on-paper-before-done-in-code": {
		title: "Done on Paper, Before Done in Code",
		publishDate: "2024-07-06T00:00:00.000Z",
		tags: ["estimation", "software development"],
		blocks: { admonition: 1, block: 46, image: 1 },
	},
	"helsinki-tallinn-guide": {
		title: "Helsinki (and Tallinn) travel guide",
		publishDate: "2026-07-10T00:00:00.000Z",
		tags: ["travel", "helsinki", "tallinn", "finland"],
		blocks: { block: 155, image: 18, table: 1, footer: 1 },
	},
	"how-to-use-test-todo-in-jest": {
		title: "How to use test.todo() in Jest",
		publishDate: "2021-08-03T00:00:00.000Z",
		tags: ["developer experience", "testing", "javascript", "jest"],
		blocks: { block: 34, code: 4, iframe: 2, image: 3 },
	},
	"how-we-estimate": {
		title: "P50: A Sensible Way to Estimate in Software Development",
		publishDate: "2024-04-16T00:00:00.000Z",
		tags: ["estimation", "software development"],
		blocks: { admonition: 1, block: 31, image: 1 },
	},
	"i-built-my-first-pc": {
		title: "I built my first PC",
		publishDate: "2025-08-03T00:00:00.000Z",
		tags: ["pc", "gaming"],
		blocks: { admonition: 1, block: 52, image: 1, table: 1 },
	},
	"micro-dollar": {
		title: "micro-dollar: a way to deals with decimal or monetary values",
		publishDate: "2023-02-07T00:00:00.000Z",
		tags: ["decimal", "javascript", "tips"],
		blocks: { block: 25, image: 1, code: 2 },
	},
	"stacktrace-is-underrated": {
		title: "Stacktrace is Underrated",
		publishDate: "2025-08-10T00:00:00.000Z",
		tags: ["debugging", "typescript", "performance", "developer experience", "stacktrace"],
		blocks: { block: 49, code: 8 },
	},
	"start-work-skill": {
		title: "My /start-work Claude Code skill",
		publishDate: "2026-07-06T09:00:00.000Z",
		tags: [],
		blocks: { block: 7, code: 3 },
	},
	"the-interview-insights": {
		title: "The interview insights",
		publishDate: "2025-03-11T00:00:00.000Z",
		tags: ["hiring", "interview"],
		blocks: { admonition: 1, block: 154, image: 3, break: 1 },
	},
	"write-ahead-log": {
		title: "WAL: a write-ahead log, or writing it down before I do it",
		publishDate: "2026-08-29T00:00:00.000Z",
		tags: ["databases", "distributed systems", "postgres", "architecture"],
		blocks: { block: 161, image: 5, code: 4, table: 1 },
	},
};

test("every published post and the snippet converts, drafts are excluded", () => {
	expect([...bySlug.keys()].sort()).toEqual(Object.keys(expected).sort());
	expect(drafts).toEqual(["markdown-elements"]);
});

for (const [slug, want] of Object.entries(expected)) {
	test(`${slug}: frontmatter and block counts`, () => {
		const got = doc(slug);
		expect(got.title).toBe(want.title);
		expect(got.publishDate).toBe(want.publishDate);
		expect(got.tags).toEqual(want.tags);
		expect(counts(got.body)).toEqual(want.blocks);
	});
}

test("slug is the folder name, or the snippet file name", () => {
	const sources = loadSources(contentRoot);
	for (const source of sources) {
		const folder =
			source.collection === "post"
				? source.dir.split("/").pop()
				: source.file.split("/").pop()?.replace(/\.md$/, "");
		expect(source.slug).toBe(folder as string);
	}
});

test("cover image, description and updatedDate are carried over", () => {
	expect(doc("how-we-estimate").coverImage).toEqual({
		src: "calendar.jpg",
		alt: "Calendar of P50",
	});
	expect(doc("stacktrace-is-underrated").coverImage).toBeUndefined();
	expect(doc("i-built-my-first-pc").description).toBe(
		"A July side-project from someone who wants to play games",
	);
	const source = loadSources(contentRoot).find((s) => s.slug === "markdown-elements");
	if (!source) throw new Error("markdown-elements missing");
	const draft = convert(source, readFileSync(source.file, "utf8"));
	expect(draft.updatedDate).toBe("2024-01-22T00:00:00.000Z");
	expect(draft.draft).toBe(true);
});

test("the MDX post resolves 18 imported images to relative paths, none absolute", () => {
	const refs = imageRefs(doc("helsinki-tallinn-guide")).posts;
	expect(refs).toHaveLength(18);
	expect(refs.every((src) => !src.startsWith(".") && !src.startsWith("/"))).toBe(true);
	expect(refs).toContain("central-station-helsinki.jpg");
});

test("directives become admonitions, with the markdown link kept", () => {
	const block = doc("how-we-estimate").body.find((b) => b._type === "admonition");
	if (block?._type !== "admonition") throw new Error("no admonition");
	expect(block.kind).toBe("important");
	const link = block.body.flatMap((b) => (b._type === "block" ? b.markDefs : []));
	expect(link).toContainEqual(
		expect.objectContaining({
			_type: "link",
			href: "https://heyfirst.substack.com/p/p50-a-sensible-way-to-estimate-in",
		}),
	);
});

test("the five mermaid blocks become diagram images with the source as alt", () => {
	const refs = imageRefs(doc("write-ahead-log")).diagrams;
	expect(refs).toEqual([
		"write-ahead-log-1.png",
		"write-ahead-log-2.png",
		"write-ahead-log-3.png",
		"write-ahead-log-4.png",
		"write-ahead-log-5.png",
	]);
	const first = doc("write-ahead-log").body.find((b) => b._type === "image" && b.diagram);
	if (first?._type !== "image") throw new Error("no diagram");
	expect(first.alt).toContain("flowchart LR");
});

test("tables keep header row and link marks", () => {
	const table = doc("i-built-my-first-pc").body.find((b) => b._type === "table");
	if (table?._type !== "table") throw new Error("no table");
	expect(table.rows[0]?.cells.map((c) => c.children[0]?.text)).toEqual(["Item", "Price", "Seller"]);
	expect(table.rows[1]?.cells[2]?.markDefs[0]).toMatchObject({
		_type: "link",
		href: "https://www.verkkokauppa.com/",
	});
});

test("code keeps language and meta; nested lists keep level", () => {
	const code = doc("how-to-use-test-todo-in-jest").body.find((b) => b._type === "code");
	expect(code).toMatchObject({ _type: "code", language: expect.any(String) });
	const levels = published
		.flatMap((d) => d.body)
		.flatMap((b) => (b._type === "block" && b.level ? [b.level] : []));
	expect(Math.max(...levels)).toBeGreaterThanOrEqual(2);
});

test("footnotes become footnote marks with the definition text", () => {
	const source = loadSources(contentRoot).find((s) => s.slug === "markdown-elements");
	if (!source) throw new Error("markdown-elements missing");
	const converted = convert(source, readFileSync(source.file, "utf8"));
	const defs = converted.body
		.flatMap((b) => (b._type === "block" ? b.markDefs : []))
		.filter((m) => m._type === "footnote");
	expect(defs.map((d) => d.text)).toEqual([
		"Reference first footnote with a return to content link.",
		"Second reference with a link.",
	]);
	expect(JSON.stringify(converted.body)).not.toContain("footnoteDefinition");
});

test("conversion is deterministic", () => {
	expect(convertAll(contentRoot)).toEqual({ published, drafts });
});

const synthetic = { collection: "post", slug: "t", dir: "/t", file: "/t/index.md" } as const;
const frontmatter = "---\ntitle: T\ndescription: d\npublishDate: 2024-01-01\ntags: []\n---\n\n";

test("html the converter does not know fails loudly instead of vanishing", () => {
	expect(() => convert(synthetic, `${frontmatter}<div>lost</div>\n`)).toThrow(/unsupported html/);
	expect(() => convert(synthetic, `${frontmatter}a <span>b</span> c\n`)).toThrow(
		/unsupported inline html/,
	);
});

test("iframes become iframe blocks and <kbd> becomes a code mark", () => {
	const converted = convert(
		synthetic,
		`${frontmatter}<iframe src="https://giphy.com/embed/x" width="480" height="222" allowFullScreen></iframe>\n\nPress <kbd>Esc</kbd> now\n`,
	);
	expect(converted.body[0]).toMatchObject({
		_type: "iframe",
		src: "https://giphy.com/embed/x",
		width: 480,
		height: 222,
		allowFullscreen: true,
	});
	const spans = converted.body.flatMap((b) => (b._type === "block" ? b.children : []));
	expect(spans.find((s) => s.text === "Esc")?.marks).toEqual(["code"]);
	expect(spans.find((s) => s.text === "Press ")?.marks).toEqual([]);
});
