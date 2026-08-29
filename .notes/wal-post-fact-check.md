# Fact-check: "WAL: a write-ahead log, or writing it down before you do it"

Post: `src/content/post/write-ahead-log/index.md`
Checked against primary sources only (PostgreSQL docs, SQLite docs, Linux kernel ext4 docs, Cursor blog, Stripe API docs, Prisma docs, Kafka docs) via live fetch. This file is a research note, not a source of truth to merge — it lives in `.notes/` because the repo has no dedicated research-notes location (`docs/adr/` is for architectural decisions, `docs/worklog/` is dated session logs; neither fits a one-off fact-check).

Ranked by severity — most likely to draw a public "well, actually" first.

---

## 1. [Imprecise] ext4/NTFS journaling "same idea" — glosses over the metadata-only default

**Post says (line 72):**
> **ext4, NTFS** — they call it journaling. Same idea.

**Verdict: Imprecise.**

ext4's default mode is `data=ordered`. In that mode ext4 journals **metadata only** — not file data. Per the Linux kernel docs (`Documentation/filesystems/ext4/journal.rst` and `ext4.rst`, via kernel.org / torvalds/linux):

> "In data=ordered mode, ext4 only officially journals metadata, but it logically groups metadata information related to data changes with the data blocks into a single unit called a transaction... does not put the data itself into the journal."

`data=journal` (all data journaled) exists but is not the default and comes with real costs (disables delayed allocation and direct I/O). `data=writeback` journals metadata only with even weaker ordering guarantees.

This matters for the post's argument specifically because the whole piece is about the WAL-before-data ordering rule ("the log record has to physically hit the disk before the data page does"). ext4's *default* journaling mode does **not** give you that guarantee for file data — only for filesystem metadata (inode/directory structure integrity), which is a materially different property than "my file's bytes are durable and consistent." A reader who knows ext4 internals will flag this as the one line in the post that overclaims.

**Source:** https://www.kernel.org/doc/Documentation/filesystems/ext4/journal.rst and https://docs.kernel.org/6.12/admin-guide/ext4.html (kernel docs, current)

**Proposed fix** (preserves voice, adds the caveat without turning it into a filesystem lecture):

> **ext4, NTFS** — they call it journaling. Same idea, though by default ext4 only journals metadata, not your actual file bytes — the full "log the data too" mode exists (`data=journal`) but almost nobody runs it.

---

## 2. [Imprecise] `FOR UPDATE SKIP LOCKED` + `ORDER BY` + `LIMIT` has a documented caveat the post doesn't mention

**Post's SQL (lines 201-209):**
```sql
SELECT * FROM payment_attempts
WHERE status = 'pending' AND created_at < now() - interval '2 minutes'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 100;
```
> `FOR UPDATE SKIP LOCKED` is what stops two workers from grabbing the same row and racing each other.

**Verdict: Correct on the core claim, but incomplete.**

The core claim is right — Postgres docs explicitly describe this use case:

> "Skipping locked rows provides an inconsistent view of the data, so this is not suitable for general purpose work, but can be used to avoid lock contention with multiple consumers accessing a queue-like table."
(https://www.postgresql.org/docs/current/sql-select.html, "The Locking Clause")

But the docs also carry a specific, documented caveat for exactly the pattern the post writes — `ORDER BY` combined with a locking clause at `READ COMMITTED`:

> "It is possible for a SELECT command running at the READ COMMITTED transaction isolation level and using ORDER BY and a locking clause to return rows out of order. This is because ORDER BY is applied first. The command sorts the result, but might then block trying to obtain a lock on one or more of the rows. Once the SELECT unblocks, some of the ordering column values might have been modified, leading to those rows appearing to be out of order..."

For a reaper/sweeper query this is low-stakes (you're not relying on strict ordering for correctness), but it's the documented caveat a Postgres-literate reader would bring up, and the post presents the query as a clean "minimum viable version" without it.

**Source:** https://www.postgresql.org/docs/current/sql-select.html ("The Locking Clause" section)

**Proposed fix** (one sentence after the SQL block, doesn't require touching the query):

> `FOR UPDATE SKIP LOCKED` is what stops two workers from grabbing the same row and racing each other. (One caveat: at the default `READ COMMITTED` isolation level, combining a locking clause with `ORDER BY` can technically return rows slightly out of order if a row gets modified while another session is blocked on it — irrelevant for a reaper query like this, but worth knowing before you reuse the pattern somewhere ordering actually matters.)

---

## 3. [Worth a nod] "Two systems can't share a transaction" ignores 2PC/XA as a named exception

**Post says (line 102):**
> Two systems can't share a transaction. That's the whole difficulty in one sentence.

**Verdict: Defensible as the practical reality, but not strictly true — two-phase commit (2PC/XA) exists precisely to let heterogeneous systems share a transaction.** Postgres itself ships `PREPARE TRANSACTION` / `COMMIT PREPARED` for this. The post's framing is fine as *practical* advice (2PC is rarely used in application code for good reasons — it's operationally painful, and most message brokers/APIs like Stripe or Kafka don't participate in XA at all) but stated as an absolute it's technically wrong, and it's an easy "well, actually, 2PC" comment magnet.

**Proposed fix** (keeps the punchy one-liner, adds the asterisk inline):

> Two systems can't *easily* share a transaction — two-phase commit exists on paper, but almost nothing you'll actually be talking to (Stripe, Kafka, a REST API) participates in it, so for practical purposes: two systems can't share a transaction. That's the whole difficulty in one sentence.

This is genuinely optional — the post's "practical rule" framing throughout (e.g. the `synchronous_commit` aside) suggests the author is comfortable with "asterisks," so a similar one here fits the established voice.

---

## 4. [Correct, worth double-checking your own claim] `COMMIT` / durability / `synchronous_commit`

**Post says (lines 92, 96):**
> `COMMIT` returned successfully → durable. The database did the `fsync` for you.
> (With the usual asterisks — that assumes default `synchronous_commit`, and hardware that isn't lying to you about its write cache. Both are worth checking once, then mostly forgetting.)

**Verdict: Correct, and the hedge is doing exactly the right job.**

- `synchronous_commit` default is `on` (confirmed: https://www.postgresql.org/docs/current/runtime-config-wal.html#GUC-SYNCHRONOUS-COMMIT).
- At `on` (no sync standbys configured), Postgres docs: "The local behavior of all non-off modes is to wait for local flush of WAL to disk" — i.e., COMMIT does not return until the WAL record is fsynced.
- At `synchronous_commit = off`, this breaks: "there is no waiting, so there can be a delay between when success is reported to the client and when the transaction is later guaranteed to be safe against a server crash" — so the post's asterisk is load-bearing and correctly scoped.
- `fsync` (the server config, default `on`) is the other half — if an operator has turned *that* off, none of this holds regardless of `synchronous_commit`. The post doesn't mention the `fsync` GUC specifically, only "hardware that isn't lying to you," which covers write-cache lies but not an operator disabling `fsync` outright. Minor gap, not worth a fix — extremely few people run with `fsync=off` outside benchmarking, and the docs themselves warn heavily against it.

**Source:** https://www.postgresql.org/docs/current/runtime-config-wal.html, https://www.postgresql.org/docs/current/wal-reliability.html

No fix needed — flagging only because it's the post's most load-bearing durability claim and it holds up.

---

## 5. [Correct] Postgres WAL directory, replication/PITR, checkpoint recycling

- `pg_wal/` directory name — **Correct.** "WAL files are stored in the directory `pg_wal` under the data directory" (https://www.postgresql.org/docs/current/wal-internals.html).
- WAL feeds streaming replication and PITR — **Correct.** WAL archiving enables "reverting to any time instant covered by the available WAL data" (https://www.postgresql.org/docs/current/wal-intro.html, cross-referencing the PITR chapter).
- "get truncated or recycled" — **Correct**, matches docs almost verbatim: "after a checkpoint, WAL segments preceding the one containing the redo record are no longer needed and can be recycled or removed" (https://www.postgresql.org/docs/current/wal-configuration.html).

---

## 6. [Correct] "Group commit" is Postgres's own term

**Post says (line 44):** "Postgres calls this group commit."

**Verdict: Correct.** The WAL Configuration chapter uses the term directly: "When `commit_delay` is set to zero (the default), it is still possible for a form of group commit to occur, but each group will consist only of sessions that reach the point where they need to flush their commit records during the window in which the previous flush operation... is occurring." `commit_delay`/`commit_siblings` are documented as the tunables for widening that batching window.

**Source:** https://www.postgresql.org/docs/current/wal-configuration.html

---

## 7. [Correct] fsync/performance framing (one fsync vs. scattered writes)

**Post's claim:** WAL is fast because it's one `fsync` on an append-only file instead of many scattered page flushes, with group-commit batching, and actual data pages get updated "later, in the background, in bulk."

**Verdict: Correct**, and matches the docs closely rather than being an oversimplification:

> "Using WAL results in a significantly reduced number of disk writes, because only the WAL file needs to be flushed to disk to guarantee that a transaction is committed, rather than every data file changed by the transaction... when the server is processing many small concurrent transactions, one fsync of the WAL file may suffice to commit many transactions." — https://www.postgresql.org/docs/current/wal-intro.html

> "The WAL file is written sequentially, and so the cost of syncing the WAL is much less than the cost of flushing the data pages." — same page

Dirty data pages are flushed later by the checkpointer/background writer in bulk, which is exactly what the post describes as "the actual data pages get updated later, in the background, in bulk." Not an oversimplification — Postgres genuinely defers and batches those writes rather than avoiding them, which is what the post says.

---

## 8. [Correct] SQLite `PRAGMA journal_mode=WAL`, `-wal` sidecar, reader/writer concurrency

- `PRAGMA journal_mode=WAL;` — **Correct** syntax, verbatim from https://sqlite.org/wal.html.
- `-wal` sidecar filename — **Correct**: "The name of this file on disk is usually the name of the database file with an extra '-wal' suffix."
- "readers don't block writers and writers don't block readers" — **Correct**, near-verbatim match to the docs: "WAL provides more concurrency as readers do not block writers and a writer does not block readers." The post doesn't claim multiple concurrent writers (it wouldn't be true — SQLite docs: "since there is only one WAL file, there can only be one writer at a time"), so no correction needed; the post's claim as written is precise.

**Source:** https://sqlite.org/wal.html

---

## 9. [Correct] Cursor blog quotes — all four verbatim and in correct context

All four quotes fetched and checked against https://cursor.com/blog/git-at-any-scale:

1. "The core primitive behind it is a write-ahead log, which we store in S3-compatible object storage." — verbatim, in the Continuity section.
2. "We never acknowledge a push until it has been fully persisted." — verbatim, stated as a core design principle (appears more than once in the post, both times consistent with how the blog post quotes it).
3. "There's no state and no consensus here. Any server can be the primary." — verbatim, in the Consensus subsection.
4. "Since every push is in the WAL, we can look at every state a repository has ever been in." — verbatim, in the "WAL as truth" section.
5. "Warm caches" — confirmed, Cursor's post describes local repo copies as a "warm cache on disk."
6. System named "Continuity" — confirmed, used throughout that section of the post.

No corrections needed. Quotes are not misleadingly clipped — each is used by the blog post in the same sense the post uses it.

---

## 10. [Correct] Stripe idempotency keys

**Post's claim:** passing an `idempotencyKey` to `paymentIntents.create` returns the original charge on replay; the key is "roughly the job an LSN does."

**Verdict: Correct** on the mechanism. Stripe docs: "Stripe's idempotency works by saving the resulting status code and body of the first request made for any given idempotency key... Subsequent requests with the same key return the same result." Retention: "You can remove keys from the system automatically after they're at least 24 hours old" (24-hour minimum retention, current docs).

The post doesn't state a specific retention number, so there's nothing to correct — just noting for completeness that current retention is 24 hours minimum, in case a future revision wants to cite it.

**Source:** https://docs.stripe.com/api/idempotent_requests

---

## 11. [Correct] Prisma code

- `db.$transaction(async (tx) => {...})` — **Correct**, matches the documented interactive-transactions pattern exactly (Prisma docs show the identical `prisma.$transaction(async (tx) => {...})` shape).
- `create({ data })`, `update({ where, data })` — **Correct**, standard documented Prisma Client shapes.

**Source:** https://www.prisma.io/docs/orm/prisma-client/queries/transactions

---

## 12. [Correct / reasonable] Conceptual claims

- **LSN analogy** ("doing roughly the job an LSN does in a real WAL") — **Correct as hedged.** An LSN (`pg_lsn`) is a byte-offset pointer into the WAL stream used, among other things, by crash recovery to determine whether a given WAL record's change has already been applied to a page (compare record LSN to the page's `pd_lsn`). The idempotency key plays an analogous "have I already done this" role, though the mechanism differs (byte-position comparison vs. key lookup) — the post's "roughly" is the right amount of hedge.
- **"At-least-once" for the outbox relay** — **Correct**, standard distributed-systems terminology and accurately describes the described failure mode (publish, crash before marking published, republish on next poll).
- **DB WAL "idempotent by construction"** — **Correct, reasonable characterization.** Postgres redo compares each WAL record's LSN against the target page's LSN and skips replay if the page already reflects that change, which is exactly what makes crash recovery safe to interrupt and restart. This is standard ARIES-style recovery behavior consistent with Postgres's documented full-page-write/redo mechanism (https://www.postgresql.org/docs/current/wal-reliability.html, https://wiki.postgresql.org/wiki/Full_page_writes).

---

## 13. [Correct] Kafka framing

**Post says:** Kafka is "arguably just 'what if the log was the database.'"

**Verdict: Defensible, matches Kafka's own framing of the log as its central abstraction.** Kafka's docs describe partitions as "an ordered, immutable sequence of records that is continually appended to—a structured commit log," and describe Kafka itself as "based on an abstraction of a distributed commit log." This is consistent with — though not a verbatim quote of — the post's one-liner. The post correctly flags this as its own editorializing ("arguably") rather than attributing the phrase to Kafka, so no correction needed.

**Source:** https://kafka.apache.org/documentation/ (Design/Log sections)

---

## Summary of required/recommended edits

| # | Severity | Line(s) | Action |
|---|----------|---------|--------|
| 1 | Medium (public nitpick magnet) | 72 | Fix "ext4, NTFS — same idea" to note metadata-only default journaling |
| 2 | Low-medium | 208-212 | Add caveat about `ORDER BY` + locking clause at READ COMMITTED |
| 3 | Low (optional, matches post's existing hedging style) | 102 | Acknowledge 2PC/XA as a rare, impractical exception |
| 4-13 | None | — | All verified correct against primary sources; no changes needed |
