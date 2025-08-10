---
title: "Stacktrace is Underrated"
publishDate: "20 December 2024"
description: "Heyo! I discovered something cool about stacktraces that I think you'll find really useful! They're not just for errors anymore."
tags:
  [
    "debugging",
    "javascript",
    "performance",
    "developer experience",
    "profiling",
  ]
---

Hi! I discovered something cool about stacktraces that I think you'll find really useful!

You know stacktraces, right? They're those red error messages that tell you where things went wrong in your code. You see them every time there's an error, and they show you exactly where the problem started and how it got there.

But what if I told you stacktraces can do way more than just show errors? Today, I'll show you how to use stacktraces for performance profiling, debugging console.logs, and even as metrics!

## The Problem 🚨

Most developers only use stacktraces when something breaks. You get an error, you see the red text, you fix the bug, and that's it. But stacktraces are actually way more versatile than that!

I was debugging a performance issue the other day. The app wasn't broken - it was just slow. No errors, no crashes, just... sluggish. I needed to find out where the bottleneck was, but I didn't know where to start.

That's when I realized: **stacktraces aren't just for errors!**

## What We Already Know

Let's quickly recap what we all know about stacktraces in errors:

```ts
// When you have an error, you get something like this:
TypeError: Cannot read property 'name' of undefined
    at processUser (app.js:15:8)
    at handleSubmit (app.js:25:4)
    at onClick (app.js:35:2)
```

This tells you exactly where the error happened and the call chain that led to it. This is the obvious use case that everyone knows about.

But stacktraces can do so much more!

## Performance Profiling with Stacktraces 💡

Let's say your app is slow but not broken. You want to find out which functions are taking the most time. Here's where stacktraces come in handy!

```ts
// Instead of guessing, you can use console.trace() to see the call stack
function expensiveOperation() {
	console.trace("This function is being called from:");
	// ... your slow code here
}

// Or you can capture stacktraces at different points
function processData() {
	const startTrace = new Error().stack; // Capture current stack
	console.log("Starting processData, called from:", startTrace);

	// ... your processing logic

	const endTrace = new Error().stack;
	console.log("Finished processData, now at:", endTrace);
}
```

This is super useful when you're trying to find bottlenecks! You can see exactly which code paths are being executed and how often.

## Debugging Console.logs

Ever had this problem? You add a `console.log` but don't know why it's running or where it's being called from?

```ts
// Instead of this:
function someFunction() {
	console.log("Why am I running?"); // 🤷‍♂️
}

// You can do this:
function someFunction() {
	console.trace("someFunction called from:");
	// Now you'll see the full call stack!
}
```

This saved me so much time! Instead of guessing or adding more console.logs, you get the complete picture of how your code is being executed.

## Stacktrace as Metrics ✨

Here's where it gets really interesting! You can actually use stacktraces for analytics and monitoring.

```ts
// Track which code paths are used most
function trackCodePath() {
	const stack = new Error().stack;
	const caller = stack.split("\n")[2]; // Get the calling function

	// Send this to your analytics
	analytics.track("code_path_executed", {
		path: caller,
		timestamp: Date.now(),
	});
}

// Or monitor performance patterns
function monitorPerformance() {
	const startTime = performance.now();
	const stack = new Error().stack;

	// ... your code ...

	const duration = performance.now() - startTime;
	if (duration > 100) {
		// Log slow operations
		console.warn(`Slow operation detected: ${duration}ms`, stack);
	}
}
```

You can use this to:

- Find which features are used most
- Identify performance bottlenecks
- Track code execution patterns
- Monitor for unexpected code paths

## Real-World Example

Here's a practical example from my work. I was debugging why a function was being called multiple times:

```ts
function updateUserProfile() {
	console.trace("updateUserProfile called from:");

	// I found out it was being called from 3 different places!
	// 1. User clicks save button
	// 2. Auto-save timer
	// 3. Form validation

	// This helped me optimize the logic and prevent unnecessary calls
}
```

Without the stacktrace, I would have spent hours guessing and adding more console.logs. With it, I had the answer in seconds!

## Tips & Tricks

Here are some cool things you can do with stacktraces:

1. **Get function names programmatically:**

```ts
function getCallerName() {
	const stack = new Error().stack;
	const caller = stack.split("\n")[2];
	return caller.match(/at\s+(.+?)\s+\(/)?.[1] || "unknown";
}
```

2. **Check if you're in development:**

```ts
function isDevelopment() {
	const stack = new Error().stack;
	return stack.includes("node_modules") === false;
}
```

3. **Track async operations:**

```ts
async function asyncOperation() {
	const startStack = new Error().stack;
	console.log("Async operation started from:", startStack);

	await someAsyncWork();

	const endStack = new Error().stack;
	console.log("Async operation completed, now at:", endStack);
}
```

## Conclusion

So there you have it! Stacktraces are not just for errors anymore. They're powerful tools for:

- **Performance profiling** - Find bottlenecks without errors
- **Debugging console.logs** - Understand why code is running
- **Metrics and monitoring** - Track code execution patterns
- **Development insights** - Better understand your codebase

The next time you're debugging something tricky, remember: stacktraces can help even when there's no error!

Hope you find this useful! Let me know what you think in the comments below! 😊

What's your favorite debugging technique? Have you used stacktraces in unexpected ways? I'd love to hear your experiences!
