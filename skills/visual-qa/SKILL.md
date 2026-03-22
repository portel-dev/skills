---
name: visual-qa
description: "Automated visual UI issue detection from screenshots. Use EVERY TIME you take a screenshot with agent-browser during UI development. Runs local Qwen3-VL model on Apple Silicon — zero API cost. Catches layout bugs, contrast issues, missing content, alignment problems, and accessibility violations that you'd otherwise miss while focused on one specific fix."
---

# Visual QA — Screenshot Issue Detector

## When to Use

**ALWAYS** run visual-qa after taking any screenshot during UI development or testing. This is non-negotiable — it catches the issues you miss while focused on your specific task.

Trigger on:
- Any `agent-browser screenshot` call
- User says "check the UI", "audit the interface", "what's wrong with this"
- After building or modifying any HTML/CSS/UI code
- Before committing UI changes

## How to Use

### Quick Review (most common)

```bash
# Take screenshot
agent-browser screenshot /tmp/ui-check.png

# Run visual QA via the photon
photon cli visual-qa review --image /tmp/ui-check.png
```

### Before/After Comparison

```bash
# Take before screenshot
agent-browser screenshot /tmp/before.png

# ... make changes ...

# Take after screenshot
agent-browser screenshot /tmp/after.png

# Compare
photon cli visual-qa compare --before /tmp/before.png --after /tmp/after.png
```

### Check Setup

```bash
photon cli visual-qa status
```

## Reading the Output

The review returns a markdown report with:

- **Score** (0-100): A = 90+, B = 75+, C = 60+, D = 40+, F = below 40
- **Issues** sorted by severity:
  - 🔴 CRITICAL — must fix before committing
  - 🟡 WARNING — should fix, noticeable to users
  - 🔵 INFO — minor, nice to fix

## Issue Categories

| Category | What It Catches |
|----------|----------------|
| LAYOUT | Overlapping elements, broken grids, overflow, clipping |
| CONTENT | Empty areas, placeholder text, truncated text, missing icons |
| TYPOGRAPHY | Inconsistent fonts, unreadable text, wrong weight |
| CONTRAST | Low contrast, clashing colors, elements blending in |
| INTERACTIVE | Buttons not looking clickable, unclear affordances |
| SPACING | Inconsistent padding, misalignment, crowding |
| RESPONSIVE | Wrong sizing, horizontal scroll, unfilled space |
| EMPTY_STATE | Missing empty state messages, blank unexplained panels |
| CONSISTENCY | Mixed UI patterns, inconsistent styles |
| ACCESSIBILITY | Missing labels, color-only indicators, tiny targets |

## How It Works

- Runs **Qwen3-VL-8B** locally via MLX on Apple Silicon
- ~5 GB model, inference takes 15-45 seconds per screenshot
- No API calls, no cost, no data leaves the machine
- First run downloads the model (~5 GB one-time)

## Workflow Integration

When you get the issue list back:

1. **Critical issues**: Fix immediately before proceeding
2. **Warnings**: Fix if they're in the area you're working on
3. **Info**: Note for later, don't block current work
4. **New issues from compare**: These are regressions YOU introduced — fix them

Do NOT ignore the output. The whole point is to catch what you miss.

## Prerequisites

```bash
pip install -U mlx-vlm  # One-time setup
```

The model downloads automatically on first use.
