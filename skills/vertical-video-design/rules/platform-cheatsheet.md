---
name: platform-cheatsheet
description: One-page reference for dimensions, durations, file limits per platform
---

# Platform Cheatsheet

Quick reference for the hard specs per platform. Always check platform docs for latest - these change.

## Dimensions & duration

| Platform | Aspect | Dimensions | Max duration | Min duration |
|---|---|---|---|---|
| TikTok | 9:16 | 1080x1920 | 10 min | 3s |
| Instagram Reels | 9:16 | 1080x1920 | 3 min (180s) | 3s |
| Instagram Feed video | 4:5 or 1:1 | 1080x1350 or 1080x1080 | 60s in feed (longer = Reels) | 3s |
| Instagram Stories | 9:16 | 1080x1920 | 60s per segment | 1s |
| YouTube Shorts | 9:16 | 1080x1920 | 60s (3 min in newer accounts) | 1s |
| YouTube regular | 16:9 | 1920x1080 or higher | 12h | none |
| LinkedIn video | 4:5, 9:16, 1:1 | 1080 wide variable | 10 min (in feed) | 3s |
| Facebook Reels | 9:16 | 1080x1920 | 90s | 3s |
| Twitter/X | varies | 1920x1080 or 1080x1080 | 2:20 (free), longer for paid | 0.5s |
| Pinterest | 2:3 or 4:5 | 1080x1620 or 1080x1350 | 60s (Idea Pins 15-60s) | 4s |

## File format & size

| Platform | Format | Codec | Max file size | Max bitrate |
|---|---|---|---|---|
| TikTok | MP4, MOV | H.264 | 287 MB mobile, 500 MB web | 10 Mbps recommended |
| Instagram Reels | MP4, MOV | H.264 | 4 GB | 8 Mbps |
| YouTube Shorts | MP4, MOV | H.264/265 | 256 GB (standard upload limit) | 12 Mbps |
| LinkedIn | MP4, MOV, WMV | H.264 | 5 GB | 10 Mbps |
| Facebook | MP4, MOV | H.264 | 10 GB | 10 Mbps |

## Safe zone summary (1080x1920)

| Platform | Top avoid | Bottom avoid | Right avoid | Left avoid |
|---|---|---|---|---|
| TikTok | 220px | 350px | 150px | 60px |
| Instagram Reels | 190px | 350px | 140px | 60px |
| YouTube Shorts | 180px | 320px | 120px | 60px |
| LinkedIn | 80px | 200px | 120px | 60px |
| Facebook Reels | 180px | 350px | 140px | 60px |

**Universal safe zone**: keep critical content inside y=220 to y=1520, x=80 to x=1000.

## Recommended export settings

For broadest compatibility across all vertical platforms:

```
Resolution: 1080x1920 (9:16)
Frame rate: 30fps (60fps if needed for sports/gaming)
Codec: H.264
Profile: High
Bitrate: 12-15 Mbps VBR
Audio: AAC, 128-192 kbps, 48kHz stereo
Duration: under 60s covers most platforms
Pixel format: yuv420p
Color: sRGB / BT.709
```

With ffmpeg:
```bash
ffmpeg -i input.mov \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -movflags +faststart \
  output.mp4
```

`+faststart` moves the metadata to the front so it streams immediately - important for "loading..." perception.

## Duration targets (engagement-optimal)

Not platform limits, but where engagement peaks:

| Platform | Sweet spot | Why |
|---|---|---|
| TikTok | 21-34s | Algorithm rewards full-view rate; short = higher completion |
| Instagram Reels | 15-30s | Same as TikTok |
| YouTube Shorts | 30-60s | Slightly longer tolerance; viewers lean-in mode |
| LinkedIn | 30-90s | Professional audience will watch longer if first 5s sells |
| Facebook Reels | 15-30s | Similar to other reels platforms |

**Rule of thumb**: if you can say it in 30 seconds, do. Every second longer, expect engagement drop-off.

## Hashtags & captions (post text)

Not video-design but affects reach:

- **TikTok**: 3-5 hashtags in caption, 150-200 char caption ideal
- **Instagram**: 5-10 hashtags, first 125 chars visible without "more"
- **LinkedIn**: 3 hashtags max, first ~210 chars visible; conversational tone
- **YouTube Shorts**: hashtags in title or description, first 40 chars of title critical
- **Twitter**: 1-2 hashtags, 280 chars total

## Upload quirks

- **TikTok**: upload via web studio for higher quality (mobile compresses more)
- **Instagram**: upload via mobile app; web Reels uploader has hard-coded re-encoding that hurts quality
- **YouTube Shorts**: vertical 9:16 auto-classifies as Shorts. If title includes `#Shorts` it confirms.
- **LinkedIn**: upload from mobile app for best mobile playback quality
- **Facebook Reels**: upload from Creator Studio web

## Platform-specific "gotchas"

- **Instagram Reels** will crop 9:16 to 4:5 when shared to feed - design safe for both
- **LinkedIn mobile** shows 4:5 even if you upload 9:16 - native 4:5 upload avoids this
- **TikTok** adds a visible watermark on downloaded videos (not on platform)
- **YouTube Shorts** requires the exact 9:16 aspect; 9:18 or 10:16 may not classify
- **Facebook / Instagram auto-captions** can be turned off by the user; don't rely on them - burn in your own
