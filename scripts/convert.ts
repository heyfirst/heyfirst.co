import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, normalize } from "node:path";
import type { List, ListItem, Nodes, PhrasingContent, Root, RootContent, Table } from "mdast";
import { toString as nodeText } from "mdast-util-to-string";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";

export type Span = { _type: "span"; _key: string; text: string; marks: string[] };
export type MarkDef =
	| { _type: "link"; _key: string; href: string }
	| { _type: "footnote"; _key: string; text: string };
export type TextBlock = {
	_type: "block";
	_key: string;
	style: "normal" | "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	listItem?: "bullet" | "number";
	level?: number;
	children: Span[];
	markDefs: MarkDef[];
};
export type ImageBlock = {
	_type: "image";
	_key: string;
	src: string;
	alt: string;
	diagram?: true;
};
export type CodeBlock = {
	_type: "code";
	_key: string;
	language: string;
	code: string;
	meta?: string;
};
export type AdmonitionBlock = {
	_type: "admonition";
	_key: string;
	kind: string;
	title?: string;
	body: Block[];
};
export type TableBlock = {
	_type: "table";
	_key: string;
	rows: { _key: string; cells: TextBlock[] }[];
};
export type FooterBlock = { _type: "footer"; _key: string; body: Block[] };
export type IframeBlock = {
	_type: "iframe";
	_key: string;
	src: string;
	title: string;
	width?: number;
	height?: number;
	allowFullscreen?: true;
};
export type BreakBlock = { _type: "break"; _key: string };
export type Block =
	| TextBlock
	| ImageBlock
	| CodeBlock
	| AdmonitionBlock
	| TableBlock
	| FooterBlock
	| IframeBlock
	| BreakBlock;

export type Collection = "post" | "snippet";

export type Converted = {
	collection: Collection;
	slug: string;
	title: string;
	description: string;
	tags: string[];
	publishDate: string;
	updatedDate?: string;
	coverImage?: { src: string; alt: string };
	lang?: string;
	draft: boolean;
	body: Block[];
};

export type SourceFile = { collection: Collection; slug: string; dir: string; file: string };

const ADMONITIONS = new Set(["tip", "note", "important", "caution", "warning"]);
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const MDX_IMPORT = /^import\s+(\w+)\s+from\s+["']([^"']+)["']/gm;
const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export function convert(source: SourceFile, text: string): Converted {
	const match = FRONTMATTER.exec(text);
	if (!match?.[1]) throw new Error(`${source.file}: no frontmatter`);
	const meta = parseFrontmatter(match[1], source);
	const tree = parseBody(text.slice(match[0].length), source.file.endsWith(".mdx"));
	const body = new Walker(source).blocks(tree.children);
	return { ...meta, collection: source.collection, slug: source.slug, body };
}

export function loadSources(contentRoot: string): SourceFile[] {
	const posts = readdirSync(join(contentRoot, "post"))
		.filter((name) => statSync(join(contentRoot, "post", name)).isDirectory())
		.map((name) => {
			const dir = join(contentRoot, "post", name);
			const file = readdirSync(dir).find((f) => /^index\.mdx?$/.test(f));
			if (!file) throw new Error(`${dir}: no index.md or index.mdx`);
			return { collection: "post" as const, slug: name, dir, file: join(dir, file) };
		});
	const snippetDir = join(contentRoot, "snippet");
	const snippets = readdirSync(snippetDir)
		.filter((f) => /\.mdx?$/.test(f))
		.map((f) => ({
			collection: "snippet" as const,
			slug: basename(f).replace(/\.mdx?$/, ""),
			dir: snippetDir,
			file: join(snippetDir, f),
		}));
	return [...posts, ...snippets].sort((a, b) => a.slug.localeCompare(b.slug));
}

export function convertAll(contentRoot: string): { published: Converted[]; drafts: string[] } {
	const all = loadSources(contentRoot).map((s) => convert(s, readFileSync(s.file, "utf8")));
	return {
		published: all.filter((c) => !c.draft),
		drafts: all.filter((c) => c.draft).map((c) => c.slug),
	};
}

export function imageRefs(doc: Converted): { posts: string[]; diagrams: string[] } {
	const posts = new Set<string>();
	const diagrams = new Set<string>();
	if (doc.coverImage) posts.add(doc.coverImage.src);
	const visit = (blocks: Block[]) => {
		for (const block of blocks) {
			if (block._type === "image") (block.diagram ? diagrams : posts).add(block.src);
			if (block._type === "admonition" || block._type === "footer") visit(block.body);
		}
	};
	visit(doc.body);
	return { posts: [...posts], diagrams: [...diagrams] };
}

function parseFrontmatter(raw: string, source: SourceFile) {
	const fm = parseYaml(raw, { schema: "core" });
	if (typeof fm?.title !== "string") throw new Error(`${source.file}: title missing`);
	const meta: Omit<Converted, "collection" | "slug" | "body"> = {
		title: fm.title,
		description: typeof fm.description === "string" ? fm.description : "",
		tags: [...new Set<string>((fm.tags ?? []).map((t: string) => t.toLowerCase()))],
		publishDate: toIso(fm.publishDate, source.file),
		draft: fm.draft === true,
	};
	if (fm.updatedDate) meta.updatedDate = toIso(fm.updatedDate, source.file);
	if (fm.coverImage) {
		meta.coverImage = { src: relativePath(fm.coverImage.src), alt: String(fm.coverImage.alt) };
	}
	if (typeof fm.lang === "string") meta.lang = fm.lang;
	return meta;
}

function toIso(value: unknown, file: string): string {
	const date = /\d{4}-\d\d-\d\dT/.test(String(value))
		? new Date(String(value))
		: new Date(`${String(value)} UTC`);
	if (Number.isNaN(date.getTime())) throw new Error(`${file}: unparseable date "${value}"`);
	return date.toISOString();
}

function relativePath(src: string): string {
	return normalize(src).replace(/^\.\//, "");
}

function parseBody(text: string, mdx: boolean): Root {
	const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective);
	return (mdx ? processor.use(remarkMdx) : processor).parse(text);
}

type Inline = { children: Span[]; markDefs: MarkDef[] };

class Walker {
	private key = 0;
	private diagrams = 0;
	private kbdDepth = 0;
	private footnotes = new Map<string, string>();
	private imports = new Map<string, string>();

	constructor(private source: SourceFile) {}

	blocks(nodes: RootContent[]): Block[] {
		for (const node of nodes) {
			if (node.type === "footnoteDefinition") {
				this.footnotes.set(node.identifier, nodeText(node).trim());
			}
			if (node.type === "mdxjsEsm") {
				for (const [, name, path] of node.value.matchAll(MDX_IMPORT)) {
					if (name && path) this.imports.set(name, path);
				}
			}
		}
		return nodes.flatMap((node) => this.block(node));
	}

	private nextKey(): string {
		return `k${this.key++}`;
	}

	private block(node: RootContent, list?: { kind: "bullet" | "number"; level: number }): Block[] {
		switch (node.type) {
			case "heading":
				return this.textBlocks(node.children, HEADINGS[node.depth - 1] ?? "h6");
			case "paragraph":
				return this.textBlocks(node.children, "normal", list);
			case "blockquote":
				return node.children.flatMap((child) =>
					child.type === "paragraph"
						? this.textBlocks(child.children, "blockquote")
						: this.block(child),
				);
			case "list":
				return this.list(node, list?.level ?? -1);
			case "code":
				return [this.code(node.lang ?? "", node.meta ?? undefined, node.value)];
			case "table":
				return [this.table(node)];
			case "thematicBreak":
				return [{ _type: "break", _key: this.nextKey() }];
			case "containerDirective":
				return [this.admonition(node)];
			case "footnoteDefinition":
			case "mdxjsEsm":
				return [];
			case "html":
				return [this.iframe(node.value)];
			case "mdxJsxFlowElement":
				return this.jsx(node);
			default:
				throw new Error(`${this.source.file}: unsupported node "${node.type}"`);
		}
	}

	private list(node: List, level: number): Block[] {
		const kind = node.ordered ? "number" : "bullet";
		return node.children.flatMap((item) => this.listItem(item, { kind, level: level + 1 }));
	}

	private listItem(item: ListItem, list: { kind: "bullet" | "number"; level: number }): Block[] {
		let first = true;
		return item.children.flatMap((child) => {
			if (child.type === "list") return this.list(child, list.level);
			if (child.type === "paragraph" && first) {
				first = false;
				return this.textBlocks(child.children, "normal", list);
			}
			return this.block(child);
		});
	}

	private textBlocks(
		nodes: PhrasingContent[],
		style: TextBlock["style"],
		list?: { kind: "bullet" | "number"; level: number },
	): Block[] {
		const out: Block[] = [];
		let current = this.emptyInline();
		const flush = () => {
			if (current.children.length === 0) return;
			const block: TextBlock = { _type: "block", _key: this.nextKey(), style, ...current };
			if (list) {
				block.listItem = list.kind;
				block.level = list.level + 1;
			}
			out.push(block);
			current = this.emptyInline();
		};
		for (const node of nodes) {
			if (node.type === "image") {
				flush();
				out.push(this.image(node.url, node.alt ?? ""));
				continue;
			}
			this.inline(node, [], current);
		}
		flush();
		return out;
	}

	private emptyInline(): Inline {
		return { children: [], markDefs: [] };
	}

	private inline(node: PhrasingContent, marks: string[], into: Inline): void {
		switch (node.type) {
			case "text":
				this.span(node.value, marks, into);
				break;
			case "inlineCode":
				this.span(node.value, [...marks, "code"], into);
				break;
			case "break":
				this.span("\n", marks, into);
				break;
			case "strong":
				this.inlineAll(node.children, [...marks, "strong"], into);
				break;
			case "emphasis":
				this.inlineAll(node.children, [...marks, "em"], into);
				break;
			case "delete":
				this.inlineAll(node.children, [...marks, "strike-through"], into);
				break;
			case "link": {
				const key = this.nextKey();
				into.markDefs.push({ _type: "link", _key: key, href: node.url });
				this.inlineAll(node.children, [...marks, key], into);
				break;
			}
			case "footnoteReference": {
				const text = this.footnotes.get(node.identifier);
				if (text === undefined) {
					throw new Error(`${this.source.file}: footnote "${node.identifier}" has no definition`);
				}
				const key = this.nextKey();
				into.markDefs.push({ _type: "footnote", _key: key, text });
				this.span(`[${node.identifier}]`, [...marks, key], into);
				break;
			}
			case "html":
				this.kbdTag(node.value);
				break;
			case "textDirective":
				this.span(`:${node.name}${nodeText(node)}`, marks, into);
				break;
			default:
				throw new Error(`${this.source.file}: unsupported inline "${node.type}"`);
		}
	}

	private inlineAll(nodes: PhrasingContent[], marks: string[], into: Inline): void {
		for (const node of nodes) this.inline(node, marks, into);
	}

	private kbdTag(html: string): void {
		if (html === "<kbd>") this.kbdDepth++;
		else if (html === "</kbd>") this.kbdDepth--;
		else throw new Error(`${this.source.file}: unsupported inline html ${html}`);
	}

	private iframe(html: string): IframeBlock {
		const open = /^<iframe\s([^>]*)>\s*<\/iframe>$/.exec(html.trim());
		if (!open?.[1]) throw new Error(`${this.source.file}: unsupported html ${html.slice(0, 40)}`);
		const attrs = new Map<string, string>();
		for (const [, name, value] of open[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
			if (name) attrs.set(name.toLowerCase(), value ?? "");
		}
		const src = attrs.get("src");
		if (!src?.startsWith("https://"))
			throw new Error(`${this.source.file}: iframe needs an https src`);
		const size = (name: string) => {
			const value = Number(attrs.get(name));
			return Number.isInteger(value) && value > 0 ? value : undefined;
		};
		const width = size("width");
		const height = size("height");
		return {
			_type: "iframe",
			_key: this.nextKey(),
			src,
			title: attrs.get("title") ?? `Embedded content from ${new URL(src).hostname}`,
			...(width && { width }),
			...(height && { height }),
			...(attrs.has("allowfullscreen") && { allowFullscreen: true as const }),
		};
	}

	private span(text: string, marks: string[], into: Inline): void {
		const all = this.kbdDepth > 0 ? [...marks, "code"] : marks;
		into.children.push({ _type: "span", _key: this.nextKey(), text, marks: all });
	}

	private image(src: string, alt: string): ImageBlock {
		return { _type: "image", _key: this.nextKey(), src: relativePath(src), alt };
	}

	private code(language: string, meta: string | undefined, code: string): Block {
		if (language === "mermaid") {
			this.diagrams += 1;
			return {
				_type: "image",
				_key: this.nextKey(),
				src: `${this.source.slug}-${this.diagrams}.png`,
				alt: code,
				diagram: true,
			};
		}
		const block: CodeBlock = { _type: "code", _key: this.nextKey(), language, code };
		if (meta) block.meta = meta;
		return block;
	}

	private table(node: Table): TableBlock {
		return {
			_type: "table",
			_key: this.nextKey(),
			rows: node.children.map((row) => ({
				_key: this.nextKey(),
				cells: row.children.map((cell) => {
					const inline = this.emptyInline();
					this.inlineAll(cell.children, [], inline);
					return { _type: "block", _key: this.nextKey(), style: "normal", ...inline };
				}),
			})),
		};
	}

	private admonition(node: Extract<Nodes, { type: "containerDirective" }>): AdmonitionBlock {
		if (!ADMONITIONS.has(node.name)) {
			throw new Error(`${this.source.file}: unknown directive ":::${node.name}"`);
		}
		const [first, ...rest] = node.children;
		const hasTitle = first?.type === "paragraph" && first.data && "directiveLabel" in first.data;
		const children = hasTitle ? rest : node.children;
		const block: AdmonitionBlock = {
			_type: "admonition",
			_key: this.nextKey(),
			kind: node.name,
			body: children.flatMap((child) => this.block(child)),
		};
		if (hasTitle) block.title = nodeText(first);
		return block;
	}

	private jsx(node: Extract<Nodes, { type: "mdxJsxFlowElement" }>): Block[] {
		if (node.name === "footer") {
			return [
				{
					_type: "footer",
					_key: this.nextKey(),
					body: node.children.flatMap((child) => this.block(child as RootContent)),
				},
			];
		}
		if (node.name !== "Image") {
			throw new Error(`${this.source.file}: unsupported JSX <${node.name}>`);
		}
		const attr = (name: string) => {
			const found = node.attributes.find((a) => a.type === "mdxJsxAttribute" && a.name === name);
			if (!found || found.type !== "mdxJsxAttribute") return "";
			return typeof found.value === "string" ? found.value : (found.value?.value ?? "");
		};
		const src = this.imports.get(attr("src"));
		if (!src) throw new Error(`${this.source.file}: <Image> src "${attr("src")}" has no import`);
		return [this.image(src, attr("alt"))];
	}
}
