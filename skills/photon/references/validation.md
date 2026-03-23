# Photon Validation — Promise Checking

Every photon with a `@ui` tag makes implicit promises through its backend methods. The UI must consume these methods. If a method exists but the UI doesn't use it, that's a gap.

## Automated Promise Check

Run this validation after creating or modifying any photon with `@ui`:

### Step 1: Extract Backend Promises

Parse the `.photon.ts` file for all public methods and their annotations:

```bash
# List all methods with their annotations
grep -E '^\s+(async\s+)?\w+\(' <photon>.photon.ts | grep -v private | grep -v '//'
```

Key signals:
- `@ui <id>` on a method → UI MUST handle this method's result
- `@audience user` → result is for the UI, not the LLM
- `@readOnly` → safe to call on load / auto-refresh
- `@autorun` → UI should call this automatically on open
- No `@internal` → method should be accessible somewhere (UI or CLI)

### Step 2: Extract UI Consumption

Parse the HTML template for method calls:

```bash
# Find which backend methods the UI calls
grep -oE 'window\["[^"]+"\]\.\w+|docsApp\.\w+|app\.\w+' <photon>/ui/<id>.html | sort -u
```

Also check for:
- `window.photon.onResult()` — handles live results
- `window.photon.onEmit()` — handles events
- `window.photon.callTool('methodName', {})` — explicit tool calls

### Step 3: Gap Detection

Compare the two lists. Report:
- **Unconsumed methods**: Backend has them, UI doesn't call them
- **Missing UI controls**: Method exists (e.g., `move`, `reorder`) but no button/interaction triggers it
- **State gaps**: UI doesn't handle all states (empty, loading, error, full)

### Step 4: Functional Testing

For each consumed method, verify it actually works:
1. Open the photon in Beam
2. Use agent-browser to interact with every button/control
3. Verify the backend method is called and the UI updates
4. Test edge cases: empty state, full state, error state

## Promise Documentation

Every photon with `@ui` should have a `## UI Promises` section in its docblock listing what the UI delivers. This becomes the acceptance criteria for validation.

Example:
```typescript
/**
 * Slides — AI-Native Presentation Tool
 *
 * ## UI Promises
 *
 * - Filmstrip sidebar with slide thumbnails
 * - Drag-and-drop to reorder slides
 * - Theme selector dropdown
 * - Fullscreen presentation with scaled slides
 * - Speaker notes editor
 * - Deck picker to switch presentations
 */
```

## Validation Checklist

Before marking any `@ui` photon as done:

- [ ] All public methods are consumed by the UI or have `@internal`
- [ ] All `@audience user` methods have UI controls
- [ ] Empty states are handled (no blank panels)
- [ ] Error states show meaningful messages
- [ ] Loading states have indicators
- [ ] Fullscreen/responsive works
- [ ] All toolbar buttons function
- [ ] File/instance picker works
- [ ] visual-qa scores 90+ with zero false positives
- [ ] Manual click-through of every feature via agent-browser
