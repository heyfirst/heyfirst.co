import {
	extractPlainText,
	type PluginContentItem,
	type PortableTextBlock,
	type TaxonomyTermInfo,
} from "emdash";
import type { IndexEntry } from "./resync";

export const SEARCHED_COLLECTIONS = ["post", "snippet"] as const;

export function toIndexEntry(
	collection: string,
	item: PluginContentItem,
	terms: Pick<TaxonomyTermInfo, "slug" | "label">[],
): IndexEntry | null {
	if (item.status !== "published" || !item.slug) return null;
	const { title, description, body, publish_date: publishDate } = item.data;
	return {
		collection,
		entryId: item.id,
		slug: item.slug,
		title: String(title ?? ""),
		description: String(description ?? ""),
		body: Array.isArray(body) ? extractPlainText(body as PortableTextBlock[]) : "",
		tags: terms.map(({ slug, label }) => ({ slug, label })),
		publishedAt: publishDate ? new Date(String(publishDate)) : null,
	};
}
