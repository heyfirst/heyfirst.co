import { createLogger, type Telemetry } from "./logger.ts";

const KEY = Symbol.for("heyfirst.telemetry");
const holder = globalThis as { [KEY]?: Telemetry };

// Shared across the preload and the bundled server so one shipper owns the queue.
const shared = (): Telemetry => {
	holder[KEY] ??= createLogger(process.env, (line) => console.log(line));
	return holder[KEY];
};

export const telemetry: Telemetry = shared();

export const log = (fields: Record<string, unknown>): void => telemetry.log(JSON.stringify(fields));
