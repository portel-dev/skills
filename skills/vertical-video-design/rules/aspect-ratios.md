---
name: aspect-ratios
description: When to pick 9:16 vs 4:5 vs 1:1 and cross-posting strategy
---

# Aspect Ratios

Choosing the right aspect ratio matters more than most details. Wrong aspect = your video looks bad on the target platform, regardless of how well it's edited.

## The three vertical aspects

### 9:16 (1080 x 1920)

**Full vertical.** The native shape for:
- TikTok
- Instagram Reels
- YouTube Shorts
- Facebook Reels
- Snapchat

Characteristics:
- Fills entire phone screen
- Maximum visual real estate
- Most immersive
- Gets letterboxed/cropped on non-vertical-first platforms

**Use 9:16 as your default for social-first content.**

### 4:5 (1080 x 1350)

**Tall, not extreme.** The native shape for:
- Instagram Feed video
- LinkedIn feed video (displays as 4:5 on mobile even if you upload 9:16)
- Pinterest videos

Characteristics:
- Takes up ~80% of vertical phone screen
- More forgiving of center-biased framing
- Looks great in feed alongside photos (which are often 4:5)
- Doesn't autoplay-fullscreen like 9:16 does on stories

**Use 4:5 when your primary distribution is LinkedIn or Instagram Feed.**

### 1:1 (1080 x 1080)

**Square.** The legacy shape. Still the native shape for:
- Twitter/X video (some players)
- Instagram feed (older post style)
- LinkedIn feed (works but 4:5 is stronger)

Characteristics:
- Compatible with everything, optimized for nothing
- Safe for cross-posting if you don't want to customize per platform
- Looks dated on phones (feels short)
- Takes up less screen = less attention

**Use 1:1 only if cross-posting to platforms where 4:5 doesn't render.** Otherwise prefer 4:5.

## Platform-native aspect table

| Platform | Native | Feed displays as | Stories/Shorts displays as |
|---|---|---|---|
| TikTok | 9:16 | 9:16 | - |
| Instagram Reels | 9:16 | 9:16 in Reels tab, 4:5 when shared to feed | 9:16 in stories |
| Instagram Feed video | 4:5 | 4:5 | 9:16 if shared to stories |
| YouTube Shorts | 9:16 | 9:16 | - |
| YouTube regular | 16:9 (horizontal) | 16:9 | - |
| LinkedIn video | 9:16, 4:5, 1:1, or 16:9 | Adapts; 4:5 maximizes feed space | - |
| Facebook Reels | 9:16 | 9:16 | - |
| Twitter/X | Flexible | 16:9 gets cropped to 1:1 in feed | - |
| Pinterest | 2:3 or 4:5 | 4:5 | - |

## Choosing your target

Ask two questions:

### 1. Which platform is primary?

If **TikTok / Reels / Shorts**: export 9:16 native.

If **LinkedIn**: export 4:5 native. LinkedIn feeds crop 9:16 awkwardly in mobile web view.

If **Instagram Feed (not Reels)**: export 4:5.

If **cross-posting everywhere**: export 9:16 master, crop to 4:5 for LinkedIn/Feed.

### 2. Does the content have critical edges?

If faces or text are near the top/bottom of your 9:16 frame, they get cropped in 4:5. In that case, design for 4:5 as the master (1080x1350) and add 9:16 padding (top/bottom colored bars or blurred video) for vertical-first platforms.

## Cross-posting strategy

### Option A: One master, multiple exports

Best quality. Most work.

```
Master: 1080x1920 (9:16) with critical content inside 1080x1350 safe zone (4:5)
Export 1: 1080x1920 for TikTok/Reels/Shorts
Export 2: Center-crop to 1080x1350 for LinkedIn/Feed
```

Content stays identical; aspect changes. Takes 2 renders.

### Option B: Single 4:5 with padding

Easier. Slightly worse on 9:16 platforms.

```
Master: 1080x1350 (4:5)
Upload as-is to LinkedIn/Feed
For TikTok/Reels/Shorts: pad top (285px) + bottom (285px) with brand color
```

Looks like a "post" on 9:16 platforms but uses less screen. Works if your brand tolerates letterboxing.

### Option C: Fill-blur pad

Common in auto-reframing tools.

```
Master: 1080x1350 (4:5)
For 9:16: show the 4:5 content centered, fill top+bottom with a blurred, color-shifted version of the video itself
```

Blurred padding adds atmosphere without being empty. Do this if you don't want flat brand bars.

## The letterbox / pillarbox question

If you have a 16:9 source (like a desktop screen recording) and need to go vertical:

**Don't stretch it.** Ever. Looks terrible.

Instead:

### Option 1: Center-crop
Keep the middle 9:16 slice. Works if the important content is horizontally centered.

### Option 2: Top anchor + letterbox
Put the 16:9 video at the top of a 9:16 canvas; use the bottom portion for captions, CTA, brand.

```
[                          ]  y=0
[                          ]
[    16:9 VIDEO            ]  y=607 (max height for 16:9 at 1080 width)
[                          ]
[                          ]  y=1214
[  Captions / CTA / brand  ]  (takes up y=1214-1920)
```

### Option 3: Speaker PiP + slide
What we're doing for the APIdays talk - speaker video cropped to fit, slide as a separate visual element, captions as a third layer. Each element has its own home in the vertical frame.

## Verify aspect before export

Always check your Remotion Composition width/height matches the target:

```tsx
<Composition
  id="MyVideo"
  width={1080}   // 9:16
  height={1920}
  fps={30}
/>
```

Not 1080x1350? Not 1080x1920? Adjust. Getting this wrong means re-rendering after you notice the platform butchered your layout.

## Mistakes to avoid

1. **Exporting 16:9 and hoping** - every vertical platform will mangle it
2. **Mixing aspects in the same video** - Remotion lets you, but platforms don't (they reframe)
3. **Cropping too tight vertically in 9:16** - if you then share to 4:5, you lose more
4. **Designing for 1:1 when 4:5 works** - 4:5 is taller, more screen presence
5. **Using the platform's "reframe" AI tool** - it sometimes crops faces or text; hand-design the crops
