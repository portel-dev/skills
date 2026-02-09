---
name: audio
description: Audio processing pipeline for video production — speech-to-text (Whisper), waveform extraction, audio post-processing, and segment stitching. Pairs with the video skill for audio-synced animations and subtitles.
license: Apache 2.0
---

# Audio Processing

Complete audio pipeline for video production: transcription, waveform analysis, post-processing, and segment management.

For TTS generation, see the [qwen3-tts skill](../qwen3-tts/SKILL.md).

## Tools

### Whisper (Speech-to-Text)

#### Installation

```bash
brew install whisper-cpp
```

Binary installs to: `/opt/homebrew/Cellar/whisper-cpp/<version>/bin/whisper-cli`

#### Models

Download GGML models from HuggingFace:

| Model | Size | Quality | Speed |
|-------|------|---------|-------|
| `ggml-base.bin` | 142MB | Good | Fast |
| `ggml-medium.bin` | 1.5GB | Better | Medium |
| `ggml-large-v3.bin` | 3.1GB | Best | Slow |
| `ggml-distil-large-v3.bin` | 1.5GB | Near-best | Fast |

**Recommended**: `ggml-distil-large-v3.bin` — best quality-to-speed ratio.

Store models in a known location (e.g., `~/Documents/WhisperModels/`).

#### Transcription with Word Timestamps

```bash
whisper-cli \
  -m /path/to/ggml-distil-large-v3.bin \
  -f input.wav \
  --output-json-full \
  -of output_name
```

This produces `output_name.json` with word-level timestamps:

```json
{
  "transcription": [
    {
      "timestamps": { "from": "00:00:00,060", "to": "00:00:04,120" },
      "text": " The best AI tool should work perfectly fine without AI.",
      "tokens": [
        { "text": " The", "timestamps": { "from": "00:00:00,060", "to": "00:00:00,220" } },
        { "text": " best", "timestamps": { "from": "00:00:00,220", "to": "00:00:00,520" } }
      ]
    }
  ]
}
```

#### Important: whisper-cli vs whisperkit-cli

- **`whisper-cli`** (from `whisper-cpp`): Uses GGML models. This is what you want.
- **`whisperkit-cli`**: Uses CoreML models (different format). NOT compatible with GGML models.

If you get model loading errors, you're likely using the wrong binary for your model format.

### Processing Whisper Output

#### Converting to Subtitle Segments

Whisper's raw output needs cleanup for subtitle use. Process into clean sentence-level segments:

```python
import json

with open('whisper_output.json') as f:
    data = json.load(f)

segments = []
words = []

for entry in data['transcription']:
    text = entry['text'].strip()
    start = timestamp_to_seconds(entry['timestamps']['from'])
    end = timestamp_to_seconds(entry['timestamps']['to'])
    segments.append({"text": text, "start": start, "end": end})

    for token in entry.get('tokens', []):
        word = token['text'].strip()
        if word and word not in '.,!?;:':
            words.append({
                "word": word,
                "start": timestamp_to_seconds(token['timestamps']['from']),
                "end": timestamp_to_seconds(token['timestamps']['to']),
            })

def timestamp_to_seconds(ts: str) -> float:
    """Convert 'HH:MM:SS,mmm' to seconds."""
    parts = ts.replace(',', '.').split(':')
    return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])

with open('subtitles.json', 'w') as f:
    json.dump({"segments": segments, "words": words}, f, indent=2)
```

#### Splitting Long Segments (Critical)

Whisper frequently produces segments that:
- Span multiple sentences
- Cross scene boundaries
- Are too long for readable subtitles (>5 seconds)

**Always review and split** using word-level timestamps:

```python
def split_segment(segment, words, max_duration=5.0, max_chars=60):
    """Split a long segment at sentence boundaries using word timestamps."""
    if segment['end'] - segment['start'] <= max_duration:
        return [segment]

    # Find sentence boundaries within the segment's time range
    seg_words = [w for w in words
                 if w['start'] >= segment['start'] - 0.1
                 and w['end'] <= segment['end'] + 0.1]

    # Split at periods, question marks, exclamation marks
    new_segments = []
    current_text = []
    current_start = seg_words[0]['start'] if seg_words else segment['start']

    for w in seg_words:
        current_text.append(w['word'])
        if w['word'] in '.?!' or (len(' '.join(current_text)) > max_chars):
            new_segments.append({
                "text": ' '.join(current_text),
                "start": current_start,
                "end": w['end'],
            })
            current_text = []
            current_start = w['end']

    if current_text:
        new_segments.append({
            "text": ' '.join(current_text),
            "start": current_start,
            "end": seg_words[-1]['end'],
        })

    return new_segments
```

**Subtitle guidelines**:
- Max 60 characters per segment
- Max 5 seconds duration
- Split at natural sentence/clause boundaries
- Never let a segment span a scene transition

## Waveform Extraction

Extract per-frame RMS amplitude for audio-reactive video animations.

### Python Script

```python
import numpy as np
import soundfile as sf
import json

audio, sr = sf.read('voiceover.wav')
if audio.ndim > 1:
    audio = audio.mean(axis=1)

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

peak = max(amplitudes) or 1
amplitudes = [round(a / peak, 4) for a in amplitudes]

result = {
    "amplitudes": amplitudes,
    "fps": fps,
    "frames": num_frames,
    "duration_seconds": round(len(audio) / sr, 2),
    "peak_rms": round(peak, 4),
}

with open('waveform.json', 'w') as f:
    json.dump(result, f)

print(f"Extracted {num_frames} frames, duration {result['duration_seconds']}s")
```

### Output Format

```json
{
  "amplitudes": [0.0, 0.0012, 0.0234, 0.1567, ...],
  "fps": 30,
  "frames": 3042,
  "duration_seconds": 101.37,
  "peak_rms": 0.1968
}
```

### Using in Remotion

See the [video skill](../video/SKILL.md) for the `useSmoothedWaveform()` hook.

Key concept: Each scene in a TransitionSeries has local frame numbers. The waveform offset maps scene-local frames to global frames:

```
Scene offsets (cumulative frames accounting for transitions):
  Scene 1: offset = 0
  Scene 2: offset = scene1_frames - transition1_frames
  Scene 3: offset = scene1 + scene2 - transition1 - transition2
```

## Audio Post-Processing

### Strip Leading/Trailing Silence

TTS models (especially Qwen3) generate significant leading silence (up to 5s) and trailing silence (up to 17s).

```python
import numpy as np

def clean_audio(audio: np.ndarray, sr: int = 24000) -> np.ndarray:
    """Strip leading/trailing silence. Leave internal pacing intact."""
    threshold = 0.002
    abs_audio = np.abs(audio)
    voiced = np.where(abs_audio > threshold)[0]
    if voiced.size == 0:
        return audio
    pad = int(0.05 * sr)  # 50ms padding
    start = max(0, voiced[0] - pad)
    end = min(len(audio), voiced[-1] + 1 + pad)
    return audio[start:end]
```

### Compress Internal Silence Gaps

Cap excessive pauses to a maximum duration:

```python
from itertools import groupby

def compress_silence(audio: np.ndarray, sr: int = 24000,
                     threshold: float = 0.005,
                     max_gap: float = 0.30) -> np.ndarray:
    """Cap silence gaps at max_gap seconds."""
    is_silent = np.abs(audio) < threshold
    max_gap_samples = int(max_gap * sr)
    result = []
    pos = 0

    for is_sil, group in groupby(is_silent):
        length = sum(1 for _ in group)
        chunk = audio[pos:pos + length]
        pos += length

        if is_sil and length > max_gap_samples:
            result.append(chunk[:max_gap_samples])
        else:
            result.append(chunk)

    return np.concatenate(result)
```

**Important**: Use threshold `0.005` for gap detection. Higher values (0.01+) will destroy low-amplitude speech content between syllables.

### Combine Segments

Stitch multiple audio segments with controlled gaps:

```python
import numpy as np
import soundfile as sf

SR = 24000

segments = []
for name, gap_after in [("act1", 1.0), ("act2", 1.0), ("act3", 1.0), ("cta", 2.0)]:
    audio, sr = sf.read(f"vo/{name}.wav")
    audio = audio.astype(np.float32)
    audio = clean_audio(audio, sr)
    audio = compress_silence(audio, sr)
    segments.append(audio)
    segments.append(np.zeros(int(gap_after * SR), dtype=np.float32))

combined = np.concatenate(segments)
sf.write("vo/combined.wav", combined, SR)
print(f"Combined: {len(combined)/SR:.1f}s")
```

### Get Audio Duration

```python
import soundfile as sf

audio, sr = sf.read('file.wav')
duration = len(audio) / sr
print(f"{duration:.2f}s")
```

Or with ffprobe:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 file.wav
```

## Complete Pipeline

### 1. Generate TTS Voiceover

See [qwen3-tts skill](../qwen3-tts/SKILL.md) for detailed TTS instructions.

```bash
python generate_vo.py  # Generates individual segment WAVs
```

### 2. Post-Process Audio

```python
# For each segment: trim silence, compress gaps
for f in ['act1.wav', 'act2.wav', 'act3.wav', 'cta.wav']:
    audio, sr = sf.read(f)
    audio = clean_audio(audio, sr)
    audio = compress_silence(audio, sr)
    sf.write(f, audio, sr)
```

### 3. Combine into Final VO

```python
# Stitch with gaps between acts
python combine_segments.py  # → combined.wav
```

### 4. Transcribe with Whisper

```bash
whisper-cli -m ~/Documents/WhisperModels/ggml-distil-large-v3.bin \
  -f combined.wav --output-json-full -of whisper_output
```

### 5. Process Subtitles

```python
python process_subtitles.py  # whisper_output.json → subtitles.json
# MANUALLY review and split long segments!
```

### 6. Extract Waveform

```python
python extract_waveform.py  # combined.wav → waveform.json
```

### 7. Copy to Remotion Project

```bash
cp combined.wav   remotion/public/voiceover.wav
cp subtitles.json remotion/public/
cp waveform.json  remotion/public/
```

## Audio Format Reference

| Source | Sample Rate | Channels | Format |
|--------|------------|----------|--------|
| Qwen3 TTS | 24000 Hz | Mono | WAV float32 |
| Whisper input | Any (resampled internally) | Mono preferred | WAV |
| Remotion Audio | Any | Any | WAV, MP3, AAC |
| Waveform extraction | Match source | Mono (averaged) | — |

## Python Dependencies

```bash
pip install soundfile numpy
```

For the full pipeline with TTS:

```bash
pip install mlx-audio>=0.3.1 soundfile numpy
```

## See Also

- [video skill](../video/SKILL.md) — Remotion video production, audio-reactive animations
- [qwen3-tts skill](../qwen3-tts/SKILL.md) — Detailed TTS generation reference
- [Whisper.cpp documentation](https://github.com/ggerganov/whisper.cpp)
