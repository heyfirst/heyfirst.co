import { getCollection } from "astro:content";
import { siteConfig } from "@/site.config";
import rss from "@astrojs/rss";

export const GET = async () => {
	const snippets = await getCollection("snippet");

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: snippets.map((snippet) => ({
			title: snippet.data.title,
			pubDate: snippet.data.publishDate,
			link: `snippets/${snippet.id}/`,
		})),
	});
};
