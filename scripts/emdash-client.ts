import { EmDashApiError, EmDashClient } from "emdash/client";

export type Connection = { client: EmDashClient; baseUrl: string; token: string };

export function connect(env: Record<string, string | undefined>): Connection {
	const baseUrl = env.EMDASH_URL;
	const token = env.EMDASH_TOKEN;
	if (!baseUrl || !token) throw new Error("EMDASH_URL and EMDASH_TOKEN must be set");
	return {
		client: new EmDashClient({ baseUrl, token }),
		baseUrl: baseUrl.replace(/\/$/, ""),
		token,
	};
}

export async function findEntry(client: EmDashClient, collection: string, slug: string) {
	try {
		return await client.get(collection, slug, { raw: true });
	} catch (error) {
		if (error instanceof EmDashApiError && error.status === 404) return null;
		throw error;
	}
}

type TermsResponse = { data: { terms: { id: string; slug: string }[] } };

function termsUrl(conn: Connection, collection: string, id: string): string {
	return `${conn.baseUrl}/_emdash/api/content/${collection}/${id}/terms/tag`;
}

async function termsRequest(conn: Connection, url: string, init: RequestInit = {}) {
	const response = await fetch(url, {
		...init,
		headers: { Authorization: `Bearer ${conn.token}`, "Content-Type": "application/json" },
	});
	if (!response.ok) throw new Error(`${init.method ?? "GET"} ${url} -> ${response.status}`);
	return (await response.json()) as TermsResponse;
}

export async function entryTagSlugs(conn: Connection, collection: string, id: string) {
	const { data } = await termsRequest(conn, termsUrl(conn, collection, id));
	return data.terms.map((term) => term.slug).sort();
}

export async function setEntryTags(
	conn: Connection,
	collection: string,
	id: string,
	termIds: string[],
) {
	await termsRequest(conn, termsUrl(conn, collection, id), {
		method: "POST",
		body: JSON.stringify({ termIds }),
	});
}

export function slugify(label: string): string {
	return label
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}
