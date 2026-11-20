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
