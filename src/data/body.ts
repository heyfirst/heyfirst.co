import { type PortableTextBlock, slugify } from "emdash";

export type Heading = { depth: number; slug: string; text: string };

export type Footnote = { id: string; text: string };

export type PreparedBody = {
	body: PortableTextBlock[];
	headings: Heading[];
	footnotes: Footnote[];
};

const HEADING_FALLBACK = "heading";

type Collected = { headings: Heading[]; footnotes: Footnote[]; used: Set<string>; scope: string };

function blockText(block: object): string {
	if (!("children" in block) || !Array.isArray(block.children)) return "";
	return block.children
		.map((child) => (typeof child?.text === "string" ? child.text : ""))
		.join("");
}

function baseId(text: string): string {
	return /[\p{L}\p{N}]/u.test(text) ? slugify(text) : HEADING_FALLBACK;
}

function uniqueId(base: string, used: Set<string>): string {
	let id = base;
	for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
	used.add(id);
	return id;
}

function headingDepth(node: object): number {
	if (!("style" in node)) return 0;
	return Number(/^h([1-6])$/.exec(String(node.style))?.[1] ?? 0);
}

function withFootnoteIds(node: object, found: Collected): object {
	if (!("markDefs" in node) || !Array.isArray(node.markDefs)) return node;
	const markDefs = node.markDefs.map((def) => {
		if (def?._type !== "footnote") return def;
		const domId = found.scope ? `${found.scope}-${def._key}` : String(def._key);
		found.footnotes.push({ id: domId, text: String(def.text) });
		return { ...def, domId };
	});
	return { ...node, markDefs };
}

function visit(node: unknown, found: Collected): unknown {
	if (Array.isArray(node)) return node.map((child) => visit(child, found));
	if (typeof node !== "object" || node === null) return node;
	const depth = headingDepth(node);
	const text = blockText(node);
	const headingId = depth ? uniqueId(baseId(text), found.used) : undefined;
	if (headingId) found.headings.push({ depth, text, slug: headingId });
	const own = withFootnoteIds(node, found);
	const entries = Object.entries(own).map(([key, value]) => [key, visit(value, found)]);
	const copy = Object.fromEntries(entries);
	return headingId ? { ...copy, headingId } : copy;
}

/** Heading ids are unique per document; footnote ids are unique per scope (a post or snippet slug). */
export function prepareBody(body: PortableTextBlock[], scope = ""): PreparedBody {
	const found: Collected = { headings: [], footnotes: [], used: new Set(), scope };
	return {
		body: visit(body, found) as PortableTextBlock[],
		headings: found.headings,
		footnotes: found.footnotes,
	};
}
