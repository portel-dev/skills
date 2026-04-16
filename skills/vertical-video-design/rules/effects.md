---
name: effects
description: What survives mobile H.264 compression and what falls apart
---

# Effects

Every platform re-encodes your upload to H.264 (usually) at a target bitrate that's much lower than your source. Fine details, subtle gradients, and high-frequency motion get crushed. Design for what survives the pipeline.

## What compression eats

H.264 at social-media bitrates (~3-6 Mbps at 1080p) destroys:

- **Fine text smaller than 32px** - becomes blurry mush
- **Subtle gradients** - banding, posterization, especially in skies and dark scenes
- **Fast motion** - blocky artifacts, ghosting
- **Grain and noise** - either amplified (looks dirty) or smoothed away (looks plasticky)
- **Drop shadows with low opacity** - dithers badly, often vanishes
- **Thin lines (1-2px)** - flicker or disappear between frames
- **High-saturation complementary colors together** - chroma bleeding at edges

## What survives

- **Solid colors with clear edges**
- **High-contrast text (white on dark or dark on white)**
- **Motion in the 15-45° range at moderate speed**
- **Large type (48px+)**
- **Crisp transitions** (fade, hard cut, wipe)
- **Single-color gradients over wide areas** (not tight color transitions)

## Effect guide

### Works well

**Spring-based scale entrance**
```tsx
scale: spring({ frame, fps, config: { damping: 15, stiffness: 100 } })
// Goes from 0.9 to 1.0 with natural motion
```
Natural, draws eye, survives compression. Use 0.5-1.0s duration.

**Slide-up + fade**
```tsx
translateY: interpolate(frame, [0, 18], [30, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1) })
opacity: interpolate(frame, [0, 18], [0, 1])
```
Clean UI entrance. Works for captions, cards, any UI element.

**Crossfade between scenes**
Simple opacity interpolation between two full-frame scenes. No artifacts.

**Ken Burns zoom on static images**
Slow scale from 1.0 to 1.05 over 3-5 seconds. Adds life to stills without obvious motion artifacts.

**Solid-color background panels with subtle border**
High contrast, survives compression, looks professional.

### Works with caveats

**Light leaks / lens flares**
Only if they're LARGE and SLOW. Fast tiny light leaks pixelate.

**Glow effects (box-shadow spread)**
Work on contrasty colors against dark backgrounds. Fail on busy backgrounds - get crushed.

**3D perspective tilts**
Fine IF the tilt is big (10-15deg) and slow. Subtle tilts (1-2deg) are invisible after compression.

**Floating / drift motion**
`translateY: sin(frame) * amplitude`. Works if amplitude is 4-8px, not 1-2px. Tiny drifts disappear.

**Parallax layers**
Different layers moving at different speeds. Works if layers are distinct; fails if layers are similar brightness.

### Avoid

**Motion blur**
H.264's own temporal compression adds blur; adding more makes everything mush.

**Drop shadows with low opacity (< 30%)**
Get dithered to nothing. Either go strong (50%+) or skip.

**Thin 1-2px borders**
Flicker between frames. Use 3px minimum.

**Particle systems**
Hundreds of tiny moving elements = compression nightmare. Use sparingly or go large-scale.

**Noise / grain texture overlays**
Either get amplified and look dirty, or smoothed out. Same as film grain - skip.

**Glitch / VHS / chromatic aberration effects**
These *look* like compression artifacts, so real compression makes them indistinguishable from corruption.

**Subtle bloom / glow passes**
Get crushed entirely. Use strong glow or none.

**Rapid color cycling / strobing**
Both look bad and trigger accessibility flags on some platforms.

## Specific techniques

### Safe zoom/pan on images (Ken Burns)

```
Scale: 1.0 -> 1.05 over duration
Translate: (0, 0) -> (20px, -10px) over duration
Easing: linear or very slow ease
```

Subtle, always readable, adds motion to stills.

### Safe scene transition (0.5s max)

```tsx
<TransitionSeries.Transition
  presentation={fade()}
  timing={linearTiming({ durationInFrames: 15 })}
/>
```

Don't go over 15 frames (0.5s) for cuts. Longer fades drag pacing.

### Text emphasis that survives

Instead of text shadow or glow for emphasis, use:
- **Color swap**: neutral text becomes accent-colored on the word
- **Scale pulse**: 1.0 -> 1.05 -> 1.0 over 0.4s on the word
- **Underline draw-in**: line grows under the emphasized word

These are structural changes that compression preserves.

## Color considerations

Vertical video platforms re-encode to BT.709 sRGB. If your source is wider-gamut (DCI-P3, ProRes), colors shift visibly. To avoid this:

1. Work in sRGB from the start if you're ever exporting to social
2. Avoid ultra-saturated neons - they shift most
3. Test on actual phone playback before shipping (not just desktop preview)

## Bitrate & resolution strategy

Export at higher bitrate than needed. Platform re-encode will degrade it. If you export at platform's exact target bitrate, you're already at their encoded quality before their pass, then their pass compounds the loss.

Rule: export 1080p at 12-18 Mbps even though TikTok will re-encode to ~4 Mbps. The higher source gives their encoder more information to preserve details.

## Testing

For any effect you're unsure about, render a 5-second test and upload it to the target platform (private/draft). Compare with the original:

- Play both at phone size
- Watch for the effect you designed
- If you have to squint to see it, simplify or scale up

On-device testing catches issues that desktop preview hides.
