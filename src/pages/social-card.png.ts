import { html } from "satori-html";
import { __unsafeHTML } from "ultrahtml";
import { siteConfig } from "@/site.config";
import { brandMarkMarkup } from "@/utils/brand-mark";
import { renderOgPng } from "@/utils/satori-options";

const brandMark = __unsafeHTML(
	`<svg width="60" height="60" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">${brandMarkMarkup("ogSky")}</svg>`,
);

const markup = html`<div tw="flex flex-col w-full h-full bg-[#EFF1E7] text-[#22301A]">
	<div tw="flex flex-col flex-1 w-full p-10 justify-center">
		<h1 tw="text-6xl font-bold leading-snug text-[#22301A]">${siteConfig.title}</h1>
		<p tw="text-2xl mt-4 text-[#6B7A3A]">${siteConfig.description}</p>
	</div>
	<div tw="flex items-center w-full p-10 border-t-4 border-[#2E6B41] text-xl">
		${brandMark}
		<p tw="ml-3 font-semibold">by ${siteConfig.author}</p>
	</div>
</div>`;

export async function GET() {
	return new Response(await renderOgPng(markup), {
		headers: {
			"Cache-Control": "public, max-age=86400, s-maxage=604800",
			"Content-Type": "image/png",
		},
	});
}
