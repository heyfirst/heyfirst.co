import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";
import satori, { type SatoriOptions } from "satori";
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

interface OgElement {
	type: string;
	props: {
		tw?: string;
		children?: OgChild | OgChild[] | undefined;
		src?: string;
		width?: number;
		height?: number;
	};
}
type OgChild = OgElement | string;

export function h(type: string, tw: string, ...children: OgChild[]): OgElement {
	return { type, props: { tw, children: children.length === 1 ? children[0] : children } };
}

/** satori accepts plain element objects at runtime but types its input as ReactNode. */
export async function renderOgPng(markup: OgElement): Promise<Uint8Array<ArrayBuffer>> {
	const svg = await satori(markup as unknown as ReactNode, ogOptions);
	return new Uint8Array(new Resvg(svg).render().asPng());
}

const brandMarkSvg = `<svg width="60" height="60" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">${brandMarkMarkup("ogSky")}</svg>`;

export const ogBrandMark: OgElement = {
	type: "img",
	props: {
		src: `data:image/svg+xml;base64,${Buffer.from(brandMarkSvg).toString("base64")}`,
		width: 60,
		height: 60,
	},
};

export async function ogPngResponse(markup: OgElement): Promise<Response> {
	return new Response(await renderOgPng(markup), {
		headers: {
			"Cache-Control": "public, max-age=86400, s-maxage=604800",
			"Content-Type": "image/png",
		},
	});
}
