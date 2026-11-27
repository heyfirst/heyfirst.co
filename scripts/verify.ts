export {};

const fast = [
	{ name: "check", cmd: ["bun", "run", "check"] },
	{ name: "lint", cmd: ["bun", "run", "lint"] },
	{ name: "test", cmd: ["bun", "test"] },
];
const full = [
	{ name: "test:db", cmd: ["bun", "run", "test:db"] },
	{ name: "test:http", cmd: ["bun", "run", "test:http"] },
];

async function databaseAnswers() {
	const url = process.env.DATABASE_URL;
	if (!url) return false;
	try {
		const sql = new Bun.SQL(url, { max: 1, connectionTimeout: 1 });
		await Promise.race([sql`select 1`, Bun.sleep(1000).then(() => Promise.reject(new Error("timeout")))]);
		await sql.close();
		return true;
	} catch {
		return false;
	}
}

const onlyFast = process.argv.includes("--fast");
const withDatabase = !onlyFast && (await databaseAnswers());
const steps = withDatabase ? [...fast, ...full] : fast;
const skipped = onlyFast || withDatabase ? "" : " | db and http suites skipped: no database";

async function run({ name, cmd }: (typeof steps)[number]) {
	const start = performance.now();
	const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
	const [out, err, code] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);
	return { name, code, seconds: (performance.now() - start) / 1000, output: out + err };
}

const started = performance.now();
const results = await Promise.all(steps.map(run));
for (const r of results.filter((r) => r.code !== 0)) {
	console.error(`--- ${r.name} failed (exit ${r.code})\n${r.output}`);
}
const parts = results.map((r) => `${r.name} ${r.code === 0 ? "ok" : "FAIL"} ${r.seconds.toFixed(1)}s`);
const total = ((performance.now() - started) / 1000).toFixed(1);
console.log(`verify: ${parts.join(" | ")} | total ${total}s${skipped}`);
process.exit(results.some((r) => r.code !== 0) ? 1 : 0);
