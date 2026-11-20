import type { APIContext } from "astro";
import { html } from "satori-html";
import { __unsafeHTML } from "ultrahtml";
import { getPost } from "@/data/post";
import { siteConfig } from "@/site.config";
import { brandMarkMarkup } from "@/utils/brand-mark";
import { getFormattedDate } from "@/utils/date";
import { renderOgPng } from "@/utils/satori-options";

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

const CACHE_CONTROL = "public, max-age=86400, s-maxage=604800";

export async function GET(context: APIContext) {
	const post = await getPost(context.params.slug ?? "");
	if (!post) return new Response(null, { status: 404 });
	const { title } = post.data;

	const postDate = getFormattedDate(post.data.updatedDate ?? post.data.publishDate, {
		month: "long",
		weekday: "long",
	});
	return new Response(await renderOgPng(markup(title, postDate)), {
		headers: {
			"Cache-Control": CACHE_CONTROL,
			"Content-Type": "image/png",
		},
	});
}
