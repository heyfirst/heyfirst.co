---
title: "Stacktrace is Underrated"
publishDate: "10 August 2025"
description: "I found something cool about stacktraces that I think you'll find really useful! They're not just for errors anymore."
tags:
  [
    "debugging",
    "typescript",
    "performance",
    "developer experience",
    "stacktrace",
  ]
---

I found something cool about **stacktraces** that I think you'll find really useful!

You know **stacktraces**, right? They're those red error messages that tell you where things went wrong in your code. You see them every time there's an error, and they show you exactly where the problem started and how it got there.

But what if I told you stacktraces can do way more than just show errors? Today, I'll show you how to use stacktraces to get the actual callsite, integrate them into your logging system, and even monitor database performance!

## The Problem 🚨

Most developers only use stacktraces when something breaks. You get an error, you see the red text, you fix the bug, and that's it. But stacktraces are actually way more versatile than that!

I was debugging a performance issue the other day. The app wasn't broken - it was just slow. No errors, no crashes, just... sluggish. I needed to find out where the bottleneck was, but I didn't know where to start.

That's when I realized: **stacktraces aren't just for errors!**

## Getting the Callsite 💡

The key insight is that you don't need the entire stacktrace tree. You just need the **callsite** - the actual function that called your code. Here's how to extract it:

```ts
function getCallSite(): string {
	const stack = new Error().stack;
	if (!stack) return "unknown";

	// Split the stack into lines and get the 3rd line (index 2)
	// Line 0: Error
	// Line 1: getCallSite function itself
	// Line 2: The actual calling function (what we want!)
	const lines = stack.split("\n");
	const callSiteLine = lines[2]; // The calling function

	const match = callSiteLine.match(/at\s+(.+?)\s+\(/);
	return match ? match[1] : "unknown";
}

// Usage example
function processUser(userId: string) {
	const caller = getCallSite();
	console.log(`processUser called from: ${caller}`);
	// ... your logic here
}
```

This is much more useful than the full stacktrace because you get exactly what you need - the function that called your code!

## Logging with Callsite ✨

Now let's integrate callsite information into your logging system. This is where it gets really powerful!

```ts
interface LogContext {
	message: string;
	level: "info" | "warn" | "error" | "debug";
	callSite?: string;
	timestamp: Date;
	data?: Record<string, any>;
}

function createLogger(includeCallSite = true) {
	return {
		info: (message: string, data?: Record<string, any>) => {
			const logContext: LogContext = {
				message,
				level: "info",
				timestamp: new Date(),
				data,
				...(includeCallSite && { callSite: getCallSite() }),
			};

			console.log(JSON.stringify(logContext, null, 2));
		},

		warn: (message: string, data?: Record<string, any>) => {
			const logContext: LogContext = {
				message,
				level: "warn",
				timestamp: new Date(),
				data,
				...(includeCallSite && { callSite: getCallSite() }),
			};

			console.warn(JSON.stringify(logContext, null, 2));
		},
	};
}

// Usage
const logger = createLogger(process.env.NODE_ENV === "development");

function updateUserProfile(userId: string) {
	logger.info("Updating user profile", { userId });
	// ... your logic here
}
```

In development, you'll see exactly which function called your logger. In production, you can omit the callsite to reduce log size and improve performance.

## Database Query Monitoring 🚀

Here's where it gets really interesting! Let's say you're using Prisma and want to monitor slow queries:

```ts
import { PrismaClient } from "@prisma/client";

interface QueryMetrics {
	query: string;
	duration: number;
	callSite: string;
	timestamp: Date;
}

class MonitoredPrismaClient extends PrismaClient {
	private slowQueryThreshold = 5000; // 5 seconds

	constructor() {
		super();
		this.setupQueryMonitoring();
	}

	private setupQueryMonitoring() {
		// Intercept Prisma queries
		this.$use(async (params, next) => {
			const startTime = Date.now();
			const callSite = getCallSite();

			try {
				const result = await next(params);
				const duration = Date.now() - startTime;

				if (duration > this.slowQueryThreshold) {
					const metrics: QueryMetrics = {
						query: params.model + "." + params.action,
						duration,
						callSite,
						timestamp: new Date(),
					};

					console.warn(
						"Slow query detected:",
						JSON.stringify(metrics, null, 2),
					);

					// You could also send this to your monitoring system
					// this.sendToMonitoring(metrics);
				}

				return result;
			} catch (error) {
				const duration = Date.now() - startTime;
				console.error("Query failed:", {
					query: params.model + "." + params.action,
					duration,
					callSite,
					error: error.message,
				});
				throw error;
			}
		});
	}
}

// Usage
const prisma = new MonitoredPrismaClient();

async function getUserPosts(userId: string) {
	// This will be monitored and if it takes >5s, you'll see the callsite
	return await prisma.post.findMany({
		where: { authorId: userId },
	});
}
```

Now when a query is slow, you'll see exactly which function caused it, not just the unreadable SQL query!

## Metrics and Monitoring 📊

You can also push this data to Prometheus for monitoring and alerting:

```ts
import { register, Counter, Histogram } from "prom-client";

interface MetricsConfig {
	enableCallSite: boolean;
	slowQueryThreshold: number;
}

class QueryMetrics {
	private queryDuration: Histogram<string>;
	private slowQueryCounter: Counter<string>;

	constructor(config: MetricsConfig) {
		this.queryDuration = new Histogram({
			name: "database_query_duration_seconds",
			help: "Duration of database queries",
			labelNames: config.enableCallSite
				? ["query_type", "call_site"]
				: ["query_type"],
			buckets: [0.1, 0.5, 1, 2, 5, 10],
		});

		this.slowQueryCounter = new Counter({
			name: "slow_queries_total",
			help: "Total number of slow queries",
			labelNames: config.enableCallSite
				? ["query_type", "call_site"]
				: ["query_type"],
		});
	}

	recordQuery(queryType: string, duration: number, callSite?: string) {
		const labels = callSite
			? { query_type: queryType, call_site: callSite }
			: { query_type: queryType };

		this.queryDuration.observe(labels, duration / 1000); // Convert to seconds

		if (duration > 5000) {
			// 5 seconds
			this.slowQueryCounter.inc(labels);
		}
	}
}

// Enhanced Prisma client with Prometheus metrics
class PrometheusPrismaClient extends MonitoredPrismaClient {
	private metrics: QueryMetrics;

	constructor(metricsConfig: MetricsConfig) {
		super();
		this.metrics = new QueryMetrics(metricsConfig);
		this.setupPrometheusMonitoring();
	}

	private setupPrometheusMonitoring() {
		this.$use(async (params, next) => {
			const startTime = Date.now();
			const callSite = getCallSite();

			try {
				const result = await next(params);
				const duration = Date.now() - startTime;

				// Record metrics
				this.metrics.recordQuery(
					`${params.model}.${params.action}`,
					duration,
					callSite,
				);

				return result;
			} catch (error) {
				// Record failed queries too
				const duration = Date.now() - startTime;
				this.metrics.recordQuery(
					`${params.model}.${params.action}_failed`,
					duration,
					callSite,
				);
				throw error;
			}
		});
	}
}

// Usage
const prisma = new PrometheusPrismaClient({
	enableCallSite: process.env.NODE_ENV === "development",
	slowQueryThreshold: 5000,
});
```

Now you can create Grafana dashboards showing which functions are causing the most slow queries!

**Note**: For large teams and codebases, be careful with high cardinality labels in Prometheus. Function names can create too many unique label combinations. Consider using a more controlled set of labels in production.

## Pino Logger Integration 🎯

Here's how I actually integrate callsite information with Pino in my production code:

```ts
// @ts-expect-error it's not typed
import nrPino from "@newrelic/pino-enricher";
import pino from "pino";
import { CONFIG } from "src/config";

const logger = pino(
	CONFIG.IS_DEV
		? {
				transport: {
					target: "pino-pretty",
					options: {
						translateTime: "SYS:standard",
						ignore: "pid,hostname",
					},
				},
				timestamp: () => `,"time":"${new Date().toISOString()}"`,
				mixin: () => {
					// Get the call site information
					const stack = new Error().stack || "";
					const stackLines = stack.split("\n").slice(3); // Skip the Error and logger lines
					const callerInfo = stackLines[1]?.trim() || ""; // stackLines[1] is the caller

					// Extract filename and line number if available
					const matches = callerInfo.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/);
					if (matches) {
						const [, fnName, file, line] = matches;
						// Convert absolute path to relative path by extracting the filename
						const relativeFile = file?.split("/franky/").pop() || file;
						return { caller: `${relativeFile}:${line} (${fnName})` };
					}

					// For cases where the pattern doesn't match
					return { caller: callerInfo.replace(/^at\s+/, "") };
				},
			}
		: /**
			 * can not pass undefined here, need to be a function,
			 * TODO: rewrite pino-enricher, create our own, that contains caller info
			 */
			nrPino(),
);

export { logger };
```

This gives you structured logging with detailed callsite information including file path and line number. In development, you get pretty-printed logs with caller info. In production, it uses New Relic's pino enricher (though you could extend it to include callsite there too).

## Console.trace vs Error().stack 🔧

Here's the difference between these two approaches:

```ts
// Console.trace - good for quick debugging
function debugFunction() {
	console.trace("Function called from:");
	// Outputs the full stacktrace to console
}

// Error().stack - better for programmatic use
function getStackInfo() {
	const stack = new Error().stack;
	const lines = stack?.split("\n") || [];

	return {
		callSite: lines[2]?.trim(),
		fullStack: lines.slice(1).map((line) => line.trim()),
		stackDepth: lines.length - 1,
	};
}
```

Use `console.trace()` when you want to quickly see the call stack in the console. Use `Error().stack` when you need to programmatically extract and use stack information in your code.

## Conclusion

So there you have it! Stacktraces are not just for errors anymore. They're powerful tools for:

- **Getting the callsite** - Extract the actual calling function
- **Enhanced logging** - Include callsite in your log objects
- **Database monitoring** - Track slow queries with function names
- **Metrics integration** - Prometheus with function-level insights
- **Production debugging** - Structured logging with Pino

The key insight is that you don't need the entire stacktrace tree - just the callsite (position -1) gives you exactly what you need to debug effectively.

The next time you're debugging something tricky, remember: **stacktraces** can help even when there's no error!

Hope you find this useful!
