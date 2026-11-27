import { expect, test } from "bun:test";
import { htmlCacheControl, imageCacheControl } from "../src/utils/cache-policy";

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

test("a resized image from /_image is shared-cacheable for a month", () => {
	const value = imageCacheControl("/_image", 200);
	expect(value).toContain("s-maxage=2592000");
	expect(value).not.toContain("must-revalidate");
});

test("only a 200 from /_image gets the image policy", () => {
	expect(imageCacheControl("/_image", 304)).toBeUndefined();
	expect(imageCacheControl("/_image", 404)).toBeUndefined();
	expect(imageCacheControl("/posts/x", 200)).toBeUndefined();
});
