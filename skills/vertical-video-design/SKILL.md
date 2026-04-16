---
name: vertical-video-design
description: Platform-aware design rules for vertical video (Reels, Shorts, TikTok, LinkedIn mobile). Covers safe zones, caption sizing/placement, aspect ratios, thumb-stopper hooks, effects that survive mobile compression, and per-platform cheatsheets. Use when building 9:16 / 4:5 / 1:1 video for social media - any time you need to decide where to place text, how big captions should be, what aspect ratio to export, or which effects survive mobile playback.
---

# Vertical Video Design

Rules for designing vertical video that survives mobile platform chrome, auto-play muted, and small-screen compression.

## Core principle

**The middle 70% is yours. The outer 30% belongs to the platform.** Every vertical platform overlays its own UI on your video - captions, like/share buttons, handle + description, progress bar. If your content lives in that zone, it gets covered.

## When to use

Invoke this skill when:

- Designing any 9:16, 4:5, or 1:1 video for TikTok, Instagram Reels, YouTube Shorts, LinkedIn, Facebook Reels
- Deciding where to place captions, headers, CTAs, or branding
- Building Remotion compositions for vertical output
- Choosing aspect ratio for a new video project
- Reviewing why a video "looks cut off on mobile" or "the caption covers my face"

## Quick reference

For the actual rules, load the relevant file:

- [rules/safe-zones.md](rules/safe-zones.md) - Per-platform exclusion zones. What pixels get covered by the platform's own UI. Start here for every layout.
- [rules/captions.md](rules/captions.md) - Caption sizing, font, placement, timing, max chars per line. How to make burned-in subtitles readable on small screens.
- [rules/hooks.md](rules/hooks.md) - First-second rules for muted autoplay. Why text hooks fail and what works instead.
- [rules/effects.md](rules/effects.md) - What survives mobile H.264 compression and what falls apart. Fine details, gradients, motion blur, etc.
- [rules/aspect-ratios.md](rules/aspect-ratios.md) - When to pick 9:16 vs 4:5 vs 1:1. Cross-posting strategies.
- [rules/platform-cheatsheet.md](rules/platform-cheatsheet.md) - One-page table: dimensions, max duration, safe zone px, file size limits per platform.

## The 60-second checklist

Before exporting any vertical video, verify:

1. **Safe zone respected** - no critical content in top 12% or bottom 20% of the frame
2. **Captions burn-in** - text is large enough to read at phone size, placed in the safe middle
3. **Opens with motion** - first frame is not a static title card (muted autoplay will skip it)
4. **Subject centered or 2/3 rule** - not cropped off by a different-aspect platform resize
5. **Aspect locked** - exporting 9:16 (1080x1920) for TikTok/Reels/Shorts, or 4:5 (1080x1350) for LinkedIn feed video
6. **Audio normalized** - watching muted is default, but audio matters when it plays; use `dynaudnorm` to even out levels
7. **Thumbnail-safe first frame** - many platforms use frame 0 as the thumbnail; make it compelling

## Common mistakes

| Mistake | Why it's bad | Fix |
|---|---|---|
| Captions at very bottom | Platform progress bar covers them | Move captions to bottom third, not last 10% |
| Logo/branding at top-left | Platform handle + description overlays this area | Use top 0-5% only for subtle branding, or center-top |
| Small 24px text | Unreadable on phone screens | Minimum 36px for captions, 48+ preferred |
| Static opening | Muted autoplay doesn't catch attention | Start with motion: cursor, zoom, object moving |
| Single wide text line | Overflows safe zone horizontally | Max 30-35 chars per line, wrap to 2-3 lines |
| Exporting at 720p | Platforms re-encode; start sharp | Export 1080p+ always; platforms downscale better than upscale |
