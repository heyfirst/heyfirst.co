import { expect, test } from "bun:test";
import type { PortableTextBlock } from "emdash";
import { prepareBody } from "../src/data/body";

const heading = (key: string, style: string, text: string) => ({
	_type: "block",
	_key: key,
	style,
	children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
	markDefs: [],
});

const noted = (key: string, note: string) => ({
	_type: "block",
	_key: key,
	style: "normal",
	children: [{ _type: "span", _key: `${key}s`, text: "x", marks: [note] }],
	markDefs: [{ _type: "footnote", _key: note, text: `text of ${note}` }],
});

const body = (...blocks: object[]) => blocks as PortableTextBlock[];

test("duplicate headings get -2, -3 suffixes in document order", () => {
	const { headings } = prepareBody(
		body(
			heading("a", "h2", "Summary"),
			heading("b", "h2", "Summary"),
			heading("c", "h3", "Summary"),
		),
	);
	expect(headings.map((h) => h.slug)).toEqual(["summary", "summary-2", "summary-3"]);
});

test("a heading with no slug-able text falls back, and h1 and h5 to h6 get ids", () => {
	const { body: out, headings } = prepareBody(
		body(heading("a", "h1", "!!!"), heading("b", "h5", "Deep"), heading("c", "h6", "")),
	);
	expect(headings.map((h) => [h.depth, h.slug])).toEqual([
		[1, "heading"],
		[5, "deep"],
		[6, "heading-2"],
	]);
	expect(out.map((block) => (block as { headingId?: string }).headingId)).toEqual([
		"heading",
		"deep",
		"heading-2",
	]);
});

test("headings nested in custom blocks are numbered with the rest of the document", () => {
	const footer = { _type: "footer", _key: "f", body: [heading("n", "h2", "Notes")] };
	const { headings } = prepareBody(body(heading("a", "h2", "Notes"), footer));
	expect(headings.map((h) => h.slug)).toEqual(["notes", "notes-2"]);
});

test("footnote ids are unique per scope", () => {
	const first = prepareBody(body(noted("p", "k1")), "one");
	const second = prepareBody(body(noted("p", "k1")), "two");
	expect(first.footnotes).toEqual([{ id: "one-k1", text: "text of k1" }]);
	expect(second.footnotes).toEqual([{ id: "two-k1", text: "text of k1" }]);
	expect(prepareBody(body(noted("p", "k1"))).footnotes[0]?.id).toBe("k1");
});

test("the input body is not mutated", () => {
	const input = body(heading("a", "h2", "Same"), noted("p", "k1"));
	const before = JSON.stringify(input);
	prepareBody(input, "s");
	expect(JSON.stringify(input)).toBe(before);
});

test("quotes curl in prose across mark boundaries, and inline code is left alone", () => {
	const block = {
		_type: "block",
		_key: "a",
		style: "normal",
		markDefs: [],
		children: [
			{ _type: "span", _key: "1", text: 'She said "it', marks: [] },
			{ _type: "span", _key: "2", text: "'s fine", marks: ["strong"] },
			{ _type: "span", _key: "3", text: '"', marks: [] },
			{ _type: "span", _key: "4", text: "don't 'x'\nnext...", marks: ["code"] },
			{ _type: "span", _key: "5", text: " the '90s and\nmore", marks: [] },
		],
	};
	const { body: out } = prepareBody(body(block));
	const texts = (out[0] as unknown as { children: { text: string }[] }).children.map((c) => c.text);
	expect(texts).toEqual([
		"She said “it",
		"’s fine",
		"”",
		"don't 'x'\nnext...",
		" the ’90s and more",
	]);
});
