import { telemetry } from "./index.ts";
import type { Tracing } from "./otel.ts";

const HARD_TIMEOUT_MS = 3_000;
let tracing: Tracing | undefined;

export const registerTracing = (value: Tracing | undefined): void => {
	tracing = value;
};

export const shutdown = async (): Promise<void> => {
	const drain = (async () => {
		await tracing?.shutdown();
		await telemetry.flush();
		const { closeSearchDb } = await import("../search/resync.ts");
		await closeSearchDb();
	})();
	await Promise.race([drain.catch(() => {}), Bun.sleep(HARD_TIMEOUT_MS)]);
};
