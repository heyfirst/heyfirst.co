import { existsSync, readFileSync } from "node:fs";

type Entry = { value: string; optional: boolean };

const OPTIONAL_MARKER = /#\s*optional\b/;

export function parseEnv(text: string): Map<string, Entry> {
	const entries = new Map<string, Entry>();
	for (const line of text.split("\n")) {
		const match = line.match(/^\s*([A-Z][A-Z0-9_]*)=(.*)$/);
		if (!match) continue;
		const [, key = "", rest = ""] = match;
		const value = rest
			.replace(/\s+#.*$/, "")
			.trim()
			.replace(/^(['"])(.*)\1$/, "$2");
		entries.set(key, { value, optional: OPTIONAL_MARKER.test(rest) });
	}
	return entries;
}

function hostOf(value: string): string | undefined {
	try {
		return new URL(value.includes("://") ? value : `https://${value}`).hostname;
	} catch {
		return undefined;
	}
}

// Names only, never values: the output is pasted into terminals and logs.
export function checkEnv(example: Map<string, Entry>, actual: Map<string, Entry>): string[] {
	const problems: string[] = [];
	for (const [key, wanted] of example) {
		if (wanted.optional) continue;
		const have = actual.get(key);
		if (!have) {
			problems.push(`${key}: missing`);
		} else if (!have.value) {
			problems.push(`${key}: empty`);
		}
	}
	const proxyHost = actual.get("PROXY_HOST")?.value;
	const stagingOrigin = actual.get("DEPLOY_STAGING_ORIGIN")?.value;
	if (proxyHost && stagingOrigin && hostOf(stagingOrigin) !== hostOf(proxyHost)) {
		problems.push(
			"DEPLOY_STAGING_ORIGIN: its host must equal PROXY_HOST (passkeys are bound to it)",
		);
	}
	return problems;
}

if (import.meta.main) {
	const [envPath = ".env", examplePath = ".env.example"] = process.argv.slice(2);
	if (!existsSync(envPath)) {
		console.error(`env:check: ${envPath} not found; copy ${examplePath} and fill it in`);
		process.exit(1);
	}
	const problems = checkEnv(
		parseEnv(readFileSync(examplePath, "utf8")),
		parseEnv(readFileSync(envPath, "utf8")),
	);
	if (problems.length > 0) {
		console.error(`env:check: ${envPath} does not match ${examplePath}`);
		for (const problem of problems) console.error(`  ${problem}`);
		process.exit(1);
	}
	console.log(`env:check: ${envPath} has every key from ${examplePath}`);
}
