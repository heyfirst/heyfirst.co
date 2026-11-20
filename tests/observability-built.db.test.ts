import { afterAll, beforeAll, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { seedSample } from "../scripts/seed-sample";

const adminUrl = process.env.DATABASE_URL;
const root = join(import.meta.dir, "..");
const scratchName = `obs_built_${process.pid}`;
const outDir = join(root, "dist", `obs-built-${process.pid}`);
const port = 41000 + (process.pid % 10000);
const origin = `http://127.0.0.1:${port}`;
const spans: Record<string, unknown>[] = [];
let sink: ReturnType<typeof Bun.serve>;
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
	if (!adminUrl) throw new Error("DATABASE_URL is not set");
	await runAsAdmin(`DROP DATABASE IF EXISTS ${scratchName} WITH (FORCE)`);
	await runAsAdmin(`CREATE DATABASE ${scratchName}`);
	const scratchUrl = new URL(adminUrl);
	scratchUrl.pathname = `/${scratchName}`;
	sink = Bun.serve({
		port: 0,
		fetch: async (request) => {
			if (new URL(request.url).pathname === "/v1/traces") spans.push(await request.json());
			return new Response("{}");
		},
	});
	const env = {
		...process.env,
		DATABASE_URL: scratchUrl.href,
		SITE_URL: origin,
		UPLOADS_DIR: join(outDir, "uploads"),
		HOST: "127.0.0.1",
		PORT: String(port),
		OTEL_EXPORTER_OTLP_ENDPOINT: `http://127.0.0.1:${sink.port}`,
	};
	const build = Bun.spawnSync(["bun", "run", "build", "--outDir", outDir], { cwd: root, env });
	if (!build.success) throw new Error(`build failed: ${build.stderr.toString()}`);
	await seedSample(scratchUrl.href, "update");
	server = Bun.spawn(
		[
			"bun",
			"--preload",
			"./docker-preload.ts",
			"--preload",
			"./src/observability/preload.ts",
			join(outDir, "server/entry.mjs"),
		],
		{ cwd: root, env },
	);
	await waitFor(origin);
}, 240_000);

afterAll(async () => {
	server?.kill();
	await server?.exited;
	sink?.stop(true);
	rmSync(outDir, { recursive: true, force: true });
	if (adminUrl) await runAsAdmin(`DROP DATABASE IF EXISTS ${scratchName} WITH (FORCE)`);
});

test("the built server counts SQL queries on the root span, and SIGTERM delivers them", async () => {
	for (let i = 0; i < 3; i++)
		expect((await fetch(`${origin}/posts/hello-from-emdash`)).status).toBe(200);
	server?.kill("SIGTERM");
	expect(await server?.exited).toBe(0);

	const all = spans.flatMap((batch) =>
		// biome-ignore lint/suspicious/noExplicitAny: OTLP JSON shape
		(batch as any).resourceSpans.flatMap((r: any) => r.scopeSpans.flatMap((s: any) => s.spans)),
	);
	const roots = all.filter((span) => span.name === "GET /posts/{slug}");
	expect(roots.length).toBe(3);
	for (const root of roots) {
		const count = root.attributes.find((a: { key: string }) => a.key === "app.db.query_count");
		expect(Number(count?.value.intValue ?? count?.value.doubleValue)).toBeGreaterThan(0);
	}
}, 30_000);
