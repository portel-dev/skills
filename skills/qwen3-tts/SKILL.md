---
name: qwen3-tts
description: Generate high-quality voiceover audio using Qwen3 TTS on Apple Silicon via MLX
license: Apache 2.0
---

# Qwen3 TTS (MLX)

Text-to-speech generation on Apple Silicon using Qwen3 TTS models via the `mlx-audio` Python library.

## Quick Start

```python
import numpy as np
import soundfile as sf
from mlx_audio.tts.utils import load

model = load("mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-bf16", fix_mistral_regex=True)

results = list(model.generate_custom_voice(
    text="Hello world, this is a test.",
    speaker="Ryan",
    language="English",
    instruct="Casual and conversational tone.",
    temperature=0.3,
    max_tokens=250,
))

audio = np.array(results[0].audio)
sf.write("output.wav", audio, 24000)
```

## Installation

```bash
pip install mlx-audio>=0.3.1 soundfile numpy
```

Use mlx-audio **0.3.1+** — earlier versions have silence bugs with quantized models.

## Model Types (Critical)

Three model types exist. Choosing the wrong one is the #1 source of problems.

### Base — Voice Cloning

```
mlx-community/Qwen3-TTS-12Hz-0.6B-Base-8bit
```

Clones a voice from a reference audio file. No emotion control.

```python
model = load("mlx-community/Qwen3-TTS-12Hz-0.6B-Base-8bit")

results = list(model.generate(
    text="Your text here.",
    ref_audio="reference.wav",      # 10-15s WAV, mono
    ref_text="Transcript of the reference audio.",
    temperature=0.3,
    max_tokens=800,
))
```

**When to use**: You have a specific voice you need to match.

### CustomVoice — Preset Voices + Emotion

```
mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-bf16
```

9 preset voices with emotion/style control via `instruct`.

```python
model = load("mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-bf16", fix_mistral_regex=True)

results = list(model.generate_custom_voice(
    text="Your text here.",
    speaker="Ryan",           # Aiden, Vivian, Aria, Nova, etc.
    language="English",
    instruct="Warm and conversational. Relaxed, natural cadence.",
    temperature=0.3,
    max_tokens=800,
))
```

**When to use**: You want consistent voice with per-segment emotion control.

**Speakers**: Ryan, Aiden, Vivian, Aria, Nova, Daniel, Emily, Alloy, Echo

### VoiceDesign — Voice from Text Description

```
mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16
```

Creates a voice purely from a text description. **Ignores `ref_audio` entirely** — do NOT use this for voice cloning.

```python
model = load("mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16", fix_mistral_regex=True)

results = list(model.generate_voice_design(
    text="Your text here.",
    instruct="Deep male voice, warm timbre, slow delivery.",
    temperature=0.3,
    max_tokens=800,
))
```

**When to use**: You want to design a custom voice from a description. Voice will vary between generations.

## Key Parameters

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| `temperature` | Randomness. Lower = more consistent | `0.3` |
| `max_tokens` | Max audio length. At 12Hz: 250 tokens ≈ 20s | Scale to content |
| `instruct` | Emotion/style instructions (CustomVoice, VoiceDesign) | Per-segment |
| `speaker` | Preset voice name (CustomVoice only) | `"Ryan"` for deep male |
| `ref_audio` | Reference WAV path (Base only) | 10-15s mono WAV |

**`speed` parameter does NOT work with CustomVoice** — control pace via `instruct` text.

### max_tokens Guidelines

At 12Hz codec rate:
- 250 tokens ≈ 20 seconds of audio
- 800 tokens ≈ 65 seconds
- 1200 tokens ≈ 100 seconds

**Always set max_tokens explicitly.** Default is 4096, which can produce 5+ minute hallucinated audio.

## Instruct Patterns (CustomVoice)

### Voice Base Prompt

Combine a voice description with per-segment emotion:

```python
VOICE_BASE = (
    "Very deep, bass-heavy male narrator with a rich, resonant low end. "
    "Warm and mellow timbre, subtle gravel. "
    "Minimal brightness, no sharp sibilance."
)

# Per-segment emotion appended to base
instruct = f"{VOICE_BASE} Casual and conversational. Relaxed, natural cadence."
```

### Emotion Examples

| Emotion | Instruct Text |
|---------|--------------|
| Casual | `"Casual and conversational. Like explaining something to a friend over coffee. Relaxed, natural cadence."` |
| Warm humor | `"Conversational and warm. A touch of dry humor. Builds to a calm, confident conclusion."` |
| Direct | `"Steady and grounded. Clear and direct. Natural cadence, not dramatic."` |
| Punchy CTA | `"Strong and memorable. Each phrase is its own beat. Slow, deliberate, with weight on every word."` |

**Avoid over-dramatic instructs** — phrases like "sardonic", "exasperated", "dramatic pause" produce unnatural results. Keep it conversational.

## Audio Post-Processing

### Strip Leading/Trailing Silence

Qwen3 TTS generates significant leading silence (up to 5s) and trailing silence (up to 17s).

```python
import numpy as np

def clean_audio(audio: np.ndarray, sr: int = 24000) -> np.ndarray:
    """Strip leading/trailing silence. Leave internal pacing intact."""
    threshold = 0.002
    abs_audio = np.abs(audio)
    voiced = np.where(abs_audio > threshold)[0]
    if voiced.size == 0:
        return audio
    pad = int(0.05 * sr)
    start = max(0, voiced[0] - pad)
    end = min(len(audio), voiced[-1] + 1 + pad)
    return audio[start:end]
```

### Compress Internal Silence Gaps

After trimming, compress excessive internal pauses:

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

**Important**: Use a low threshold (0.005) for gap detection. Speech has lots of low-amplitude content between syllables — using 0.01+ will destroy speech content.

### Combine Segments

```python
segments = []
for name, gap_after in [("act1", 1.0), ("act2", 1.0), ("act3", 1.0), ("cta", 2.0)]:
    audio, sr = sf.read(f"vo/{name}.wav")
    segments.append(audio.astype(np.float32))
    segments.append(np.zeros(int(gap_after * 24000), dtype=np.float32))

combined = np.concatenate(segments)
sf.write("vo/combined.wav", combined, 24000)
```

## Known Issues & Workarounds

### Text Truncation (Long Text)

The model swallows the end of long text passages. Symptoms: last sentence or paragraph missing from audio.

**Workarounds**:
1. Increase `max_tokens` (e.g., 1200 for 30+ second segments)
2. Split long text into shorter segments
3. For very short phrases separated by periods, generate each phrase individually and stitch

### Short Phrase Truncation (CTA Problem)

Period-separated short phrases like `"Photon. One file. Every way."` frequently lose the last word.

**Solution**: Generate each phrase individually and stitch with silence gaps:

```python
phrases = ["Photon.", "One file.", "Every way.", "You're welcome."]
parts = []

for phrase in phrases:
    results = list(model.generate_custom_voice(
        text=phrase,
        speaker="Ryan",
        language="English",
        instruct="Strong and deliberate. Weight on every word.",
        temperature=0.3,
        max_tokens=100,
    ))
    audio = clean_audio(np.array(results[0].audio))
    parts.append(audio)
    parts.append(np.zeros(int(0.35 * 24000), dtype=np.float32))

cta = np.concatenate(parts)
```

### Voice Inconsistency Between Segments

**Cause**: Different generation calls produce slightly different voices.

**Solutions**:
1. Use `temperature=0.3` (lower = more consistent)
2. Generate longer segments (one per act) rather than many short ones
3. Use the same `instruct` base across all segments
4. CustomVoice is more consistent than VoiceDesign across generations

### VoiceDesign Ignores Reference Audio

VoiceDesign model **does not clone voices**. It designs a new voice from the `instruct` text each time. If you need voice cloning, use the **Base** model.

### KeyError: 'default' in ROPE

If you get `KeyError: 'default'` in `ROPE_INIT_FUNCTIONS`, this is a version incompatibility with the standard Qwen3 engine. Use `Qwen3MLXEngine` via `mlx_audio.tts.utils.load()` instead of the raw transformers engine.

## Complete Voiceover Pipeline

### Step 1: Generate Segments

```python
# generate_vo.py
import os, time, numpy as np, soundfile as sf
from mlx_audio.tts.utils import load

SR = 24000
MODEL_ID = "mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-bf16"

VOICE_BASE = (
    "Very deep, bass-heavy male narrator with a rich, resonant low end. "
    "Warm and mellow timbre, subtle gravel. "
    "Minimal brightness, no sharp sibilance."
)

SEGMENTS = [
    ("act1", "Your act 1 text...", "Casual and conversational.", 1200),
    ("act2", "Your act 2 text...", "Warm with dry humor.", 800),
    ("act3", "Your act 3 text...", "Steady and direct.", 800),
]

model = load(MODEL_ID, fix_mistral_regex=True)

for name, text, emotion, max_tokens in SEGMENTS:
    instruct = f"{VOICE_BASE} {emotion}"
    results = list(model.generate_custom_voice(
        text=text, speaker="Ryan", language="English",
        instruct=instruct, temperature=0.3, max_tokens=max_tokens,
    ))
    audio = clean_audio(np.array(results[0].audio))
    sf.write(f"vo/{name}.wav", audio, SR)
```

### Step 2: Compress Silence

```bash
python compress_silence.py
```

### Step 3: Listen & Iterate

- Check each segment individually before combining
- Re-generate specific segments that sound off
- Adjust `instruct` text if tone is wrong
- Increase `max_tokens` if text is being truncated

## Sample Rate

All Qwen3 TTS models output at **24000 Hz** (24kHz). Always use `sr=24000` when reading/writing.

## See Also

- [mlx-audio documentation](https://github.com/Blaizzy/mlx-audio)
- [Qwen3 TTS model cards on HuggingFace](https://huggingface.co/Qwen)

## License

Apache 2.0
