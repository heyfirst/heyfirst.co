import { html } from "satori-html";
import { siteConfig } from "@/site.config";
import { ogBrandMark, ogPngResponse } from "@/utils/satori-options";

const markup = html`<div tw="flex flex-col w-full h-full bg-[#EFF1E7] text-[#22301A]">
	<div tw="flex flex-col flex-1 w-full p-10 justify-center">
		<h1 tw="text-6xl font-bold leading-snug text-[#22301A]">${siteConfig.title}</h1>
		<p tw="text-2xl mt-4 text-[#6B7A3A]">${siteConfig.description}</p>
	</div>
	<div tw="flex items-center w-full p-10 border-t-4 border-[#2E6B41] text-xl">
		${ogBrandMark}
		<p tw="ml-3 font-semibold">by ${siteConfig.author}</p>
	</div>
</div>`;

export async function GET() {
	return ogPngResponse(markup);
}
