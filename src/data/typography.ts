const OPENS_AFTER = /[\s([{–—‘“-]/;

function isOpening(prev: string): boolean {
	return prev === "" || OPENS_AFTER.test(prev);
}

/** Curls quotes and ellipses, and turns soft line breaks into spaces. `prev` is the character before `text`. */
export function smarten(text: string, prev = ""): string {
	const source = text.replace(/\s*\n\s*/g, " ").replace(/\.\.\./g, "…");
	let out = "";
	for (let i = 0; i < source.length; i++) {
		const char = source[i] as string;
		const before = i === 0 ? prev : (source[i - 1] as string);
		const after = source[i + 1] ?? "";
		if (char === '"') {
			out += isOpening(before) ? "“" : "”";
		} else if (char === "'") {
			const opens = isOpening(before) && !/^\d/.test(after);
			out += opens ? "‘" : "’";
		} else {
			out += char;
		}
	}
	return out;
}
