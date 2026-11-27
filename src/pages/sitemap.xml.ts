import type { APIRoute } from "astro";
import { getAllPosts, getUniqueTagsWithCount } from "@/data/post";
import { getAllSnippets } from "@/data/snippet";
import { uncached } from "@/utils/uncached";

export const prerender = false;

const STATIC_PAGES = ["/", "/about/", "/posts/", "/snippets/", "/projects/", "/tags/"];

type Url = { path: string; lastmod: Date | undefined };

const escapeXml = (text: string) =>
	text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");

const latest = (dates: Date[]): Date | undefined =>
	dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : undefined;

const render = (origin: string, urls: Url[]) =>
	[
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls.map(({ path, lastmod }) =>
			[
				"  <url>",
				`    <loc>${escapeXml(`${origin}${path}`)}</loc>`,
				lastmod ? `    <lastmod>${lastmod.toISOString()}</lastmod>` : "",
				"  </url>",
			]
				.filter(Boolean)
				.join("\n"),
		),
		"</urlset>",
		"",
	].join("\n");

const sitemap: APIRoute = async ({ site }) => {
	if (!site) return new Response("<!-- site is not configured -->", { status: 500 });
	const [posts, snippets] = await Promise.all([getAllPosts(), getAllSnippets()]);
	const newest = latest([
		...posts.map((post) => post.data.updatedDate ?? post.data.publishDate),
		...snippets.map((snippet) => snippet.data.publishDate),
	]);
	const tagUrls = getUniqueTagsWithCount(posts).map(([tag]) => ({
		path: `/tags/${encodeURIComponent(tag.slug)}/`,
		lastmod: latest(
			posts
				.filter((post) => post.data.tags.some((item) => item.slug === tag.slug))
				.map((post) => post.data.updatedDate ?? post.data.publishDate),
		),
	}));
	const urls: Url[] = [
		...STATIC_PAGES.map((path) => ({ path, lastmod: newest })),
		...tagUrls,
		...posts.map((post) => ({
			path: `/posts/${post.id}/`,
			lastmod: post.data.updatedDate ?? post.data.publishDate,
		})),
		...snippets.map((snippet) => ({
			path: `/snippets/${snippet.id}/`,
			lastmod: snippet.data.publishDate,
		})),
	];
	return new Response(render(site.origin, urls), {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};

export const GET = uncached(sitemap);
