export {};

const url = process.env.EMDASH_URL;
const token = process.env.EMDASH_TOKEN;
if (!url || !token) {
	console.error("check-admin: set EMDASH_URL and EMDASH_TOKEN in .env");
	process.exit(1);
}

type Envelope<T> = { data?: T } & T;

async function get<T>(path: string): Promise<T> {
	const res = await fetch(new URL(path, url), {
		headers: { authorization: `Bearer ${token}` },
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`${path} answered ${res.status}`);
	const body = (await res.json()) as Envelope<T>;
	return body.data ?? body;
}

const status = await get<{ needsSetup: boolean }>("/_emdash/api/setup/status");
if (status.needsSetup) {
	console.error("check-admin: FAIL setup is not complete; finish the wizard first");
	process.exit(1);
}

const ADMIN_ROLE = 50;
const users = await get<{ items: { role: number; disabled: boolean }[]; nextCursor?: string | null }>(
	"/_emdash/api/admin/users?limit=100",
);
const admins = users.items.filter((user) => user.role >= ADMIN_ROLE && !user.disabled);
if (admins.length !== 1 || users.items.length !== 1 || users.nextCursor) {
	console.error(
		`check-admin: FAIL expected exactly one user who is an admin, found ${users.items.length} users and ${admins.length} admins`,
	);
	process.exit(1);
}
console.log("check-admin: ok, setup complete, exactly one admin and no other user");
