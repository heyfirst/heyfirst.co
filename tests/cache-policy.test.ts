import { expect, test } from "bun:test";
import { htmlCacheControl } from "../src/utils/cache-policy";

const anonymous = { status: 200, setsCookie: false, hasSession: false, isPreview: false };

test("an anonymous 200 is cached at the edge for a minute", () => {
	expect(htmlCacheControl(anonymous)).toContain("s-maxage=60");
});

test("a cookie, a session or a preview render is never shared-cacheable", () => {
	for (const override of [{ setsCookie: true }, { hasSession: true }, { isPreview: true }]) {
		const value = htmlCacheControl({ ...anonymous, ...override });
		expect(value).toBe("private, no-store");
	}
});

test("a non-200 is not cached", () => {
	expect(htmlCacheControl({ ...anonymous, status: 404 })).toBe("no-store");
});
