---
name: captions
description: Caption sizing, placement, timing, and styling for mobile vertical video
---

# Captions & Subtitles

85% of people watch social video with sound off. Captions are the primary channel. Treat them as a design element, not an afterthought.

## Sizing

On a 1080x1920 canvas (9:16):

| Element | Minimum | Recommended | When to use larger |
|---|---|---|---|
| Main caption text | 36px | 44-52px | Single-word emphasis moments |
| Secondary / context | 28px | 32-36px | Attribution, timestamps |
| Big statement hook | 64px | 72-96px | First-second thumb-stopper |
| Maximum practical | - | 120px | One or two words only |

**Test**: view at phone size. If you need to squint, it's too small.

## Character count per line

Long caption lines look like walls of text on phones. Hard limits:

- **40 chars per line absolute max** (including spaces)
- **28-32 chars ideal** for comfortable reading
- **Max 2-3 lines visible at once**

If a sentence runs longer, chunk it into multiple captions synced to natural speech pauses. Don't scroll - cut.

### Example

Bad (raw Whisper output):
```
"I am suggesting a new approach where the API stays portable as an executable unit and then the runtime automatically converts it"
```

Good (chunked for mobile):
```
Caption 1: "A new approach"
Caption 2: "APIs as portable units"
Caption 3: "Runtime does the rest"
```

## Placement

### The bottom-third rule

Captions live in the bottom third of the frame but above the platform's caption zone.

On 1080x1920:
- **Top of caption block**: y=1200 to y=1400
- **Bottom of caption block**: max y=1520 (anything below gets covered by platform UI)
- **Horizontal**: centered, with left/right margins of 60px each (content width max 960px)

### Why not center or top

- **Center**: covers faces, looks amateur
- **Top**: platform handle/header overlays this area
- **Bottom exact edge**: platform caption and progress bar cover it

Bottom-third is the goldilocks zone - visible but out of the way.

## Styling

### Font

Use one of these three patterns, never mix:

1. **Bold sans-serif, white on semi-dark background** (highest contrast, default)
2. **Bold sans-serif with drop shadow** (no background, works on busy video)
3. **All-caps condensed** (TikTok style, good for energetic content)

Good fonts: Inter, SF Pro, Space Grotesk, Helvetica Neue Bold, Roboto Bold. Never serif - serifs disintegrate on mobile.

### Weight and color

- **Weight**: 600-700 (bold). Regular weight disappears against video.
- **Color**: pure white `#ffffff` - not off-white. Platforms compress to sRGB; subtle tints get clipped.
- **Accent color**: pick one (one!) accent for emphasized words. Magenta, green, yellow work well on dark bg.

### Background

Every caption needs a contrast solution. Pick one:

**Option A: Semi-transparent background box**
```
background: rgba(0, 0, 0, 0.7);
padding: 16px 24px;
border-radius: 12px;
```

**Option B: Strong text shadow**
```
text-shadow: 0 4px 12px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7);
```

**Option C: Solid-color block behind text** (TikTok style)
```
background: #000;
padding: 8px 16px;
/* text is white */
```

Never render captions directly on video without any contrast treatment. On bright frames they disappear.

## Timing

### Duration per caption

| Word count | Minimum duration | Comfortable duration |
|---|---|---|
| 1-2 words | 0.8s | 1.2s |
| 3-5 words | 1.4s | 2.0s |
| 6-10 words | 2.0s | 3.0s |
| 10+ words | split it, don't hold longer |

**Never hold a caption less than 0.6 seconds** - viewers can't read that fast.

### Sync to speech

Caption should appear slightly BEFORE the word is spoken, not after. Human reading lags audio by ~200ms. Pre-roll captions by about 10-15 frames at 30fps.

If using Whisper word timestamps:
```
Start caption at (first_word_start - 0.15s)
End caption at (last_word_end + 0.3s)
```

### Avoid the "caption flash"

Don't have a caption appear for 0.3s then disappear - the flash is disorienting. If a phrase is too short, merge with the next one or hold the previous one longer.

## Animation

Keep caption motion minimal. Purpose of motion: draw the eye, don't distract.

### Good animations

- **Fade + slide up 8-12px** on enter (0.2-0.3s, ease-out)
- **Fade + slide down 8-12px** on exit (0.15-0.2s, ease-in)
- **Word-by-word reveal** (each word fades in as spoken, "karaoke" style)
- **Scale up 5-8%** on the emphasized word

### Bad animations (avoid)

- **Typewriter effect** for captions (too slow, looks gimmicky for speech)
- **Bounce / elastic** entrance (distracting)
- **Rotation** of any kind (never)
- **Color cycling** (nauseating)
- **Per-letter reveal** (too busy for speech captions; OK for single-word titles)

## Multi-language and accessibility

If targeting international: burn English captions in (not closed captions), but also upload SRT for the platform's accessibility layer. Platforms show CC overlay on top of burned captions which creates duplicates - warn users in description.

For RTL languages (Arabic, Hebrew): anchor text right-aligned, use fonts that support bidi properly (Noto Sans, Inter). Test the actual render - lots of fonts ship broken RTL.

## Verification before export

For every caption in the video, ask:

1. Can I read it at 3 inches (actual phone distance)?
2. Is it inside y=1200-1520 vertically?
3. Is text width under 960px (margin 60px each side)?
4. Does it have a contrast treatment (box, shadow, or solid bg)?
5. Is timing at least 0.6s but under 3s?
6. Does it sync ~150ms before speech?

If any answer is no, fix before rendering.
