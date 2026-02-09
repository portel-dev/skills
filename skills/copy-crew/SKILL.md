---
name: copy-crew
description: >
  Write marketing copy, launch posts, blog articles, and social content for developer tools
  using persona-driven voice modeling. Use when the user needs to write content for platforms
  like Hacker News, Reddit, Twitter/X, Dev.to, Product Hunt, or LinkedIn. Triggers on requests
  like "write a launch post", "draft a Reddit post", "write a blog post about [product]",
  "help me announce [feature]", "write copy for [platform]", or "marketing content for [tool]".
  Produces authentic, non-generic content by adopting the voice patterns of real developer
  marketers rather than default AI writing.
---

# Copy Crew

Write developer tool marketing content that doesn't read like AI wrote it.

## Workflow

### 1. Gather Context

Before writing, collect:
- **Product:** What does it do? (Get specifics — line counts, commands, metrics)
- **Audience:** Who reads this platform? What do they already know?
- **Goal:** Launch announcement? Tutorial? Community reply? Hot take?
- **Voice sample:** Does the user have existing writing to match? (README, previous posts)

### 2. Select Persona

Choose from [references/personas.md](references/personas.md):

| Content Type | Recommended Persona |
|---|---|
| HN "Show HN" | Paul Graham or Patrick McKenzie |
| Reddit (dev subs) | DHH or Pieter Levels |
| Reddit (AI/MCP subs) | Patrick McKenzie or Pieter Levels |
| Blog post / tutorial | Patrick McKenzie or Adam Wathan |
| Twitter/X thread | Pieter Levels or Guillermo Rauch |
| Product launch | Guillermo Rauch or Adam Wathan |
| LinkedIn | Guillermo Rauch |
| Hot take / opinion | DHH |
| Building in public | Pieter Levels or Adam Wathan |

If the user names a persona, use it. Otherwise recommend one and confirm.

### 3. Select Framework

Choose from [references/frameworks.md](references/frameworks.md):

| Goal | Framework |
|---|---|
| Short announcement | PAS |
| Before/after comparison | Before/After/Bridge |
| Product launch | AIDA |
| Community reply | One Reader |
| Hacker News post | Show HN Formula |
| Ongoing updates | Building in Public |
| Blog / long-form | Problem Tutorial |

### 4. Check Platform Rules

Read the target platform's section in [references/platforms.md](references/platforms.md). Adapt format, tone, and length.

### 5. Draft

Write using the selected persona's voice and framework's structure. Include:
- Real code examples or specific numbers (never vague claims)
- At least one honest limitation or admission
- A clear single CTA (link, command, or question)

### 6. Quality Gates

Run every draft through all 5 gates in [references/quality-gates.md](references/quality-gates.md):
1. Slop detection — rewrite banned words/patterns
2. Specificity check — every claim needs a number, code, or story
3. Stranger test — no sentences that could describe any dev tool
4. Persona consistency — voice doesn't shift mid-piece
5. Platform fit — format matches platform norms

### 7. Deliver

Present:
- The final draft
- Persona and framework used
- Flagged items from quality gates for user review
- Suggested posting time if relevant

## Rules

- **Never use banned words.** The list in quality-gates.md is absolute.
- **Specifics over adjectives.** "12 lines" > "simple." "35 photons" > "extensive marketplace."
- **Show code.** Dev content without code is marketing. Developers skip marketing.
- **One piece, one voice.** Never blend personas in a single piece.
- **The opener is everything.** If it sounds like AI, the reader is gone.
- **Shorter is better.** Cut sentences that don't add information.
