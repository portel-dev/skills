---
name: hooks
description: First-second attention rules for muted autoplay on vertical feeds
---

# Hooks (The First Second)

On vertical feeds, the viewer is scrolling. Your video auto-plays muted. You have roughly 0.8 seconds to make them stop before their thumb flicks again.

## The muted autoplay problem

| Fact | Consequence |
|---|---|
| Sound is off by default | Audio hooks don't work |
| First frame is often the thumbnail | A static title card = boring thumbnail = no stop |
| Scroll velocity is fast | Subtle motion gets missed |
| Attention budget is ~800ms | Intro logos burn attention you don't have |
| Recovery is impossible | If they scroll past, they're gone forever |

## What actually stops thumbs

Based on analysis of top-performing product launch videos (v0, Linear, Cursor, Raycast, Loom):

### 1. Action-in-progress (strongest)

The viewer catches you mid-action. Examples:

- Cursor typing into a prompt box (v0)
- A UI morphing between states (Cursor)
- A chart growing (data viz)
- Hands demonstrating a physical object
- A face looking directly at the camera mid-sentence

**Why it works**: the brain assumes it missed something and pauses to catch up.

### 2. Pattern interrupt

Something visually unusual against feed norms. A weird angle, unexpected color, flash, jump cut. Use sparingly - cheap pattern interrupts create low-quality signals that hurt reach over time.

### 3. Bold promise / specific number

"I built an MCP server in 8 lines." "$1M in 30 days." Specific numbers stop thumbs more than vague claims.

### 4. Face + direct address

A person speaking straight to camera with a strong opening line. Works because social platforms evolved from video calls; the brain reads it as personal.

### 5. Result shown first, then process

Start with the finished output (a completed app, a rendered chart, a delivered result), then reveal how. Creates curiosity - "how was that made?"

## What doesn't work

### Static title cards

```
"Today we're going to talk about..."
```

Doesn't stop thumbs. Ever. Intros like this are for keynote stages, not feeds.

### Slow logo animations

"[Company Name]" fades in over 2 seconds. By the time it settles, they've scrolled twice. Ship the logo as a persistent top bar instead if you need branding.

### Voice-over intros

"Hi, I'm Arul, and today..." - sound is off. They don't hear it. The first second is wasted on silence.

### Build-up hooks

Dramatic music swell for 3 seconds before the payoff. Works in TV trailers with a captive audience. On scroll feeds, viewers are gone by second 2.

## Rules for first-second design

1. **First visible frame must have motion or intrigue.** If you pause the video at 0s, it should make someone curious.

2. **If you have to use a title, put it on TOP of motion.** Not a separate title card. The text appears while something visual is already happening.

3. **Lead with the most visually striking moment, then narrate.** The "hook and reframe" pattern: start with result/climax, then show how you got there.

4. **No logos in the first 2 seconds.** Put branding in a persistent top bar or save for the end card.

5. **If silent, captions carry the hook.** The first caption should be your strongest sentence. Big type. Center or bottom-third.

## Hook patterns that work

### Pattern A: Mid-action open

Start at 0s already doing the thing. Don't set up. Don't explain. Just show.

```
Frame 0: Cursor is already typing into a prompt
Frame 15 (0.5s): Result appears
Frame 30 (1s): Cut to reaction or next beat
```

### Pattern B: Result-first reverse

Show the finished, impressive output. Hold 1 second. Then reveal it's simple to make.

```
0-1s: Rendered dashboard / chart / UI (impressive but finished)
1-1.5s: "Built in 8 lines of code"
1.5s+: Show the 8 lines
```

### Pattern C: Bold question

One caption, huge type, provocative question. No setup.

```
Caption at 0s: "Why is Amazon banning AI agents?"
Holds 1.2s. Then show your answer.
```

### Pattern D: Fast 3-beat reveal

Three cuts in first 1.5 seconds, each visually distinct. Doesn't have to make sense yet; creates curiosity.

```
0-0.5s: Close-up of something (what is that?)
0.5-1s: Different angle (oh wait)
1-1.5s: Wide shot that reveals it (ohhh)
```

## For this talk clip example

If building a conference talk clip, DO NOT start with:

- "Great speaking at APIdays yesterday" (caption) over a static photo
- Speaker walking to podium
- Slide title card

DO start with:

- The speaker mid-gesture, already saying the strongest line (captions lead the hook)
- The most memorable visual moment of the talk (the punchline first, not the setup)
- A big-type question that the talk answers

## Testing the hook

Show the first 2 seconds to someone unfamiliar. Ask: "would you keep watching?" If they hesitate, the hook is weak. Iterate on frame 0 until the answer is yes.
