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

Hi, again this weekend I try to summarize what I re-learn recently and I found something cool about **stacktraces**.

You know **stacktraces**, right? They're those red error messages that tell you where things went wrong in your code. You see them every time there's an error, and they show you exactly where the problem started and how it got there.

But what if stacktraces can do way more than just show errors?

I'll show you how to use stacktraces to get the actual callsite, integrate them into your logging system, and even monitor database performance, as this techniques totally changes my point of view of stacktrace, as it is not limited for Error anymore.

## The Problem 🚨

Most developers only see (or use) stacktraces when something breaks. You get an error, you see the red text, you fix the bug, and that's it. But stacktraces are actually way more versatile than that.

I was debugging a performance issue the other day. The app wasn't broken tho — it was just slow. No errors, no crashes, just... sluggish. I needed to find out where the bottleneck was, but I didn't know where to start.

That's when I found: **stacktraces aren't just for errors!**

## Getting the Callsite 💡

The key insight is that you don't need the entire stacktrace tree. You just need the **callsite**, the actual function that called your code. Here's how to extract it:

```ts
function getCallSite(): string {
	const stack = new Error().stack; // this is not an Error, we just want the stack.
	if (!stack) return "unknown";

	// Split the stack into lines and get the 3rd line (index 2)
	// Line 0: Error
	// Line 1: `getCallSite` function itself
	// Line 2: The actual calling function (what we want!)
	const lines = stack.split("\n");
	const callSiteLine = lines[2]; // The calling function

	const match = callSiteLine.match(/at\s+(.+?)\s+\(/);
	return match ? match[1] : "unknown";
}

// Usage example
function processUser(userId: string) {
	console.log(`processUser called from: ${getCallSite()}`);
	// ... your logic here
}
```

This is much more useful than the full stacktrace because you get exactly what you need, the function that called your code.

## Logging with Callsite ✨

Now let's integrate callsite information into your logging system. This is where it gets really powerful.

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

In development, you'll see exactly which function called your logger. In production, you can omit the callsite to reduce log size and improve performance if you want.

## Database Query Monitoring 🚀

Now as you learned you can get callsite everywhere in your code, let's do something exciting and more realistic here. Let's say you're using Prisma and want to monitor slow queries:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

/**
 * Middleware to log warning everytime the query is slower than 5s, log with the callsite.
 */
prisma.$use(async (params, next) => {
	const startTime = performance.now();

	const result = await next(params);
	const duration = performance.now() - startTime;

	// Log slow queries (>5 seconds)
	if (duration > 5_000) {
		console.warn("Slow query:", {
			query: `${params.model}.${params.action}`,
			duration: `${duration}ms`,
			callSite: getCallSite(),
		});
	}

	return result;
});

// Usage
async function getUserPosts(userId: string) {
	return await prisma.post.findMany({
		where: { authorId: userId },
	});
}
```

Now when a query is slow, you'll see exactly which function caused it, not just the unreadable SQL query. This is incredibly valuable when you're working with Prisma query function that being used in many contexts around codebases.

Instead of hunting through logs trying to match timestamps and query patterns, you get the exact function name that triggered the slow query. This makes performance debugging much more targeted and efficient.

## Metrics and Monitoring 📊

Surely, once you get the log with callside above, you can also push this data to Prometheus for monitoring and alerting:

```ts
import { Counter, Histogram } from "prom-client";

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

		if (duration > this.config.slowQueryThreshold) {
			this.slowQueryCounter.inc(labels);
		}
	}
}

// Enhanced Prisma middleware with metrics
const metrics = new QueryMetrics({
	enableCallSite: process.env.NODE_ENV === "development",
	slowQueryThreshold: 5000,
});

prisma.$use(async (params, next) => {
	const startTime = Date.now();
	const callSite = getCallSite();

	try {
		const result = await next(params);
		const duration = Date.now() - startTime;

		// Record metrics
		metrics.recordQuery(`${params.model}.${params.action}`, duration, callSite);

		return result;
	} catch (error) {
		// Record failed queries too
		const duration = Date.now() - startTime;
		metrics.recordQuery(
			`${params.model}.${params.action}_failed`,
			duration,
			callSite,
		);
		throw error;
	}
});
```

Now you can create Grafana dashboards showing which functions are causing the most slow queries,

**Note**: For large teams and codebases, be careful with high cardinality labels in Prometheus. Function names can create too many unique label combinations. Consider using a more controlled set of labels in production.

## Why Not Just Use APM Tools? 🤔

You might be thinking: "Why not just use Sentry, New Relic, or OpenTelemetry?"

Well, those tools actually work similarly to what we're doing here, they capture stacktraces and call information. But they're pretty strict and hard to customize. Plus, you need to wrap your code with `startTransaction` or spin up complex infrastructure like Jaeger.

Our approach is lightweight and gives you the same benefits without the complexity:

```ts
// Instead of this complex setup:
import { trace } from "@opentelemetry/api";
const span = trace.getActiveSpan();
span?.setAttribute("caller", getCallSite());

// You just do this:
console.log("Processing order", { caller: getCallSite() });
```

Simple, easy to understand, and you get the same debugging power!

## Event-Driven Development 📨

Here's another cool use case: event-driven development. You can track where messages are published from:

```ts
interface MessageEvent {
	type: string;
	data: any;
	publishedChain: string[];
	timestamp: Date;
}

function publishMessage(type: string, data: any, existingChain: string[] = []) {
	const currentCaller = getCallSite();
	const newChain = [...existingChain, currentCaller];

	const event: MessageEvent = {
		type,
		data,
		publishedChain: newChain,
		timestamp: new Date(),
	};

	// Send to your message queue
	messageQueue.publish(event);
}

// Usage
function processOrder(orderId: string) {
	// ... process order logic

	publishMessage("order.completed", { orderId });
	// Now you can see the entire chain of functions that led to this message!
}

function handleOrderCompleted(event: MessageEvent) {
	// You can see the full chain: ['processOrder', 'handleOrderCompleted']
	console.log("Message chain:", event.publishedChain);

	// Continue the chain
	publishMessage(
		"notification.sent",
		{ orderId: event.data.orderId },
		event.publishedChain,
	);
}
```

This makes debugging event chains much easier. Instead of guessing where messages come from, you can trace the entire flow from the original publisher through all the handlers.

You'll see something like `['processOrder', 'handleOrderCompleted', 'sendNotification']`. the complete journey of your message!

## Pino Logger Integration 🎯

Here's how I actually integrate callsite information with Pino in my side-project code:

```ts
// @ts-expect-error @newrelic/pino-enricher's not typed 😐
import nrPino from "@newrelic/pino-enricher";
import pino from "pino";
import { CONFIG } from "src/config";

const logger = pino({
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
});

export { logger };
```

This gives you structured logging with detailed callsite information including file path and line number. Pretty useful in my workflow as when I log some message, I don't need to guess where it is come from.

## Console.trace vs Error().stack 🔧

Here's the difference between these two approaches:

```ts
// Console.trace — good for quick debugging
function debugFunction() {
	console.trace("Function called from:");
	// Outputs the full stacktrace to console
}

// Error().stack — better for programmatic use
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

- **Getting the callsite**: Extract the actual calling function
- **Enhanced logging**: Include callsite in your log objects
- **Database monitoring**: Track slow queries with function names
- **Metrics integration**: Prometheus with function-level insights
- **Production debugging**: Structured logging with Pino
- **Event-driven tracing**: Track message chains through your system
- **Lightweight APM**: Get the same benefits as heavy tools without the complexity

The key insight is that you don't need the entire stacktrace tree — just the callsite (position -1) gives you exactly what you need to debug effectively. You also don't need complex APM setups when a simple `getCallSite()` function can give you the same debugging power.

The next time you're debugging something tricky, remember: **stacktraces** can help even when there's no error!

Hope you find this useful!
