---
title: "WAL: a write-ahead log, or writing it down before you do it"
description: "A write-ahead log is just writing down the step before you run it. Same trick shows up in Postgres, in your payment handler, and in how Cursor hosts Git."
publishDate: "24 August 2026"
tags: ["databases", "distributed systems", "postgres", "architecture"]
draft: true
---

We were talking at the office this week about [Cursor's post on hosting Git at any scale](https://cursor.com/blog/git-at-any-scale), and one line stuck with me:

> The core primitive behind it is a write-ahead log, which we store in S3-compatible object storage.

Hmmmm, A write-ahead log. The same thing I know that Postgres has been doing since forever, holding up Git hosting for millions of repositories.
So I went sitting just read about this again for an evening, and this is a note for myself to relearn this once again.

## The one-line idea

**Before change stuff, first write down what you're about to do.**

That's the whole idea. Simple as that.

Say I'm deploying a new app on my homelab: pull the image, run the db migration, repoint the proxy, restart. Halfway through, my SSH session drops. Did the migration run? I'm reconstructing what past-me did five minutes ago.

Instead, I write each step down _before_ I run it — "running the migration now" — then run it. Session dies, I read my note, and I know exactly where I were.

That note is the write-ahead log. The "ahead" part is the whole point: the line goes down _before_ the real change, not after.

```mermaid
flowchart LR
    R["Change request<br/>update row 42"] --> L["1 · Append to log<br/>flushed to disk first"]
    L --> D["2 · Update the data file<br/>whenever convenient"]
    L --> C["Crash? Replay the log on restart<br/>anything that never reached<br/>the data file gets redone"]
```

## It's not only about safety

The log is not just for safety, it's also what makes the database _fast_ as well

So now my data lives in pages scattered all over a file, and one transaction might touch a handful of them. Flushing all of that safely on every commit means many separate writes, right?

Imagine what if we utilize this append-only log? So one file, always writing at the end, so a transaction commit becomes: append a small record, flush that as batch, done.

And now One `fsync` instead of many, 10 transactions committing at roughly the same moment can share a single flush (So Postgres calls this [group commit](https://www.postgresql.org/docs/current/wal-configuration.html)), and
10 commits cost about as much as 1. The data pages get updated later, in the background, in bulk.

Log now and apply later. This is durability and speed, not just a safety-net alone anymore.

Clever hah?

> "What is the data page?"
>
> A data page is the fixed-size block a database does all its I/O in. Postgres uses 8KB pages, and every row lives inside one.
>
> Updating a row means reading that page, modifying it in memory, and writing the whole page back later — so a transaction touching rows on 5 pages means 5 scattered writes, which is exactly the cost the WAL collapses into 1 append.

## The rule that makes it work

The log record has to physically hit the disk **before** the data page does.

If we break the order, there is no point of WAL. We'll have a half-baked data file and no note explaining what was supposed to happen. and this is strictly bad-bad than not having a log at all, because I might think I are safe but I am not.

In the Cursor blog, they say one of the rule and we will talk about it next.

> We never acknowledge a push until it has been fully persisted.

## The checkpoint

If I keep appending, the log grows forever, this is not ideally good. Periodically checking the database and mark it as "everything up to this point is safely in the data file now, these log record aren't needed anymore", then we truncated or recycled them.

That's **the checkpoint**.

Another one worth mentioned is "Recycled," though, only once nothing still needs it and it's not just the data files that need it. A lagging replica, or a failing `archive_command`, can pin the log in place:

> "What is the replica?"
>
> A 2+ Postgres instances that stays a live copy by replaying the log as it arrives, it's for crash-recovery, or it's for availability, multiple zone. in this context, we talk about that it marks its position on the log file with "replication slot" a bookmark telling the main server that don't recycle the past yet, I'm reading!

If we kill the replica and forget it, and the bookmark freezes. Postgres keeps its promise: every segment since piles up in `pg_wal` until the disk fills and the database stop working.

Because the checkpoint trims the _head_ of the log but anything pinning the _tail_ win it. This is the classic "the log grew forever anyway" incident.

It's the piece everybody skips when they build this pattern themselves. So I myself haven't have chance handle this myself yet but worth learning anyway

## You've already been using this

- **Postgres** — the `pg_wal/` directory. The same log feeds streaming replicas and point-in-time recovery — once you have an ordered log of every change, "replay it somewhere else" and "replay it up to 3:47pm yesterday" fall out for free.
- **SQLite** — `PRAGMA journal_mode=WAL`, and the `-wal` sidecar file next to your database. Most people flip this on because readers stop blocking writers, without ever asking _why_.
- **ext4, NTFS** — they call it journaling. A close cousin rather than the same thing: by default they journal filesystem _metadata_, not your file contents, so what you get is "the filesystem stays consistent," not "your data survives."
- **Kafka** — arguably just "what if the log _was_ the database." Hold that thought.

## Now the part I actually care about

Does this apply to normal application code? Yes. Same shape, different name.

At the app level the "crash" is a process dying, a pod getting evicted, a timeout, a 500 halfway through a request — and the "data file" is often an external system you can't roll back.

### First, what "durable" means

Durable means: **it survives the process dying right now.** Not "I called the function." The bytes are somewhere they'll still be after a hard power loss.

The trap is all the layers that _look_ durable and aren't:

- A variable in memory → gone on crash.
- An `INSERT` sent, transaction not committed → gone.
- Written to a file, sitting in the OS page cache → still gone on power loss. `write()` returned, but the disk never saw it.
- `COMMIT` returned successfully → durable. The database did the `fsync` for you.

For application code: **durable means the database transaction committed.** Until `await tx.commit()` returns, you have nothing — that's the D in ACID.

(With the usual asterisks: `synchronous_commit=off` means a crash can lose the last few commits — annoying, but the database stays consistent. `fsync=off` can corrupt it outright. Check both once, then mostly forget.)

This is why the WAL rule is "the log entry must be durable before the side effect." It's not _before_ in the order your code reads. It's before in the order things land on disk.

### The problem: dual writes

Two systems can't share a transaction. (Two-phase commit exists, technically — and approximately nobody reaches for it, least of all against someone else's payment API.)

```ts
await db.orders.update({ where: { id }, data: { status: "paid" } }); // system A
await kafka.publish("order.paid", { id }); // system B  ← crash here
```

Two independent failure points, no atomicity. The order says `paid`, but nothing downstream ever hears about it. Shipping never triggers. Nobody finds out until the customer emails you.

And you can't reorder your way out of it. Swapping the two lines just moves the bug — now you announce a payment you never recorded.

### The fix: make it a single write

You can't make two systems atomic. You _can_ make two tables atomic.

```ts
await db.$transaction(async (tx) => {
	await tx.orders.update({ where: { id }, data: { status: "paid" } });
	await tx.outbox.create({ data: { topic: "order.paid", payload: { id } } });
});
```

Both rows live in the same database, so one `COMMIT` makes them atomic. Either both exist or neither does. There is no in-between state to crash into.

```ts
// Elsewhere: the relay worker, on a timer.
const rows = await db.$queryRaw`
	SELECT * FROM outbox
	WHERE published_at IS NULL
	ORDER BY created_at
	LIMIT 100
	FOR UPDATE SKIP LOCKED`;

for (const row of rows) {
	await kafka.publish(row.topic, row.payload);
	await db.outbox.update({
		where: { id: row.id },
		data: { published_at: new Date() },
	});
}
```

`FOR UPDATE` takes a row lock on everything it selected; `SKIP LOCKED` makes a worker that hits an already-locked row skip past it instead of waiting. Two workers polling at the same moment each get a different batch — no duplicates, no queueing. (Run the poll inside a transaction, or the locks release before you've published.)

| Where the crash lands  | Dual write                        | Outbox                                      |
| ---------------------- | --------------------------------- | ------------------------------------------- |
| Between the two writes | Message lost forever, no trace    | Row sits unpublished; next poll picks it up |
| During the publish     | Half-sent, unknown state          | Relay retries until it's marked             |
| Delivery guarantee     | Best-effort — messages can vanish | At-least-once — messages can duplicate      |

You didn't remove the risk, you moved it: the new failure mode is duplication, not loss. The relay might publish, then die before marking the row published, and publish again — so consumers have to be idempotent. That ordering is deliberate: mark first, and you'd trade duplicates for losses — the one failure you can't recover from.

(And if polling a table offends you, the alternative is tailing Postgres' own WAL with logical decoding — Debezium, essentially — for lower latency, at the price of coupling your delivery pipeline to database internals. Polling is boring and portable. Start there.)

Now the harder case.

### When the second system is one you don't control

Charging a card is not a message you can re-send casually. It's irreversible and it belongs to someone else.

Same shape though — write the intent first:

```ts
// 1. LOG — a durable record of what I'm about to do.
//    This commits on its own. Do NOT wrap all three steps in one transaction:
//    if you did, a crash would roll back the intent while Stripe still has the charge.
const attempt = await db.paymentAttempts.create({
	data: {
		orderId,
		idempotencyKey: crypto.randomUUID(),
		status: "pending",
		amountCents,
	},
});

// 2. DO — the irreversible part.
const charge = await stripe.paymentIntents.create(
	{ amount: amountCents, currency: "usd", confirm: true },
	{ idempotencyKey: attempt.idempotencyKey },
);

// 3. APPLY — record the outcome.
await db.paymentAttempts.update({
	where: { id: attempt.id },
	data: { status: "succeeded", chargeId: charge.id },
});
```

Crash after step 1? The retry worker finds the `pending` row and retries. The idempotency key means Stripe returns the _original_ charge instead of billing someone twice. (Keys don't live forever, though — Stripe's expire after about 24 hours, so a retry that outlives the window bills twice. One more reason the retry cap matters.)

That key is your "I already replayed this entry" marker — doing roughly the job an LSN does in a real WAL: during redo, Postgres compares a record's LSN against the target page's to ask "already applied?" It's a position check, not a transaction-ID check.

### Where the analogy gets thin

Now the part that took me longest to get straight.

A database WAL is idempotent _by construction_. Postgres owns the log and the data file, so replaying a record twice is defined to be safe — one system, one authority, no negotiation. Your outbox has no such luxury. The side effect lives in someone else's system, so replay is only safe if _they_ cooperate, via an idempotency key you have to remember to pass. The safety isn't given to you by the pattern. It's homework.

Same shape, different mechanism. And the difference is exactly the part that pages you at 3am.

The practical version: **replay is the normal case, not the exception.** Design for it up front, not after the first duplicate charge.

## Don't forget the checkpoint

Your `outbox` and `payment_attempts` tables need the equivalent, and this is the part people skip: you ship the happy path, and six months later there's a table with forty million rows in it and a handful of silent orphans.

The retry worker is not optional. Minimum viable version:

```sql
-- Find stuck intents, safely, across multiple workers.
SELECT *
FROM payment_attempts
WHERE status = 'pending'
  AND created_at < now() - interval '2 minutes'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 100;
```

(One caveat: a locking clause combined with `ORDER BY` at `READ COMMITTED` can return rows slightly out of order — harmless for a retry worker, but don't build anything that needs strict ordering on this query.)

Checklist for anything you build in this shape:

- **Idempotency key** on every entry, generated _before_ the side effect.
- **A retry worker**, with backoff and a cap on attempts.
- **A terminal state** — `failed` after N tries, so rows can't retry forever.
- **Cleanup** of completed entries, or the table grows without limit.
- **An alert** on anything `pending` longer than it should be. This is the one that tells you the pattern is broken before a customer does.

## And then Cursor takes it further

Here's what made me want to write this up.

In a normal database, the data file is the truth and the log protects it. Cursor inverted that. Their WAL lives in S3, and _that's_ the source of truth — the Git repositories on local NVMe disks are, in their words, **"warm caches."**

Once the log is the truth, a pile of hard problems disappear. There's no leader election, because there's no special server to elect:

> There's no state and no consensus here. Any server can be the primary.

Any replica can be rebuilt by replaying the log. Losing a machine stops being an incident and starts being a cache miss. And you get history for free:

> Since every push is in the WAL, we can look at every state a repository has ever been in.

That's the same "replay it somewhere else, replay it up to yesterday" bonus Postgres gets from `pg_wal/`, just at a different altitude.

So maybe the Kafka joke isn't a joke. Once the log is durable, ordered, and complete, the "real" data structure is only ever a convenient projection of it. You can throw it away and rebuild it.

## What I'm taking away

The question that matters isn't _"did this succeed?"_ It's _"do I have a durable record of what I intended, and can I safely do it again?"_

Concretely, for Monday: go find your dual writes — every place you write to your database and then call something else, a payment provider, a broker, an email service. Each is a place where a crash in between leaves you inconsistent with no way to find out.

You probably can't fix all of them. But you can list them, and then you at least know where the bodies are.

You can't make two systems atomic. You _can_ make two tables atomic — so write the intent down next to the data, and let a worker carry it across the boundary.
