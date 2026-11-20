import rss from "@astrojs/rss";
import { getAllSnippets } from "@/data/snippet";
import { siteConfig } from "@/site.config";

export const GET = async () => {
	const snippets = await getAllSnippets();

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
