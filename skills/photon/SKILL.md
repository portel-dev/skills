---
name: photon
description: "Build, test, validate, and improve Photon MCPs — single-file TypeScript MCP servers. Use for creating photons with @format annotations (table, chart:bar, slides), stateful photons using this.memory for persistent storage, photons with @readOnly/@destructive annotations, custom UI using @ui tags/HTML templates, photons wrapping APIs (Stripe, payments), task scheduler photons with cron, user-configurable settings (protected settings), this.render() for live output, photon build for standalone binaries, mermaid diagrams for photon architecture, editing .photon.ts files, @auth for MCP OAuth identity (this.caller), identity-aware locks for multiplayer/turn-based photons, @format slides for Marp-style presentations. Also use for validating photon UIs (promise checking, visual QA, functional testing), improving photon quality via autoloop, and auditing whether a UI consumes all backend methods. DO NOT trigger for general TypeScript or non-photon MCP."
---

# Photon Lifecycle Guide

Photons are single-file TypeScript MCP servers. No compilation — runs directly with `tsx`.

## Quick Start

```bash
npm install -g @portel/photon    # Install runtime
photon maker new my-weather      # Create photon
photon beam                      # Launch Beam UI
photon mcp my-weather            # Run as MCP server
photon cli my-weather current --city London  # CLI
```

Files go in `~/.photon/`. See [Directory Structure](references/directory-structure.md) for the full layout. Connect to Claude Desktop:

```json
{ "mcpServers": { "my-weather": { "command": "photon", "args": ["mcp", "my-weather"] } } }
```

## Minimal Photon

```typescript
import { Photon } from '@portel/photon-core';

/**
 * Weather API
 * @version 1.0.0
 * @dependencies axios@^1.0.0
 * @icon 🌤️
 */
export default class Weather extends Photon {
  constructor(private apiKey: string) { super(); }

  /**
   * Get current weather for a city
   * @param city City name {@example London}
   * @readOnly
   * @title Current Weather
   * @format markdown
   */
  async current({ city }: { city: string }): Promise<string> {
    const res = await fetch(`https://api.weather.com/v1/current?q=${city}&key=${this.apiKey}`);
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    const data = await res.json();
    return `**${data.name}** — ${data.temp}°C, ${data.description}`;
  }
}
```

## Core Principles

1. **Return values directly** — no `{ success: true, data }` wrappers. If it returns, it succeeded.
2. **Throw on errors** — let the runtime handle them. Don't catch and wrap.
3. **Single-word method names** — they read as CLI commands: `weather current`, not `weather getCurrentWeather`.
4. **Constructor = config** — constructor params auto-map to env vars: `PHOTON_WEATHER_APIKEY`.

## Class Structure

```typescript
/**
 * Brief description (becomes photon description)
 *
 * @version 1.0.0
 * @runtime ^1.5.0
 * @dependencies package1, package2@^2.0.0
 * @icon 🔧
 * @tags api, utility
 */
export default class MyTool extends Photon {
  constructor(private apiKey: string) { super(); }

  /**
   * Method description (becomes tool description)
   * @param query Search query {@example "typescript"} {@min 1}
   * @readOnly
   * @title Search Items
   * @format table
   */
  async search({ query }: { query: string }) { ... }
}
```

## MCP Annotations

JSDoc tags map to MCP protocol annotations (spec 2025-11-25):

```typescript
/**
 * @readOnly        — no side effects, safe to auto-approve
 * @destructive     — requires confirmation
 * @idempotent      — safe to retry
 * @openWorld       — calls external systems
 * @closedWorld     — local data only
 * @title My Tool   — human-readable display name
 * @audience user   — who sees results: user, assistant, or both
 * @priority 0.9    — content importance (0.0–1.0)
 */
```

**UI-only methods:** Combine `@internal` + `@audience user` for methods the dashboard can call but the LLM never sees:

```typescript
/**
 * Dashboard-only admin panel data.
 * @internal
 * @audience user
 * @readOnly
 */
async metrics() { return { cpu: 42 }; }
```

`@internal` hides from `tools/list`. `@audience user` marks results as human-only. The UI still calls via `window.photon.callTool('metrics', {})`.

## Structured Output

Auto-generated from TypeScript return types — no tags needed:

```typescript
async create(params: { title: string }): Promise<{ id: string; done: boolean }> { ... }
```

For field descriptions, use an interface with JSDoc:

```typescript
interface Task {
  /** Unique identifier */
  id: string;
  /** Whether complete */
  done: boolean;
}
async create(params: { title: string }): Promise<Task> { ... }
```

## Output Formats

Use `@format` to control rendering. Common values:

| Format | Use For |
|--------|---------|
| `table` | Array of objects |
| `list` | Styled list with `{@title name, @subtitle email}` |
| `checklist` | Interactive todo list — `{text, done}[]` with checkboxes, drag reorder |
| `article` | Magazine-style text flow around images — `{text, images?[]}` |
| `markdown` | Rich text, diagrams |
| `slides` | Marp-style presentation deck |
| `chart:bar` / `chart:line` / `chart:pie` | Data visualization |
| `json` | Raw JSON |
| `dashboard` | Composite panels (auto-detected) |

For complete format reference with layout hints, containers, and auto-detection rules, see [references/output-formats.md](references/output-formats.md).

## MCP OAuth & Caller Identity

Use `@auth` for authenticated photons. Enables `this.caller` in every method.

```typescript
/**
 * Multiplayer chess
 * @stateful
 * @auth required
 */
export default class Chess extends Photon {
  players: Record<string, string> = {};

  async join() {
    const slot = !this.players.white ? 'white' : 'black';
    this.players[slot] = this.caller.id;
    if (slot === 'black') {
      await this.acquireLock('turn', this.players.white);
    }
    return { color: slot, name: this.caller.name };
  }

  /** @locked turn */
  async move({ from, to }: { from: string; to: string }) {
    // Only reaches here if this.caller.id holds the 'turn' lock
    const next = this.turn === 'white' ? this.players.black : this.players.white;
    await this.transferLock('turn', next);
    return this.board;
  }
}
```

**`this.caller`:** `{ id, name, anonymous, scope, claims }` — populated from MCP OAuth JWT.

**Identity-aware locks:**
- `this.acquireLock(name, callerId)` — assign lock to a caller
- `this.transferLock(name, toCallerId)` — move lock to another caller
- `this.releaseLock(name)` — release, open to anyone
- `this.getLock(name)` — query who holds the lock
- `@locked` methods auto-check `this.caller.id` against lock holder

## Lifecycle & Hot-Reload

```typescript
// Lifecycle hooks — receive optional context for hot-reload support
async onInitialize(ctx?: { reason?: string; oldInstance?: any }) {
  if (ctx?.reason === 'hot-reload' && ctx.oldInstance) {
    // Transfer non-serializable resources (sockets, timers, connections)
    this.socket = ctx.oldInstance.socket;
    ctx.oldInstance.socket = null; // prevent old instance from using it
    return;
  }
  // Normal first-time initialization
  this.socket = await createConnection();
}

async onShutdown(ctx?: { reason?: string }) {
  if (ctx?.reason === 'hot-reload') {
    return; // DON'T close resources — new instance will take them
  }
  // Real shutdown: clean up everything
  this.socket?.close();
}
```

**Hot-reload rules:**
- `onShutdown({ reason: 'hot-reload' })` → skip resource cleanup
- `onInitialize({ reason: 'hot-reload', oldInstance })` → transfer resources from old instance
- Normal shutdown/init (no context) → full cleanup/setup
- Backward compatible — photons without context param still work

## Events & Channels

```typescript
// Simple emit (local only — goes to current caller's UI)
this.emit({ status: 'processing', progress: 50 });

// Channel emit (cross-photon pub/sub via daemon broker)
// Framework auto-prefixes with photon name: 'messages' → 'whatsapp:messages'
this.emit({ channel: 'messages', type: 'message', data: msg });

// Subscribe to another photon's events (use the full prefixed name)
const broker = getBroker();
const sub = await broker.subscribe('whatsapp:messages', (msg) => {
  // handle message
});
sub.unsubscribe(); // when done
```

**Channel naming:** Emit with simple names (`channel: 'messages'`). The framework auto-prefixes with the photon name. Channels with a colon are left as-is.

## Generator Workflows

```typescript
// Multi-step with user interaction
async *deploy({ env }: { env: string }) {
  yield { emit: 'status', message: 'Deploying...' };
  const ok = yield { ask: 'confirm', message: `Deploy to ${env}?` };
  if (!ok) return 'Cancelled';
  return 'Done';
}

// Waiting for external async events (WebSocket, library callbacks, etc.)
async *connect() {
  yield { emit: 'status', message: 'Connecting...' };
  let resolve: (v: any) => void;
  const promise = new Promise(r => { resolve = r; });
  this.socket.on('ready', (data) => resolve(data));
  await this.initSocket();
  const event = await promise;  // blocks until external event fires
  yield { emit: 'toast', message: 'Connected!', type: 'success' };
  return event;
}
```

## Scoped Memory

Zero-config persistent storage via `this.memory`:

```typescript
await this.memory.set('key', value);              // photon scope (default)
const val = await this.memory.get<T>('key');
await this.memory.set('shared', data, 'global');   // cross-photon
```

Three scopes: `photon` (private), `session` (per-user), `global` (shared). Full API: `get`, `set`, `delete`, `has`, `keys`, `clear`, `getAll`, `update`.

## Runtime Scheduling

Dynamic task scheduling via `this.schedule` — complements static `@scheduled`/`@cron` tags:

```typescript
// Create a scheduled task at runtime
await this.schedule.create({
  name: 'nightly-cleanup',
  schedule: '0 0 * * *',       // 5-field cron or @daily, @hourly, @weekly, @monthly
  method: 'purge',
  params: { olderThan: 30 },
});

// Manage tasks
await this.schedule.pause(id);
await this.schedule.resume(id);
await this.schedule.cancel(id);
const tasks = await this.schedule.list('active');
```

Full API: `create`, `get`, `getByName`, `list`, `update`, `pause`, `resume`, `cancel`, `cancelByName`, `cancelAll`, `has`. Tasks persist to disk; the daemon executes them.

Use `@scheduled`/`@cron` for fixed schedules known at build time. Use `this.schedule` for dynamic schedules created at runtime (user-configured intervals, conditional jobs, etc.).

## User Settings

Expose configurable options via `protected settings`. Runtime auto-generates a settings tool and persists to disk:

```typescript
export default class MyAgent extends Photon {
  protected settings = {
    /** Polling interval in ms */
    pollIntervalMs: 5000,
    /** Max concurrent operations */
    maxConcurrent: 3,
    /** Auto-resume after restart */
    autoResume: true,
  };

  async doWork() {
    const interval = this.settings.pollIntervalMs; // read-only Proxy
  }
}
```

Users change settings via CLI (`photon cli my-agent settings`). Values persist to `~/.photon/state/<name>/<instance>-settings.json`.

## Live Rendering *(v1.14+)*

`this.render(format, value)` pushes formatted output that replaces the previous render zone (instead of appending):

```typescript
export default class Monitor {
  async status() {
    while (true) {
      const metrics = await this.collectMetrics();
      this.render('table', metrics);  // Replaces previous output
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}
```

Accepts the same format values as `@format` tags. Call `this.render()` with no arguments to clear the render zone.

## Compile to Binary *(v1.13+)*

Build standalone executables from any photon — no Node.js required on the target machine:

```bash
photon build my-tool                         # Binary for current platform
photon build my-tool -t bun-linux-x64        # Cross-compile for Linux
photon build my-tool --with-app              # Embed Beam UI as a desktop app
```

Uses Bun's compiler. The binary bundles the photon, its `@dependencies`, and transitive `@photon` deps.

## Installing Photons

### `photon add` — Install a photon

```bash
photon add claw                        # Search all marketplaces by name
photon add my-marketplace/claw         # From a specific marketplace
photon add Arul-/photons/claw          # From a GitHub repo (owner/repo/name)
```

If a photon has `@photon` dependencies, they are **auto-installed** from the same source recursively.

### `photon beam` / `photon cli` — Run directly from GitHub

```bash
photon beam Arul-/photons/claw         # Install + open in Beam
photon cli Arul-/photons/todo add      # Install + run method
```

### Manage marketplaces

```bash
photon marketplace add Arul-/photons   # Add a GitHub repo as marketplace source
photon marketplace update              # Refresh all marketplace caches
photon marketplace list                # Show configured marketplaces
```

## Custom UIs

Link HTML files as interactive result renderers:

```typescript
/** @ui dashboard */
export default class MyApp extends Photon {
  /** @ui dashboard */
  async getData({ range }: { range: string }) { return { metrics: 42 }; }
}
```

**Convention:** `@ui <id>` resolves to `<photon>/ui/<id>.html`. The id MUST match the HTML filename.

```
@ui dashboard  → my-app/ui/dashboard.html  ✓
@ui slides     → slides/ui/slides.html     ✓
```

Text after the id is treated as a description, NOT a file path.

The UI gets a photon-named global proxy: `window.myApp.getData(...)`, `window.myApp.onResult(...)`.

For full MCP Apps guide, see [references/mcp-apps.md](references/mcp-apps.md).

## Directory Structure

Photon separates **source/assets** from **runtime data** under `~/.photon/`:

```
~/.photon/
├── <name>.photon.ts        # Source (or symlink)
├── <name>/                 # Assets (@ui templates, images)
├── state/<name>/           # Runtime: this.memory, settings (automatic)
├── data/<name>/            # Runtime: photon-written files (manual)
├── cache/                  # Runtime: compiled .mjs cache
└── logs/<name>/            # Runtime: execution logs
```

**Key rule:** Photons that write runtime files (auth tokens, downloaded media, databases) MUST use `~/.photon/data/<name>/`, never `~/.photon/<name>/`. The asset folder is watched for hot-reload — writing there causes reload loops.

```typescript
// Correct: runtime data goes in data/<name>/
const dataDir = path.join(os.homedir(), '.photon', 'data', 'my-app');

// Wrong: asset folder triggers hot-reload!
const dataDir = path.join(os.homedir(), '.photon', 'my-app', 'downloads');
```

For the full convention, see [Directory Structure](references/directory-structure.md).

## Validating Photon UIs — Promise Checking

Every `@ui` photon makes implicit promises through its backend methods. The UI must deliver on them.

### The Principle

A photon's backend methods are its capabilities. The UI is the interface to those capabilities. If a method exists but the UI has no way to trigger it, that's a broken promise.

Three signal levels:

| Signal | Meaning |
|--------|---------|
| `@ui <id>` on a method | This method's result is rendered by the UI — the UI MUST handle it |
| `@audience user` | Result is for the human, not the LLM — the UI SHOULD surface it |
| Public method (no `@internal`) | Capability exists — the UI or CLI should make it accessible |

If a method is public but the UI doesn't use it, either:
- Add a UI control for it, or
- Mark it `@internal` to be honest about what's exposed

### Promise Documentation

Every `@ui` photon should have a `## UI Promises` section in its class docblock:

```typescript
/**
 * Slides — AI-Native Presentation Tool
 *
 * ## UI Promises
 *
 * - Filmstrip with thumbnails for slide navigation
 * - Drag-and-drop to reorder slides
 * - Theme selector (default, gaia, uncover)
 * - Fullscreen presentation with scaled slides
 * - Markdown editor with live preview
 * - Speaker notes editor
 * - Deck picker to switch or create presentations
 */
```

These are the acceptance criteria. Each line is a testable claim. Validation means checking every claim is true.

### Gap Detection

To validate, compare two lists:

1. **Backend capabilities** — all public methods in the `.photon.ts`, especially those tagged `@ui` or `@audience user`
2. **UI consumption** — all method calls in the HTML template (e.g., `window["slides"].move(...)`)

Any method in list 1 but not in list 2 is a gap. Any promise in the docblock that has no corresponding UI control is a broken promise.

### Two Layers of Quality

| Layer | What it catches | What it misses |
|-------|----------------|----------------|
| **Cosmetic** (screenshot review) | Broken layout, contrast, overflow, clipping | Missing features, interaction bugs |
| **Functional** (promise check) | Missing features, unconsumed methods, state gaps | Subtle visual bugs |

Both layers are needed. A UI can look perfect while missing half its features.

## References

| Topic | When to Read |
|-------|-------------|
| [Directory Structure](references/directory-structure.md) | Need the `~/.photon/` layout rules for assets vs runtime data |
| [Docblock Tags](references/docblock-tags.md) | Need the complete tag reference (class, method, inline, daemon, MCP) |
| [Output Formats](references/output-formats.md) | Need layout hints, chart mapping, containers, or auto-detection rules |
| [Dependency Injection](references/dependency-injection.md) | Using `@mcp`, `@photon`, or `this.call()` for cross-photon communication |
| [Daemon Features](references/daemon-features.md) | Setting up webhooks, cron jobs, or distributed locks |
| [User Settings](references/user-settings.md) | `protected settings`, persistence, auto-resume patterns |
| [MCP Apps](references/mcp-apps.md) | Building custom HTML UIs with the photon bridge |
| [Visualization](references/visualization.md) | Generating Mermaid diagrams from photons |
| [Mermaid Syntax](references/mermaid-syntax.md) | Flowchart shapes, arrows, subgraphs |
| [Photon Patterns](references/photon-patterns.md) | Common emit/ask/yield patterns with Mermaid equivalents |
| [Examples](references/examples.md) | Complete Photon-to-Mermaid conversion examples |
| [Validation](references/validation.md) | Promise checking, gap detection, UI testing checklist |
