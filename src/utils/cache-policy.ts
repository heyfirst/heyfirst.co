// A resized image is named by its source and size, so Cloudflare may keep it for a month and a
// browser for a day. EmDash only revalidates because it cannot purge on Replace original here.
const IMAGE_VARIANT_CACHE = "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400";
const PUBLIC_HTML_CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

type Render = {
	status: number;
	setsCookie: boolean;
	hasSession: boolean;
	isPreview: boolean;
};

/** The default Cache-Control for an HTML GET whose route did not set one. */
export function htmlCacheControl({ status, setsCookie, hasSession, isPreview }: Render): string {
	if (setsCookie || hasSession || isPreview) return "private, no-store";
	return status === 200 ? PUBLIC_HTML_CACHE : "no-store";
}

/** The Cache-Control for a resized image from /_image, or undefined for any other response. */
export function imageCacheControl(pathname: string, status: number): string | undefined {
	return pathname === "/_image" && status === 200 ? IMAGE_VARIANT_CACHE : undefined;
}
