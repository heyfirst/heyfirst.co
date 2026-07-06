export const beanGeometry = {
	ellipse: { cx: 50, cy: 66, rx: 26, ry: 21 },
	stem: "M50 48 C 43 58, 57 74, 50 85",
	neck: "M50 50 C 50 42, 50 38, 50 32",
	leafLeft: "M50 40 C 41 39, 33 31, 37 22 C 47 24, 50 32, 50 40 Z",
	leafRight: "M50 38 C 59 37, 67 29, 63 20 C 53 22, 50 30, 50 38 Z",
};

const brandGradientStops = [
	{ offset: "0", color: "#5FA96E" },
	{ offset: "0.5", color: "#6E7C36" },
	{ offset: "1", color: "#33291B" },
];

interface BrandMarkOptions {
	clipId?: string;
	cornerRadius?: number;
	includeTint?: boolean;
}

// Shared geometry for the "First" gradient-tile bean mark, consumed by Logo.astro and by the
// Satori-rendered og-image/social-card routes (which can't render Astro components directly).
export function brandMarkMarkup(gradientId: string, options: BrandMarkOptions = {}): string {
	const { clipId, cornerRadius = 60, includeTint = false } = options;
	const { ellipse, stem, neck, leafLeft, leafRight } = beanGeometry;

	const gradient = `<linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">${brandGradientStops
		.map((stop) => `<stop offset="${stop.offset}" stop-color="${stop.color}"></stop>`)
		.join("")}</linearGradient>`;
	const clip = clipId
		? `<clipPath id="${clipId}"><rect x="8" y="8" width="224" height="224" rx="${cornerRadius}" /></clipPath>`
		: "";
	const tint =
		includeTint && clipId
			? `<g clip-path="url(#${clipId})">
					<ellipse cx="120" cy="26" rx="150" ry="70" fill="#CFE0A8" opacity="0.28"></ellipse>
					<ellipse cx="120" cy="240" rx="150" ry="82" fill="#241D12" opacity="0.4"></ellipse>
				</g>`
			: "";

	return `<defs>${gradient}${clip}</defs>
<rect x="8" y="8" width="224" height="224" rx="${cornerRadius}" fill="url(#${gradientId})"></rect>
${tint}
<g transform="translate(59,50) scale(1.24)">
	<ellipse cx="${ellipse.cx}" cy="${ellipse.cy}" rx="${ellipse.rx}" ry="${ellipse.ry}" fill="#F1F0E4"></ellipse>
	<path d="${stem}" fill="none" stroke="#A9B77F" stroke-width="4" stroke-linecap="round"></path>
	<path d="${neck}" fill="none" stroke="#F1F0E4" stroke-width="4" stroke-linecap="round"></path>
	<path d="${leafLeft}" fill="#DCE8C4"></path>
	<path d="${leafRight}" fill="#F1F0E4"></path>
</g>`;
}
