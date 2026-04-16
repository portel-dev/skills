---
name: safe-zones
description: Platform-specific exclusion zones where platform UI covers your video
---

# Safe Zones

Every vertical social platform overlays its own UI on top of your video. Content placed in those zones gets covered or clipped. The numbers below are pixel offsets from the edges of a 1080x1920 (9:16) frame.

## The universal safe zone

When in doubt, keep critical content inside this rectangle:

```
1080 x 1920 canvas:

  y=0    +---------------------------+
         |   PLATFORM CHROME ZONE    |  <- avoid critical content
  y=220  +---------------------------+
         |                           |
         |                           |
         |     SAFE CONTENT ZONE     |
         |                           |
         |                           |
  y=1520 +---------------------------+
         |  CAPTIONS + CONTROLS ZONE |  <- avoid critical content
  y=1920 +---------------------------+
                |   |
               x=80 x=1000
```

- **Top 220px (11.5%)**: status bar + platform header + handle overlay
- **Bottom 400px (20.8%)**: platform caption + action buttons + progress bar
- **Left 80px / right 80px**: side padding for comfortable viewing + thumbs
- **Safe content zone**: 920 x 1300 px (roughly the middle 48% of frame area)

If content must extend beyond the safe zone, it should be decorative (background, blur, texture) - never critical.

## Per-platform specifics

### TikTok

- **Top chrome**: ~100px (clock/status) + username overlay starts around 130px
- **Right side buttons** (like, comment, share): right 150px from y=800 to y=1700
- **Bottom caption area**: last 350px
- **Progress bar**: 4px line at y=1916 during scrub
- **Sound attribution**: bottom 80px, left 60%

**Rule of thumb**: keep faces and key info in the middle 60% horizontally, middle 60% vertically.

### Instagram Reels

- **Top chrome**: ~190px (status bar + "Reels" header)
- **Right side action column**: right 140px from y=900 to y=1700 (like, comment, share, save, more)
- **Bottom info**: last 350px (handle, caption, audio)
- **Progress bar**: thin line at top during playback

**Special case**: when shared to Feed, Instagram center-crops to 4:5 (1080x1350). Keep subject vertically centered in the middle 70% to survive both views.

### YouTube Shorts

- **Top chrome**: ~180px (back arrow, search, cast icons)
- **Right side action column**: right 120px from y=1000 to y=1800
- **Bottom title + channel**: last 320px
- **Subscribe button overlay**: bottom 150px center when paused

YouTube re-encodes aggressively. Avoid fine text below 40px.

### LinkedIn (mobile feed)

- **Top chrome**: minimal, ~80px (status bar only - no platform header on video)
- **Bottom caption**: first 3 lines of post text overlay bottom 200px when playing
- **Right side**: like/react/comment/share icons at y=1400-1700, right 120px

LinkedIn often shows **4:5 (1080x1350)** in feed even if you upload 9:16. Design for 4:5 safe zone or export both.

### Facebook Reels

Similar to Instagram Reels. ~180px top, ~350px bottom, right 140px action column.

## Designing around safe zones

Three strategies depending on your content:

### Strategy 1: Letterbox the content

Leave top 12% and bottom 22% as brand-colored bars. Content lives in the middle 66%. Clean but gives up space.

```
[Brand header: logo + location + date]    12%
[                                    ]
[         YOUR CONTENT                ]    66%
[                                    ]
[Brand footer: name + URL]               22%
```

### Strategy 2: Safe-bleed

Content fills the entire frame, but critical elements (faces, captions, CTAs) stay inside the 920x1300 safe zone. Background can bleed to edges.

```
   [         full-bleed background       ]
   |   +---------------------------+   |
   |   |                           |   |
   |   |    faces, text, CTAs      |   |
   |   |                           |   |
   |   +---------------------------+   |
```

### Strategy 3: Platform-specific exports

Export one master at 4:5 (1080x1350). Pad to 9:16 for TikTok/Reels/Shorts. The padding becomes brand color or blurred background of the video itself. This is what most apps (CapCut, Riverside) do by default.

## Verification

After rendering, overlay the safe zone on a sample frame to check:

```bash
# Draw safe zone rectangle on frame 0
ffmpeg -i output.mp4 -vframes 1 -vf \
  "drawbox=x=80:y=220:w=920:h=1300:color=red@0.4:t=3" \
  safe-zone-check.png
```

If faces, key captions, or CTAs land outside the red box, redesign.
