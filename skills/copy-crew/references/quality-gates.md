# Quality Gates

Every piece of content must pass these checks before delivery. Run them in order.

## Gate 1: Slop Detection

Flag and rewrite any sentence containing these words/patterns:

**Banned words (AI tells):**
revolutionary, game-changing, cutting-edge, next-generation, seamless, effortless, robust, powerful, harness, leverage, unlock, empower, elevate, delve, dive in, let's explore, in today's fast-paced world, in an era of, at the end of the day, it's worth noting, importantly, significantly, comprehensive, holistic, synergy, paradigm, ecosystem (as buzzword), innovative, state-of-the-art, world-class

**Banned patterns:**
- Exclamation marks (never use in dev content)
- "Whether you're a [X] or a [Y]" (classic AI pattern)
- "In today's [adjective] world/landscape" (instant credibility loss)
- Three or more adjectives before a noun ("powerful, flexible, scalable framework")
- Sentences starting with "Imagine..." (overused AI opener)
- "Not just X, but Y" repeated pattern
- "At its core..." filler
- "This is where [product] comes in" (cliche transition)

**Replacement strategy:**
- Replace adjectives with specific numbers ("powerful" → "handles 10k requests/sec")
- Replace vague claims with code examples
- Replace marketing transitions with direct statements

## Gate 2: Specificity Check

Every claim must be backed by at least one of:
- A specific number
- A code example
- A personal experience
- A named comparison

**Fail:** "Photon simplifies MCP development."
**Pass:** "Photon turns 200 lines of MCP boilerplate into 12."

**Fail:** "Easy to get started."
**Pass:** "Three commands: install, create, run."

## Gate 3: The Stranger Test

Read every sentence and ask: "Could this sentence appear in a pitch for ANY dev tool?"

If yes, the sentence is generic and must be rewritten to be specific to this product.

**Fail:** "Built for developers, by developers." (could be anything)
**Pass:** "Your TypeScript types become MCP schemas. Your JSDoc becomes the AI's instructions." (only Photon)

## Gate 4: Persona Consistency

Read the full piece aloud. Check:
- Does every sentence sound like it came from the same person?
- Are there sudden shifts to formal/corporate tone?
- Does the opening voice match the closing voice?
- Would the chosen persona actually say this?

## Gate 5: Platform Fit

Check against the platform guidelines in platforms.md:
- Is the format correct? (plain text for HN, markdown for Reddit, etc.)
- Is the length appropriate?
- Does the tone match the community culture?
- Are there any platform-specific no-nos?

## Self-Critique Prompt

After drafting, run this critique before delivering:

```
Read this content as a cynical developer who's seen 1000 "Show HN" posts.
Mark every sentence that:
1. Sounds like AI wrote it (vague, hedging, superlative)
2. Could describe ANY dev tool (not specific to this product)
3. Uses adjectives where numbers would be stronger
4. Would make you scroll past without reading

Rewrite flagged sentences. If a sentence can't be saved, delete it.
Shorter and honest beats longer and generic.
```
