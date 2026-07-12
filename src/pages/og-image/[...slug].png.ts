import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { brandMarkMarkup } from "@/utils/brand-mark";
import { getFormattedDate } from "@/utils/date";
import { ogOptions } from "@/utils/satori-options";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori from "satori";
import { html } from "satori-html";
import { __unsafeHTML } from "ultrahtml";

const brandMark = __unsafeHTML(
	`<svg width="60" height="60" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">${brandMarkMarkup("ogSky")}</svg>`,
);

const markup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#EFF1E7] text-[#22301A] p-16">
			<div tw="flex flex-col flex-1 w-full justify-center">
				<p tw="text-2xl mb-6 text-[#6B7A3A]">${pubDate}</p>
				<h1 tw="text-6xl font-bold leading-snug text-[#22301A]">${title}</h1>
			</div>
			<div tw="flex items-center justify-between w-full pt-10 border-t-4 border-[#2E6B41] text-xl">
				<div tw="flex items-center">
					${brandMark}
					<p tw="ml-3 font-semibold">${siteConfig.title}</p>
				</div>
				<p>by ${siteConfig.author}</p>
			</div>
		</div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title } = context.props as Props;

	const postDate = getFormattedDate(pubDate, {
		month: "long",
		weekday: "long",
	});
	const svg = await satori(markup(title, postDate), ogOptions);
	const png = new Resvg(svg).render().asPng();
	return new Response(new Uint8Array(png), {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.id },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}));
}
