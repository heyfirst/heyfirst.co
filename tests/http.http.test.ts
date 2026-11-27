import { afterAll, beforeAll, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { applySeed, type SeedFile } from "emdash";
import { createDialect } from "emdash/db/postgres";
import { Kysely } from "kysely";
import { seedSample } from "../scripts/seed-sample";
import baseSeed from "../seed/seed.json";

const adminUrl = process.env.DATABASE_URL;
const root = join(import.meta.dir, "..");
const BUILD_INPUTS = ["src", "public", "seed", "scripts"];
const BUILD_FILES = [
	"astro.config.ts",
	"package.json",
	"bun.lock",
	"tsconfig.json",
	"tailwind.config.ts",
	"emdash-env.d.ts",
];

// The build bakes in DATABASE_URL and SITE_URL, so the database name and the port come from the
// input hash too: an unchanged tree reuses dist/http-test-<hash>, any source change rebuilds.
function inputsHash(): string {
	const hasher = new Bun.CryptoHasher("sha256");
	hasher.update(adminUrl ?? "");
	const paths = BUILD_INPUTS.flatMap((dir) =>
		[...new Bun.Glob("**/*").scanSync({ cwd: join(root, dir), onlyFiles: true })].map((f) =>
			join(dir, f),
		),
	);
	for (const path of [...paths, ...BUILD_FILES].sort()) {
		hasher.update(path);
		hasher.update(readFileSync(join(root, path)));
	}
	return hasher.digest("hex");
}

const hash = inputsHash();
const scratchName = `http_test_${hash.slice(0, 12)}`;
const port = 20000 + (Number.parseInt(hash.slice(0, 6), 16) % 20000);
let databaseUrl = "";
const outDir = join(root, "dist", `http-test-${hash.slice(0, 12)}`);
let origin = "";
let server: Bun.Subprocess | undefined;

async function runAsAdmin(statement: string): Promise<void> {
	const sql = new Bun.SQL(adminUrl ?? "");
	try {
		await sql.unsafe(statement);
	} finally {
		await sql.close();
	}
}

async function waitFor(url: string) {
	for (let attempt = 0; attempt < 100; attempt++) {
		try {
			await fetch(url);
			return;
		} catch {
			await Bun.sleep(100);
		}
	}
	throw new Error(`server did not answer at ${url}`);
}

beforeAll(async () => {
	if (!adminUrl) throw new Error("DATABASE_URL is not set; copy .env.example and start compose");
	await runAsAdmin(`DROP DATABASE IF EXISTS ${scratchName} WITH (FORCE)`);
	await runAsAdmin(`CREATE DATABASE ${scratchName}`);
	const scratchUrl = new URL(adminUrl);
	scratchUrl.pathname = `/${scratchName}`;
	databaseUrl = scratchUrl.href;
	origin = `http://127.0.0.1:${port}`;
	const env = {
		...process.env,
		DATABASE_URL: databaseUrl,
		SITE_URL: origin,
		UPLOADS_DIR: join(outDir, "uploads"),
		HOST: "127.0.0.1",
		PORT: String(port),
	};
	if (!existsSync(join(outDir, "server/entry.mjs"))) {
		for (const stale of readdirSync(join(root, "dist")).filter((n) => n.startsWith("http-test-"))) {
			rmSync(join(root, "dist", stale), { recursive: true, force: true });
		}
		const build = Bun.spawnSync(["bun", "--bun", "run", "build", "--outDir", outDir], {
			cwd: root,
			env,
		});
		if (!build.success) throw new Error(`build failed: ${build.stderr.toString()}`);
	}
	await seedSample(databaseUrl, "update");
	server = Bun.spawn(["bun", join(outDir, "server/entry.mjs")], { cwd: root, env });
	await waitFor(origin);
}, 180_000);

afterAll(async () => {
	server?.kill();
	await server?.exited;
	rmSync(join(outDir, "uploads"), { recursive: true, force: true });
	if (adminUrl) {
		await runAsAdmin(`DROP DATABASE IF EXISTS ${scratchName} WITH (FORCE)`);
	}
});

const get = (path: string) => fetch(origin + path, { redirect: "manual" });

test("a seeded post renders at /posts/<slug> with heading ids", async () => {
	const res = await get("/posts/hello-from-emdash");
	const html = await res.text();
	expect(res.status).toBe(200);
	expect(html).toContain("Hello from EmDash");
	expect(html).toContain(`<link rel="canonical" href="${origin}/posts/hello-from-emdash">`);
	expect(html).toContain('<h2 id="first-heading">');
	expect(html).toContain('<h2 id="first-heading-2">');
});

test("custom blocks render: admonition, code, table, footnote and footer", async () => {
	const html = await (await get("/posts/hello-from-emdash")).text();
	expect(html).toContain('data-admonition-type="tip"');
	expect(html).toContain("expressive-code");
	expect(html).toMatch(/<th>.*Name.*<\/th>/s);
	expect(html).toContain('href="#fn-f1"');
	expect(html).toContain('<li id="fn-f1">');
	const marker = html.match(/<sup class="footnote-ref">.*?<\/sup>/s)?.[0] ?? "";
	expect(marker.match(/\[1\]/g)).toHaveLength(1);
	expect(html).not.toMatch(/\[1\]<sup class="footnote-ref">/);
	expect(html).toContain('class="post-footer"');
});

test("/blog/<slug> redirects permanently to /posts/<slug>", async () => {
	const res = await get("/blog/hello-from-emdash");
	expect(res.status).toBe(301);
	expect(res.headers.get("location")).toBe("/posts/hello-from-emdash");
});

test("HTML carries the five security headers and a public cache header", async () => {
	for (const path of ["/", "/posts/hello-from-emdash"]) {
		const { headers } = await get(path);
		expect(headers.get("strict-transport-security")).toBe("max-age=31536000; includeSubDomains");
		expect(headers.get("x-content-type-options")).toBe("nosniff");
		expect(headers.get("x-frame-options")).toBe("DENY");
		expect(headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
		expect(headers.get("permissions-policy")).toContain("camera=()");
		expect(headers.get("cache-control")).toContain("s-maxage=60");
	}
});

test("the index lists the published post, snippet and project, not the draft", async () => {
	const html = await (await get("/")).text();
	expect(html).toContain("Hello from EmDash");
	expect(html).toContain("Hello snippet");
	expect(html).toContain("Sample project");
	expect(html).not.toContain("Unpublished draft");
});

test("robots.txt hides /_emdash/ and the sitemap names the real URLs", async () => {
	expect(await (await get("/robots.txt")).text()).toContain("Disallow: /_emdash/");
	const urls = await (await get("/sitemap.xml")).text();
	for (const path of [
		"/",
		"/about/",
		"/posts/",
		"/snippets/",
		"/tags/",
		"/tags/emdash/",
		"/posts/hello-from-emdash/",
	]) {
		expect(urls).toContain(`<loc>${origin}${path}</loc>`);
	}
	expect(urls).not.toContain("unpublished-draft");
});

test("the page carries the twitter site, creator and url tags", async () => {
	const html = await (await get("/posts/hello-from-emdash/")).text();
	expect(html).toContain('property="twitter:creator"');
	expect(html).toContain('property="twitter:site"');
	expect(html).toContain(`content="${origin}/posts/hello-from-emdash/" property="twitter:url"`);
});

test("the old sitemap URLs redirect permanently to /sitemap.xml", async () => {
	for (const path of ["/sitemap-index.xml", "/sitemap-0.xml"]) {
		const res = await fetch(`${origin}${path}`, { redirect: "manual" });
		expect(res.status).toBe(301);
		expect(res.headers.get("location")).toContain("/sitemap.xml");
	}
});

test("a heading links to its own anchor", async () => {
	const html = await (await get("/posts/hello-from-emdash/")).text();
	expect(html).toMatch(/<h2 id="([^"]+)"><a class="not-prose" href="#\1">/);
});

test("an unknown slug, a draft and an unknown tag are real, uncached 404s", async () => {
	for (const path of [
		"/posts/no-such-post",
		"/posts/unpublished-draft",
		"/tags/no-such-tag/",
		"/snippets/nope",
	]) {
		const res = await get(path);
		expect(res.status).toBe(404);
		expect(res.headers.get("cache-control")).toBe("no-store");
	}
});

test("tag pages and RSS render from EmDash", async () => {
	expect(await (await get("/tags/emdash/")).text()).toContain("Hello from EmDash");
	expect(await (await get("/rss.xml")).text()).toContain("hello-from-emdash");
});

test("the OG image and the social card are real PNGs", async () => {
	for (const path of ["/og-image/hello-from-emdash.png", "/social-card.png"]) {
		const res = await get(path);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toBe("image/png");
		expect(res.headers.get("cache-control")).toBe("public, max-age=86400, s-maxage=604800");
		expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(5_000);
	}
});

async function sitemapUrls() {
	const sitemap = await get("/sitemap.xml");
	expect(sitemap.headers.get("cache-control")).toBe("no-store");
	return sitemap.text();
}

test("a post published while the server runs is in the sitemap on the next request", async () => {
	const slug = `sitemap-live-${process.pid}`;
	expect(await sitemapUrls()).not.toContain(slug);
	const db = new Kysely<never>({ dialect: createDialect({ connectionString: databaseUrl }) });
	try {
		const live = {
			...baseSeed,
			content: {
				post: [
					{
						id: slug,
						slug,
						status: "published",
						data: {
							title: "Sitemap live",
							description: "Published while the server runs.",
							publish_date: "2026-02-01T09:00:00.000Z",
							body: [],
						},
					},
				],
			},
		};
		await applySeed(db as never, live as SeedFile, { includeContent: true, onConflict: "update" });
	} finally {
		await db.destroy();
	}
	expect(await sitemapUrls()).toContain(`${origin}/posts/${slug}`);
});

test("old tag URLs by label redirect to the slug URL, and tags show their label", async () => {
	const old = await get("/tags/software%20development/");
	expect(old.status).toBe(301);
	expect(old.headers.get("location")).toBe("/tags/software-development/");
	const html = await (await get("/tags/software-development/")).text();
	expect(html).toContain("Hello from EmDash");
	expect(html).toContain("#software development</span>");
	expect(await (await get("/tags/")).text()).toContain("&#35;software development</a>");
	expect((await get("/posts/hello-from-emdash")).status).toBe(200);
});

test("a preview render is never shared-cacheable", async () => {
	const res = await get("/posts/hello-from-emdash?_preview=not-a-token");
	expect(res.headers.get("cache-control") ?? "").not.toContain("s-maxage");
});
