import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { pgInstrumentation, startTracing } from "./otel.ts";
import { registerTracing } from "./shutdown.ts";

registerTracing(startTracing(process.env));
registerInstrumentations({ instrumentations: [pgInstrumentation()] });
