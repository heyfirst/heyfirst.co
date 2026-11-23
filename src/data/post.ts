import {
	extractPlainText,
	getEmDashCollection,
	getEmDashEntry,
	getTermsForEntries,
	type PortableTextBlock,
} from "emdash";
import readingTime from "reading-time";
import { paginate } from "@/utils/paginate";
import { type ContentImage, type DbEntry, type Entry, type Row, toDate } from "./entry";

type PostFields = {
	title: string;
	description: string;
	publish_date: string;
	updated_date?: string | null;
	body?: PortableTextBlock[] | null;
	og_image?: string | null;
	cover_image?: ContentImage | null;
};

export type PostTag = { slug: string; label: string };

export type PostData = {
	title: string;
	description: string;
	publishDate: Date;
	updatedDate: Date | undefined;
	tags: PostTag[];
	ogImage: string | undefined;
	coverImage: ContentImage | undefined;
};

export type Post = Entry<PostData> & { entryId: string; body: PortableTextBlock[] };

async function toPosts(entries: DbEntry<PostFields>[]): Promise<Post[]> {
	const terms = await getTermsForEntries(
		"post",
		entries.map((entry) => entry.data.id),
		"tag",
	);
	return entries.map(({ id, data }) => ({
		id,
		entryId: data.id,
		body: data.body ?? [],
		data: {
			title: data.title,
			description: data.description,
			publishDate: new Date(data.publish_date),
			updatedDate: toDate(data.updated_date),
			tags: (terms.get(data.id) ?? []).map(({ slug, label }) => ({ slug, label })),
			ogImage: data.og_image ?? undefined,
			coverImage: data.cover_image ?? undefined,
		},
	}));
}

export async function getAllPosts(): Promise<Post[]> {
	const { entries, error } = await getEmDashCollection<"post", Row<PostFields>>("post", {
		status: "published",
		orderBy: { publish_date: "desc" },
	});
	if (error) throw error;
	return toPosts(entries);
}

export async function getPost(slug: string): Promise<Post | null> {
	const { entry, error } = await getEmDashEntry<"post", Row<PostFields>>("post", slug);
	if (error) throw error;
	if (entry?.data.status !== "published") return null;
	const [post] = await toPosts([entry]);
	return post ?? null;
}

export function getReadingTime(body: PortableTextBlock[]): string {
	return readingTime(extractPlainText(body)).text;
}

/** groups posts by year (based on publishDate), using the year as the key */
export function groupPostsByYear(posts: Post[]) {
	return posts.reduce<Record<string, Post[]>>((acc, post) => {
		const year = post.data.publishDate.getFullYear();
		if (!acc[year]) {
			acc[year] = [];
		}
		acc[year]?.push(post);
		return acc;
	}, {});
}

/** returns a count of each unique tag, most used first */
export function getUniqueTagsWithCount(posts: Post[]): [PostTag, number][] {
	const counts = new Map<string, [PostTag, number]>();
	for (const tag of posts.flatMap((post) => post.data.tags)) {
		const [, count] = counts.get(tag.slug) ?? [tag, 0];
		counts.set(tag.slug, [tag, count + 1]);
	}
	return [...counts.values()].sort((a, b) => b[1] - a[1]);
}

/** old URLs used the tag label (`/tags/software development/`); new ones use the slug */
export function findTag(tags: PostTag[], param: string): PostTag | undefined {
	const wanted = param.toLowerCase();
	return (
		tags.find((tag) => tag.slug === param) ?? tags.find((tag) => tag.label.toLowerCase() === wanted)
	);
}

const MAX_INDEX_TAGS = 7;

export async function getPostsPage(pageNumber: number, tagParam?: string) {
	const allPosts = await getAllPosts();
	const allTags = getUniqueTagsWithCount(allPosts).map(([tag]) => tag);
	const tag = tagParam ? findTag(allTags, tagParam) : undefined;
	if (tagParam && !tag) return null;
	const posts = tag
		? allPosts.filter((post) => post.data.tags.some((t) => t.slug === tag.slug))
		: allPosts;
	const page = paginate(posts, pageNumber, tag ? `/tags/${tag.slug}/` : "/posts/");
	if (!page) return null;
	return { page, tag, uniqueTags: allTags.slice(0, MAX_INDEX_TAGS) };
}
