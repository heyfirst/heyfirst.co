import { getEmDashCollection, getEmDashEntry, type PortableTextBlock } from "emdash";
import type { DbEntry, Entry, Row } from "./entry";

type SnippetFields = {
	title: string;
	publish_date: string;
	description?: string | null;
	lang?: string | null;
	body?: PortableTextBlock[] | null;
};

export type SnippetData = {
	title: string;
	publishDate: Date;
	description: string | undefined;
	lang: string | undefined;
};

export type Snippet = Entry<SnippetData> & { body: PortableTextBlock[] };

function toSnippet({ id, data }: DbEntry<SnippetFields>): Snippet {
	return {
		id,
		body: data.body ?? [],
		data: {
			title: data.title,
			publishDate: new Date(data.publish_date),
			description: data.description || undefined,
			lang: data.lang || undefined,
		},
	};
}

export async function getAllSnippets(): Promise<Snippet[]> {
	const { entries, error } = await getEmDashCollection<"snippet", Row<SnippetFields>>("snippet", {
		status: "published",
		orderBy: { publish_date: "desc" },
	});
	if (error) throw error;
	return entries.map(toSnippet);
}

export async function getSnippet(slug: string): Promise<Snippet | null> {
	const { entry, error } = await getEmDashEntry<"snippet", Row<SnippetFields>>("snippet", slug);
	if (error) throw error;
	return entry?.data.status === "published" ? toSnippet(entry) : null;
}
