# Voice style guide

Rules mined from this repo's own git history — real before/after quotes from actual revision
commits on posts in `src/content/post/`, not generic writing advice. Commit hashes included so
you can `git show <hash>` and see more context if a rule feels ambiguous.

One important finding: grepping every revision commit in this repo for classic AI-slop
vocabulary — delve, moreover, furthermore, leverage, seamless, robust, unlock, elevate,
landscape, realm, testament to, underscore, foster, embark, "it's important to note" — turned up
**zero hits**. That vocabulary was never in the drafts. So don't reach for a buzzword blocklist
here. What actually gets cut in a real "de-AI" pass (Rule 3) is hedges, restatements, filler,
and callback bookends — a different, more specific thing.

---

**Rule 1 — Open with a real moment. Not a definition.**
- How to: first sentence has "I" doing something real — a talk, a trip, a bug.
- Do: *"We were talking at the office this week about [Cursor's post]..."* (write-ahead-log)
- Don't: open with "A write-ahead log is..." or a question at the reader.

**Rule 2 — End with reflection or "let me know if I'm wrong." Not a comment-bait CTA.**
- Do: *"...if I missed something (I'm sure I did), please let me know..."* (write-ahead-log)
- Don't: this got cut, not reworded, in a real edit (`e10c109`): *"What's your favorite
  debugging technique? Have you used stacktraces in unexpected ways?..."* → deleted, kept only
  *"Hope you find this useful!"*

**Rule 3 — Cut hedges, restatements, filler, and callbacks. (The de-AI pass, from `bab8ff7`.)**
- Do: `"I think yes."` → `"Yes."` · `"in my opinion"` → cut · `"Here's what actually made me..."`
  → `"Here's what made me..."` · `"Which brings me to the harder case."` → `"Now the harder
  case."` · 26 words → 10: `"I'll be honest about the part someone will point out in the
  comments..."` → `"Now the part that took me longest to get straight."`
- Don't: don't "formalize" the prose — cuts make it shorter and plainer, not stiffer. Keep
  voice quirks like "tho".
- Advice: also swap cute placeholder names for the real term once you know it (`sweeper` →
  `retry worker`).

**Rule 4 — Show it, don't describe it, when you can.**
- Do: `bab8ff7` swapped a `// worker does the thing` comment stub for real code, and a
  trade-off paragraph for a 3-row table.
- Don't: leave "elsewhere, a worker does X" as a permanent placeholder.

**Rule 5 — Em dash is for a later pass, and only in casual posts.**
- How to: near-zero in technical/thesis posts (write-ahead-log, design-is-not-taste); heavy in
  narrative ones (helsinki guide, i-built-my-first-pc).
- Do: `"...suggested I maybe buy a Nintendo Switch, playing games might help"` → `"...— playing
  games might help"` (`2fc3de1`).
- Don't: don't sprinkle dashes into a technical post by default — match the register first.

**Rule 6 — Headings: short noun phrases or full, correct questions.**
- Do: `"Prelim"` → `"Prologue"` · `"Do I happy or regrets? with this decision"` → `"Am I Happy or
  Do I Have Regrets About This Decision?"` (`2fc3de1`)
- Don't: don't leave a heading grammatically broken even if the draft below it is still rough.
- Advice: an emoji at the end is fine and common (💡 🚀 😂), but optional.

**Rule 7 — Bold for thesis/key terms/bullet labels. Italic only for a single word.**
- Do: `"**Before changing stuff, write down what I'm about to do first.**"` · italics:
  `_before_`, `_fast_` — single words, not sentences.
- Don't: don't bold whole paragraphs or italicize a full sentence.

**Rule 8 — Bullets: `- **Term**: explanation`.**
- Do: `"- **Getting the callsite** - Extract..."` → `"- **Getting the callsite**: Extract..."`
  (`f32be06`)
- Don't: don't mix separator styles in the same list.

**Rule 9 — Reader-question asides: `> "question in quotes"` then plain prose. Never `Q: / A:`.**
- Do: `> "What is the data page?"` / `> A data page is..."` (write-ahead-log)
- Don't: no `Q:`/`A:` labels — reads like a FAQ, not a voice. Skip blockquotes entirely in pure
  code-tutorial posts.

**Rule 10 — Tables only for real comparisons (prices, failure modes, itineraries).**
- Don't: most posts have zero tables. Don't add one to look structured.

**Rule 11 — Links are their own last pass, after the prose is done.**
- Do: `19fe97e` on i-built-my-first-pc was link-only, zero prose changes.
- Don't: don't mix link-adding into a heavy rewrite pass.

**Rule 12 — Pick pronouns by mode, before you draft.**
- How to: solo story → "I", barely any "we". Team/process post → "we". Tutorial → "you" +
  "I" for the anecdote.
- Don't: don't default to "we" on a personal post, or "I" on a "how our team works" post.

**Rule 13 — Numerals always.** "2 systems", not "two systems". No exceptions found anywhere.

**Rule 14 — Fix typos and grammar in one batch pass at the end, not as you go.**
- Do: `2fc3de1` fixed a dozen+ typos in one commit ("beacuse" → "because"), separate from the
  structural rework in the same commit. Split long run-on sentences here too.
- Don't: don't over-correct real voice ("tho" stays "tho").
