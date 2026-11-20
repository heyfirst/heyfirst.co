import { expect, test } from "bun:test";
import { checkEnv, parseEnv } from "../scripts/check-env";

const example = parseEnv(`
# comment
A=
B=default # needed
C= # optional
PROXY_HOST=
DEPLOY_STAGING_ORIGIN=
`);

test("names every empty key and skips an absent optional one", () => {
	const actual = parseEnv("A=1\nB=\nPROXY_HOST=x.test\nDEPLOY_STAGING_ORIGIN=https://x.test");
	expect(checkEnv(example, actual)).toEqual(["B: empty"]);
});

test("a complete file passes", () => {
	const actual = parseEnv(
		'A=1\nB=2 # note\nC=\nPROXY_HOST=x.test\nDEPLOY_STAGING_ORIGIN="https://x.test"',
	);
	expect(checkEnv(example, actual)).toEqual([]);
});

test("the staging origin host must equal the proxy host", () => {
	const actual = parseEnv(
		"A=1\nB=2\nC=\nPROXY_HOST=one.test\nDEPLOY_STAGING_ORIGIN=https://two.test",
	);
	expect(checkEnv(example, actual)).toHaveLength(1);
});

test("problems never contain values", () => {
	const actual = parseEnv(
		"A=topsecret\nB=\nPROXY_HOST=x.test\nDEPLOY_STAGING_ORIGIN=https://x.test",
	);
	expect(checkEnv(example, actual).join("\n")).not.toContain("topsecret");
});

test("a missing required key is named", () => {
	const actual = parseEnv("B=2\nPROXY_HOST=x.test\nDEPLOY_STAGING_ORIGIN=https://x.test");
	expect(checkEnv(example, actual)).toEqual(["A: missing"]);
});
