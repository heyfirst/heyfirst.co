import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";
import satori, { type SatoriOptions } from "satori";
import type { html } from "satori-html";
import { __unsafeHTML } from "ultrahtml";
import JetBrainsMonoBold from "@/assets/jetbrains-mono-700.ttf";
import JetBrainsMono from "@/assets/jetbrains-mono-regular.ttf";
import { brandMarkMarkup } from "@/utils/brand-mark";

export const ogOptions: SatoriOptions = {
	fonts: [
		{
			data: Buffer.from(JetBrainsMono),
			name: "JetBrains Mono",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.from(JetBrainsMonoBold),
			name: "JetBrains Mono",
			style: "normal",
			weight: 700,
		},
	],
	height: 630,
	width: 1200,
};

/** satori-html returns a VNode that satori accepts at runtime but types as ReactNode. */
export async function renderOgPng(
	markup: ReturnType<typeof html>,
): Promise<Uint8Array<ArrayBuffer>> {
	const svg = await satori(markup as unknown as ReactNode, ogOptions);
	return new Uint8Array(new Resvg(svg).render().asPng());
}

export const ogBrandMark = __unsafeHTML(
	`<svg width="60" height="60" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">${brandMarkMarkup("ogSky")}</svg>`,
);

export async function ogPngResponse(markup: ReturnType<typeof html>): Promise<Response> {
	return new Response(await renderOgPng(markup), {
		headers: {
			"Cache-Control": "public, max-age=86400, s-maxage=604800",
			"Content-Type": "image/png",
		},
	});
}
