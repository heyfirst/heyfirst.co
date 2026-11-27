import { siteConfig } from "@/site.config";
import { h, ogBrandMark, ogPngResponse } from "@/utils/satori-options";

const markup = h(
	"div",
	"flex flex-col w-full h-full bg-[#EFF1E7] text-[#22301A]",
	h(
		"div",
		"flex flex-col flex-1 w-full p-10 justify-center",
		h("h1", "text-6xl font-bold leading-snug text-[#22301A]", siteConfig.title),
		h("p", "text-2xl mt-4 text-[#6B7A3A]", siteConfig.description),
	),
	h(
		"div",
		"flex items-center w-full p-10 border-t-4 border-[#2E6B41] text-xl",
		ogBrandMark,
		h("p", "ml-3 font-semibold", `by ${siteConfig.author}`),
	),
);

export async function GET() {
	return ogPngResponse(markup);
}
