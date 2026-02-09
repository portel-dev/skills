---
name: video
description: Create programmatic videos using Remotion (React-based video framework). Covers project setup, scene architecture, animations, audio-reactive visuals, subtitle integration, transitions, rendering, and thumbnail generation.
license: Apache 2.0
---

# Video Production with Remotion

Programmatic video creation using Remotion — a React framework for rendering videos with code.

## Quick Start

```bash
npx create-video@latest my-video
cd my-video
npm start          # Preview in browser
npx remotion render src/index.ts CompositionName out/video.mp4
```

## Project Structure

```
src/
  index.ts          # Register compositions
  Root.tsx           # Main composition (TransitionSeries, Audio)
  config.ts          # FPS, dimensions, colors, fonts
  scenes/
    Scene1.tsx       # Each scene is a self-contained React component
    Scene2.tsx
  components/
    Subtitle.tsx     # Subtitle overlay
    Terminal.tsx      # Reusable visual components
  hooks/
    useWaveform.ts   # Audio-reactive animation hook
  transitions/
    custom-wipe.tsx  # Custom transition presentations
public/
  voiceover.wav      # Audio files
  music.mp3
  waveform.json      # Per-frame amplitude data
  subtitles.json     # Whisper-generated subtitle segments
```

## Config Pattern

Centralize all constants in `config.ts`:

```typescript
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const COLORS = {
  bg: '#0a0e1a',
  bgLight: '#111827',
  surface: '#1e293b',
  text: '#f1f5f9',
  textDim: '#94a3b8',
  accent: '#3b82f6',
  accentGlow: '#60a5fa',
  green: '#4ade80',
  red: '#f87171',
  code: {
    bg: '#1a1b26',
    keyword: '#bb9af7',
    string: '#9ece6a',
    func: '#7dcfff',
  },
} as const;

export const FONTS = {
  code: 'JetBrains Mono, Fira Code, monospace',
  sans: 'Inter, system-ui, sans-serif',
} as const;
```

## Composition Architecture

### Main Composition with TransitionSeries

```typescript
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Audio, staticFile, AbsoluteFill } from 'remotion';

export const MyVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Audio layers */}
      <Audio src={staticFile('voiceover.wav')} volume={1} />
      <Audio src={staticFile('music.mp3')} volume={musicVolume} />

      {/* Subtitle overlay — on top of everything */}
      <Subtitle />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={7 * FPS}>
          <Scene1 />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={30 * FPS}>
          <Scene2 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

### Registering Compositions

```typescript
// index.ts (or Root.tsx)
import { Composition } from 'remotion';

export const RemotionRoot = () => (
  <>
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
```

### Duration Calculations with Transitions

Transitions overlap adjacent scenes, reducing total duration:

```typescript
const FADE = Math.floor(FPS * 0.5);       // 15 frames
const TRANSITION = Math.floor(FPS * 0.8); // 24 frames

const DURATIONS = {
  scene1: 7,   // seconds
  scene2: 32,
  scene3: 31,
} as const;

const FRAMES = Object.fromEntries(
  Object.entries(DURATIONS).map(([k, v]) => [k, v * FPS])
);

// Subtract transition overlaps from total
const TRANSITION_DURATIONS = [FADE, TRANSITION, FADE];
const TOTAL = Object.values(FRAMES).reduce((a, b) => a + b, 0)
  - TRANSITION_DURATIONS.reduce((a, b) => a + b, 0);
```

## Scene Patterns

### Multi-Phase Scene

Most scenes have multiple visual phases timed to voiceover:

```typescript
export const MyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phase2Start = 10 * FPS;
  const phase3Start = 18 * FPS;

  // Cross-fade between phases
  const phase1Opacity = interpolate(
    frame, [phase2Start - FPS, phase2Start], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const phase2Opacity = interpolate(
    frame,
    [phase2Start, phase2Start + FPS / 2, phase3Start - FPS, phase3Start],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Phase 1 */}
      <div style={{ position: 'absolute', inset: 0, opacity: phase1Opacity }}>
        {/* ... */}
      </div>

      {/* Phase 2 */}
      <div style={{ position: 'absolute', inset: 0, opacity: phase2Opacity }}>
        {/* ... */}
      </div>
    </AbsoluteFill>
  );
};
```

### Element Entrance Animation

Use `spring()` for natural-feeling entrances:

```typescript
const entrance = spring({
  frame: Math.max(0, frame - startFrame),
  fps,
  config: { damping: 14, stiffness: 100 },
});

// Apply to style
style={{
  opacity: interpolate(entrance, [0, 1], [0, 1]),
  transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
}}
```

### Staggered Entrances

```typescript
const items = ['MCP', 'CLI', 'Beam'];

{items.map((item, i) => {
  const ent = spring({
    frame: Math.max(0, frame - startFrame - i * 15), // 15 frame stagger
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  return (
    <div key={i} style={{
      opacity: interpolate(ent, [0, 1], [0, 1]),
      transform: `translateX(${interpolate(ent, [0, 1], [-60, 0])}px)`,
    }}>
      {item}
    </div>
  );
})}
```

## Audio-Reactive Animations

### Waveform Hook

Extract per-frame amplitude from WAV and use it to drive visual elements:

```typescript
// hooks/useWaveform.ts
import { useCurrentFrame } from 'remotion';
import waveformData from '../../public/waveform.json';

const amplitudes = waveformData.amplitudes as number[];

export function useWaveform(offset = 0): number {
  const frame = useCurrentFrame();
  const idx = Math.min(Math.max(0, Math.floor(frame + offset)), amplitudes.length - 1);
  return amplitudes[idx] ?? 0;
}

export function useSmoothedWaveform(offset = 0, windowSize = 3): number {
  const frame = useCurrentFrame();
  const globalFrame = frame + offset;
  let sum = 0, count = 0;
  for (let i = -windowSize; i <= windowSize; i++) {
    const idx = Math.floor(globalFrame) + i;
    if (idx >= 0 && idx < amplitudes.length) { sum += amplitudes[idx]; count++; }
  }
  return count > 0 ? sum / count : 0;
}
```

### Using Waveform in Scenes

The `offset` parameter maps scene-local frames to global waveform frames:

```typescript
// Scene starts at frame 195 in the global timeline
const waveAmp = useSmoothedWaveform(195);

// Pulse element radius with voice
r={baseRadius + waveAmp * 0.4}

// Glow intensity
textShadow: `0 0 ${waveAmp * 40}px ${COLORS.accent}60`

// Subtle scale
transform: `scale(${1 + waveAmp * 0.03})`

// Conditional glow (only when voice is active)
{waveAmp > 0.2 && (
  <div style={{
    background: `radial-gradient(ellipse, ${COLORS.accent}20, transparent 70%)`,
  }} />
)}
```

### Generating Waveform Data

Use Python to extract per-frame RMS amplitude:

```python
import numpy as np, soundfile as sf, json

audio, sr = sf.read('public/voiceover.wav')
if audio.ndim > 1: audio = audio.mean(axis=1)

fps = 30
samples_per_frame = sr / fps
num_frames = int(len(audio) / samples_per_frame) + 1

amplitudes = []
for i in range(num_frames):
    start = int(i * samples_per_frame)
    end = int((i + 1) * samples_per_frame)
    frame_audio = audio[start:min(end, len(audio))]
    rms = np.sqrt(np.mean(frame_audio ** 2)) if len(frame_audio) > 0 else 0
    amplitudes.append(rms)

# Normalize to 0-1
peak = max(amplitudes) or 1
amplitudes = [round(a / peak, 4) for a in amplitudes]

with open('public/waveform.json', 'w') as f:
    json.dump({"amplitudes": amplitudes, "fps": fps, "frames": num_frames}, f)
```

## Subtitle Integration

### Subtitle Data Format

Generate from Whisper (see **audio** skill) — segments should be sentence-length (2-5 seconds):

```json
{
  "segments": [
    { "text": "The best AI tool should work without AI.", "start": 0.0, "end": 4.12 },
    { "text": "Just you? Maybe your team?", "start": 19.68, "end": 22.2 }
  ]
}
```

**Critical**: Whisper often produces overly long segments that span sentence boundaries. Always review and split manually. Each segment should be one natural phrase/sentence, max ~60 characters.

### Subtitle Component

```typescript
export const Subtitle: React.FC<{ offset?: number }> = ({ offset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = offset + frame / fps;

  const segments = subtitleData.segments as Segment[];
  const active = segments.find(
    (s) => currentTime >= s.start - 0.1 && currentTime <= s.end + 0.3
  );

  if (!active) return null;

  const fadeIn = interpolate(currentTime, [active.start - 0.1, active.start + 0.1], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(currentTime, [active.end - 0.1, active.end + 0.3], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', bottom: 16, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: 30, fontWeight: 500,
        color: '#f1f5f9', background: '#0a0e1aE0',
        padding: '10px 28px', borderRadius: 8,
        opacity: Math.min(fadeIn, fadeOut),
        maxWidth: '85%', textAlign: 'center',
      }}>
        {active.text}
      </div>
    </div>
  );
};
```

**Positioning tip**: Place subtitles at `bottom: 16` (very edge) to avoid overlapping scene content. Keep font size at 28-32px — smaller than you think, since they're on a 1920x1080 canvas.

## Custom Transitions

### Creating a Transition Presentation

```typescript
import { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';

const MyWipeComponent: React.FC<TransitionPresentationComponentProps<{}>> = ({
  children, presentationDirection, presentationProgress,
}) => {
  const isEntering = presentationDirection === 'entering';
  const progress = presentationProgress;

  return (
    <AbsoluteFill style={{
      opacity: isEntering ? progress : 1 - progress,
    }}>
      {children}
    </AbsoluteFill>
  );
};

export const myWipe = (): TransitionPresentation<{}> => ({
  component: MyWipeComponent,
  props: {},
});
```

## Music Volume Envelope

Shape background music volume across the video:

```typescript
const musicVolume = interpolate(
  frame,
  [0,       2*FPS,  3*FPS,  ctaStart, ctaStart+FPS, totalFrames-3*FPS, totalFrames],
  [0,       0.20,   0.10,   0.10,     0.18,         0.18,              0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);

<Audio src={staticFile('music.mp3')} volume={musicVolume} />
```

## Rendering

### Basic Render

```bash
npx remotion render src/index.ts CompositionId out/video.mp4 --overwrite
```

### With Options

```bash
npx remotion render src/index.ts MyVideo out/video.mp4 \
  --overwrite \
  --codec h264 \
  --concurrency 6
```

### Still Frame (for thumbnails)

```bash
npx remotion still src/index.ts MyVideo out/thumbnail.png --frame 90
```

## Thumbnail Generation

For YouTube thumbnails (1280x720), create a standalone HTML file and screenshot with Playwright:

```bash
npx playwright screenshot \
  --viewport-size="1280,720" \
  --wait-for-timeout=1500 \
  "file:///path/to/thumbnail.html" \
  "out/thumbnail.png"
```

Key design principles:
- Match the video's color palette
- Bold wordmark (140px+), readable at small sizes
- Short hook text at top
- 3-4 word tagline
- Badge/pill elements for key features
- Subtle background texture (grid lines, particles, gradients)

## TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "public/**/*.json"]
}
```

**Important**: Include `"resolveJsonModule": true` and `"public/**/*.json"` in `include` to import JSON data files (waveform, subtitles).

## Common Pitfalls

1. **Transition overlaps reduce total duration** — 5 scenes × 30s with 4 transitions of 0.5s = 148s, not 150s
2. **`useCurrentFrame()` is scene-local** — frame resets to 0 for each TransitionSeries.Sequence
3. **Waveform offset must account for transitions** — calculate cumulative frame offset for each scene
4. **Subtitles overlap scene content** — keep subtitles at the very bottom edge (bottom: 16) with small font
5. **Whisper segments are often too long** — always review and split at sentence boundaries
6. **SVG components don't have access to parent scope** — pass reactive values (waveAmp) as props
7. **`spring()` needs `Math.max(0, frame - start)`** — negative frames produce invalid spring values
8. **Font loading in Remotion** — use system fonts or import from Google Fonts via CSS

## See Also

- [Remotion documentation](https://www.remotion.dev/docs)
- [audio skill](../audio/SKILL.md) — TTS generation, Whisper transcription, waveform extraction
- [qwen3-tts skill](../qwen3-tts/SKILL.md) — Detailed Qwen3 TTS reference
