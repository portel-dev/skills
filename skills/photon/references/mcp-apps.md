
# Photon Apps — Interactive UIs for MCP Tools

Build interactive HTML interfaces that render inside MCP hosts. Photon implements the [MCP Apps Extension](https://modelcontextprotocol.io/docs/extensions/apps) standard with zero boilerplate.

## Photon vs Standard MCP Apps

The official MCP Apps SDK requires:
- A separate `server.ts` with `registerAppTool()` and `registerAppResource()`
- Vite + `vite-plugin-singlefile` to bundle HTML into a single file
- The `App` class from `@modelcontextprotocol/ext-apps` for iframe communication
- Manual `app.connect()`, handler registration, and lifecycle management

**Photon reduces this to two things:**
1. `@ui` JSDoc annotations on your photon class/methods
2. A plain HTML file in your asset folder

Everything else — resource registration, bridge injection, iframe sandboxing, theme propagation, tool call proxying — is handled automatically by the Photon runtime.

## Quick Start

### 1. Create the HTML UI

Place your UI file in the photon's asset folder (`~/.photon/<photon-name>/ui/`):

```html
<!-- ~/.photon/my-app/ui/dashboard.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard</title>
  <style>
    body { font-family: system-ui; padding: 20px; }
  </style>
</head>
<body>
  <h1>Dashboard</h1>
  <div id="content">Loading...</div>
  <button id="refresh">Refresh</button>

  <script>
    // window.photon is auto-injected by the runtime
    document.getElementById('refresh').addEventListener('click', async () => {
      const result = await window.photon.callTool('getData', { range: '7d' });
      // result is raw MCP response: {content: [{type: "text", text: "..."}]}
      const data = parseMCPResult(result);
      document.getElementById('content').textContent = JSON.stringify(data);
    });

    // Receive tool results pushed by the host
    window.photon.onResult((result) => {
      const data = parseMCPResult(result);
      document.getElementById('content').textContent = JSON.stringify(data);
    });

    // Parse MCP tool response format
    function parseMCPResult(raw) {
      if (raw && raw.content && Array.isArray(raw.content)) {
        const textItem = raw.content.find(c => c.type === 'text' && c.text);
        if (textItem) {
          try { return JSON.parse(textItem.text); } catch(e) { return textItem.text; }
        }
      }
      return raw;
    }
  </script>
</body>
</html>
```

### 2. Add @ui Annotations to the Photon

```typescript
/**
 * My Dashboard App
 *
 * @name my-app
 * @ui dashboard
 */
export default class MyApp {
  /**
   * Get dashboard data for a time range
   * @param range Time range (e.g. "7d", "30d")
   * @ui dashboard
   * @format json
   */
  async getData(params: { range: string }) {
    // Return structured data — the UI will render it
    return {
      range: params.range,
      metrics: { users: 1234, revenue: 56789 },
      chart: [/* ... */]
    };
  }

  /**
   * Regular tool — no UI, renders as card/text
   */
  async exportCSV(params: { range: string }) {
    return "date,users,revenue\n2024-01-01,100,5000";
  }
}
```

That's it. When `getData` is called in Beam, the HTML UI renders in an iframe instead of the default card view.

## How @ui Annotations Work

### Class-Level: Declare UI Assets

```typescript
/**
 * @ui <id> [description]
 */
```

- `<id>` — Unique identifier that MUST match the HTML filename at `<photon>/ui/<id>.html`
- `[description]` — Optional description text (NOT a file path)

**Convention:** `@ui <id>` resolves to `<photon-name>/ui/<id>.html` automatically.

Examples:
```typescript
/** @ui dashboard */           // → my-app/ui/dashboard.html
/** @ui board */               // → chess/ui/board.html
/** @ui settings */            // → my-app/ui/settings.html
/** @ui slides Presentation viewer */  // description, not a path
```

A photon can declare multiple UI assets.

### Method-Level: Link UI to Tool

```typescript
/**
 * Method description
 * @ui <id>
 */
```

Links the method to a declared UI asset. When this tool is called, the host renders the UI instead of text output.

**Critical: Single JSDoc block.** The `@ui` tag must be in the same JSDoc comment as the method description. Separate JSDoc blocks won't work — the TypeScript AST parser only reads the last JSDoc attached to a method node.

```typescript
// WRONG — two separate JSDoc blocks
/**
 * Get dashboard data
 */
/**
 * @ui dashboard
 */
async getData() { }

// RIGHT — single JSDoc block
/**
 * Get dashboard data
 * @ui dashboard
 */
async getData() { }
```

### What Photon Generates Under the Hood

From `@ui dashboard` on the class + `@ui dashboard` on `getData`:

1. **`tools/list`** includes metadata:
   ```json
   {
     "name": "my-app/getData",
     "_meta": {
       "ui": { "resourceUri": "ui://my-app/dashboard" }
     }
   }
   ```

2. **`resources/list`** exposes the asset:
   ```json
   {
     "uri": "ui://my-app/dashboard",
     "name": "dashboard",
     "mimeType": "text/html;profile=mcp-app"
   }
   ```

3. **`resources/read`** serves the HTML content when the host requests `ui://my-app/dashboard`

This is fully compliant with the MCP Apps Extension standard.

## Bridge APIs

The Photon runtime auto-injects a platform bridge into every UI iframe. Three APIs are available — apps built for any platform work without modification.

### window.photon (Primary API)

```javascript
// Call any tool on the same photon
const result = await window.photon.callTool('methodName', { arg: 'value' });

// Receive tool results pushed by the host
window.photon.onResult((result) => { /* ... */ });

// Real-time events from generator methods
window.photon.onProgress((event) => { /* { current, total } */ });
window.photon.onStatus((event) => { /* { message } */ });
window.photon.onStream((event) => { /* streaming data */ });
window.photon.onEmit((event) => { /* any emit event */ });
window.photon.onError((error) => { /* error handling */ });

// Theme
window.photon.theme;  // 'light' | 'dark'
window.photon.onThemeChange((theme) => { /* ... */ });

// Widget state (persisted across sessions)
window.photon.widgetState;
window.photon.setWidgetState({ key: 'value' });

// Context
window.photon.locale;   // e.g., 'en-US'
window.photon.photon;   // photon name
window.photon.method;   // linked method name

// Elicitation (interactive prompts from generator methods)
window.photon.onElicitation(async (event) => {
  // Show a confirm dialog, form, etc.
  return userResponse;
});

// Follow-up messages
window.photon.sendFollowUpMessage('User wants to do X next');
```

### window.openai (ChatGPT Apps SDK Compatibility)

Apps built for ChatGPT work in Photon without changes:

```javascript
window.openai.callTool(name, args);
window.openai.theme;
window.openai.toolInput;
window.openai.toolOutput;
window.openai.widgetState;
window.openai.setWidgetState(state);
window.openai.sendFollowUpMessage({ prompt: '...' });
window.openai.uploadFile(file);
window.openai.getFileDownloadUrl({ fileId });
window.openai.requestDisplayMode('fullscreen');
window.openai.requestModal({ template, params });
window.openai.notifyIntrinsicHeight(height);
window.openai.openExternal({ href: '...' });
```

### window.mcp (Generic MCP Bridge)

Superset of `window.photon` with MCP-specific methods:

```javascript
window.mcp.requestToolCall(name, args);  // Alias for callTool
window.mcp.readResource(uri);            // Read MCP resources
window.mcp.hostName;                     // Host application name
window.mcp.hostVersion;                  // Host application version
```

## MCP Response Format

**Important**: `callTool` returns raw MCP responses, not parsed objects.

```javascript
// Raw MCP response format:
{
  content: [
    { type: "text", text: "{\"key\": \"value\"}" }
  ]
}
```

Always parse the response:

```javascript
function parseMCPResult(raw) {
  if (raw && raw.content && Array.isArray(raw.content)) {
    const textItem = raw.content.find(c => c.type === 'text' && c.text);
    if (textItem) {
      try { return JSON.parse(textItem.text); } catch(e) { return textItem.text; }
    }
  }
  return raw;
}

const raw = await window.photon.callTool('getData', { range: '7d' });
const data = parseMCPResult(raw);
```

## Theme Integration

The bridge injects CSS variables and sets `data-theme` on `<html>`. Use them for automatic theme support:

```css
:root {
  color-scheme: dark light;
}

body {
  /* These variables are auto-injected by the bridge */
  background: var(--color-background, #0d0d0d);
  color: var(--color-text, #e6e6e6);
  font-family: var(--font-sans, system-ui);
}

/* Or use data-theme attribute */
[data-theme="light"] body {
  background: #ffffff;
  color: #1a1a1a;
}
```

Listen for runtime theme changes:
```javascript
window.photon.onThemeChange((theme) => {
  // Update any non-CSS theme logic
});
```

## Asset Folder Convention

For a photon at `~/.photon/my-app.photon.ts`:

```
~/.photon/
├── my-app.photon.ts          # Photon source
└── my-app/                   # Asset folder (auto-discovered)
    └── ui/
        ├── dashboard.photon.html  # Declarative mode (zero JS)
        ├── settings.html          # Full-control mode (custom JS)
        └── assets/                # Images, CSS, etc. (bundled inline)
            └── logo.svg
```

`@ui <id>` resolves to `<photon-name>/ui/<id>.html`. The id must match the HTML filename.

### Two UI Modes

| Extension | Mode | Behavior |
|-----------|------|----------|
| `.photon.html` | **Declarative** | Fragment auto-wrapped with base CSS, data attributes bind to methods |
| `.photon.md` | **Markdown** | Markdown with inline HTML, parsed to HTML then treated as declarative |
| `.html` | **Full control** | Bridge injected, you write all JavaScript |

Resolution priority: `.photon.html` > `.photon.md` > `.html`

### Markdown Templates (.photon.md)

Same as `.photon.html` but authored in markdown. HTML tags pass through untouched, so `data-method` attributes work inline with markdown prose. Great for documentation dashboards and rich layouts.

```markdown
# Dashboard

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">

<div style="padding: 16px;">

## Tasks
<div data-method="list" data-format="checklist"></div>

</div>

<div style="padding: 16px;">

## Stats
<div data-method="stats" data-format="metric"></div>

</div>

</div>
```

### Declarative Templates (.photon.html)

Inspired by [Datastar](https://data-star.dev/)'s SSE-first hypermedia approach. Only `data-method` is required — format, live updates, refresh, and trigger are auto-inferred from your docblock metadata (`@format`, `@stateful`, `@scheduled`).

```html
<!-- dashboard.photon.html -->
<h1>Dashboard</h1>
<div data-method="cpu"></div>           <!-- format from @format, live from @stateful -->
<div data-method="requests"></div>      <!-- auto-inferred table, auto live updates -->
<button data-method="restart" data-target="#status">Restart</button>
<span id="status"></span>
```

**Auto-inference from metadata:**

| What | Auto-inferred from | Manual override |
|------|-------------------|-----------------|
| Format | `@format` tag on method | `data-format="gauge"` |
| Live updates | `@stateful` tag on class | `data-live` |
| Refresh | `@scheduled`/`@cron` tag | `data-refresh="5s"` |
| Trigger | Element type: button→click, div→load | `data-trigger="click"` |

**Additional attributes (optional):**

| Attribute | Purpose | Default |
|-----------|---------|---------|
| `data-target` | CSS selector — where to render | Self |
| `data-swap` | How to replace: `innerHTML`, `outerHTML`, `beforeend`, `afterend` | `innerHTML` |
| `data-args` | JSON parameters | `{}` |
| `data-field` | Extract nested field | — |

## Generator Methods + UI

Photon's generator methods (`async *`) emit real-time events that the UI can listen to:

```typescript
/**
 * Deploy with live progress
 * @ui deploy-view
 */
async *deploy(params: { target: string }) {
  yield { emit: 'status', message: 'Starting deployment...' };

  for (let i = 0; i < steps.length; i++) {
    await this.runStep(steps[i]);
    yield { emit: 'progress', current: i + 1, total: steps.length };
  }

  // Interactive prompt — UI handles via onElicitation
  const confirmed = yield {
    ask: 'confirm',
    message: 'Deploy to production?'
  };

  if (!confirmed) return 'Cancelled';
  return { status: 'deployed', target: params.target };
}
```

UI side:
```javascript
window.photon.onProgress(({ current, total }) => {
  progressBar.style.width = `${(current / total) * 100}%`;
  progressText.textContent = `${current}/${total}`;
});

window.photon.onStatus(({ message }) => {
  statusEl.textContent = message;
});

window.photon.onElicitation(async (event) => {
  // Show confirm dialog
  return confirm(event.message);
});
```

## Multiple UIs Per Photon

A photon can have multiple UI views for different tools:

```typescript
/**
 * Project Manager
 *
 * @ui board ./ui/board.html
 * @ui timeline ./ui/timeline.html
 * @ui settings ./ui/settings.html
 */
export default class ProjectManager {
  /** @ui board */
  async getBoard(params: { projectId: string }) { /* ... */ }

  /** @ui timeline */
  async getTimeline(params: { projectId: string }) { /* ... */ }

  /** @ui settings */
  async getSettings() { /* ... */ }

  // No @ui — renders as standard card/text
  async createTask(params: { title: string }) { /* ... */ }
}
```

## Sharing a UI Across Methods

Multiple methods can share the same HTML template by referencing the same `@ui` asset ID. The first tagged method becomes the primary (used for app detection); all tagged methods render their results in the same UI.

```typescript
/**
 * @ui dashboard
 */
export default class Analytics {
  /** @ui dashboard */
  async overview() { return { visits: 1000, bounceRate: 0.3 }; }

  /** @ui dashboard */
  async realtime() { return { activeUsers: 42 }; }

  /** @ui dashboard */
  async funnel({ step }: { step: string }) { return { conversion: 0.12 }; }
}
```

All three methods render inside `dashboard.html`. The UI receives whichever method's result via `onResult` and can distinguish them by data shape.

## Iframe Sandbox

UIs run in a sandboxed `blob:` iframe with these permissions:
```
allow-scripts allow-forms allow-same-origin allow-popups allow-modals
```

The sandbox prevents:
- Accessing the parent window's DOM
- Reading host cookies or localStorage
- Navigating the parent page

All communication goes through the `postMessage` bridge (abstracted by `window.photon`).

### Sandbox Constraints — What Won't Work

The `blob:` origin is required so the same UI works in every MCP client (Beam, Claude Desktop, ChatGPT, Cursor). That portability has real costs. The following commonly fail inside photon UIs:

- **Cross-origin `fetch()`** — origin is opaque/null; many CDNs (HuggingFace, jsdelivr) reject CORS. Model weights and remote assets often won't load.
- **SharedArrayBuffer / threaded WASM** — requires Cross-Origin-Isolated (COOP/COEP), which hosts don't set. Rules out WebLLM and threaded ONNX Runtime Web.
- **WebGPU, camera, microphone** — permission delegation is host-dependent and not guaranteed portable.
- **Dynamic `import()` / `importScripts` over http(s)** — often blocked from `blob:` contexts.
- **Persistent IndexedDB / Cache Storage** — scoped to the opaque origin, may not survive across sessions.

### Mitigation Strategies (Author's Choice)

If a feature needs something the sandbox blocks, pick one up front:

1. **Backend inference (recommended default).** Run heavy work in a photon method using Node/Bun libraries (`onnxruntime-node`, `@xenova/transformers`, `sharp`). The UI stays a pure renderer. Works in every MCP client.
2. **Proxy assets through a photon method.** Expose a method that returns remote bytes; the UI calls it via `window.photon` instead of `fetch()`. Sidesteps CORS.
3. **Inline small assets as data URIs.** For sub-few-MB models/datasets, base64-embed into the HTML. Zero fetches, fully portable.
4. **Accept single-threaded WASM.** Detection-class models (MediaPipe Tasks, small ONNX via transformers.js) work fine single-threaded. Slower but portable.
5. **Beam-only enhancement.** Only if genuinely unavoidable, document the feature as Beam-only in the photon README. Core experience must still work in other clients.

**Rule of thumb:** if in doubt, do it on the backend. The `@ui` HTML is a renderer, not an application runtime.

See also: [CUSTOM-UI.md → Sandbox Constraints](https://github.com/portel-dev/photon/blob/main/docs/guides/CUSTOM-UI.md#sandbox-constraints) in the photon repo.

## Common Patterns

### Data Dashboard

```typescript
/**
 * @ui dashboard
 */
export default class Analytics {
  /**
   * @ui dashboard
   * @format json
   */
  async getData(params: { range: string; metric?: string }) {
    return {
      range: params.range,
      boardData: this.queryMetrics(params),
      filters: ['users', 'revenue', 'sessions']
    };
  }

  /** App-callable refresh (no @ui — used by the dashboard's refresh button) */
  async refresh(params: { range: string; metric: string }) {
    return this.queryMetrics(params);
  }
}
```

### Interactive Game

```typescript
/**
 * @ui board ./ui/board.html
 */
export default class Game {
  private games = new Map();

  /**
   * Start a new game
   * @ui board
   */
  async newGame(params: { difficulty?: string }) {
    const game = this.createGame(params.difficulty);
    this.games.set(game.id, game);
    return {
      gameId: game.id,
      boardData: game.board,
      message: 'Game started!'
    };
  }

  /** Called from the UI when the player makes a move */
  async makeMove(params: { gameId: string; move: any }) {
    const game = this.games.get(params.gameId);
    // Process move, return updated state
    return { boardData: game.board, status: game.status };
  }
}
```

### Form + Preview

```typescript
/**
 * @ui editor ./ui/editor.html
 */
export default class TemplateEditor {
  /**
   * @ui editor
   */
  async editTemplate(params: { templateId: string }) {
    return { template: this.loadTemplate(params.templateId) };
  }

  /** Called by the editor UI to preview changes */
  async preview(params: { content: string; format: string }) {
    return { html: this.render(params.content, params.format) };
  }

  /** Called by the editor UI to save */
  async save(params: { templateId: string; content: string }) {
    this.saveTemplate(params.templateId, params.content);
    return { saved: true };
  }
}
```

### Stateful Service Dashboard

For long-running photons (messaging, orchestration, scheduling), the UI acts as a control panel that calls multiple tools and maintains local state:

```typescript
/**
 * @ui dashboard
 * @stateful
 */
export default class MyService extends Photon {
  /**
   * Connection status — entry point that opens the dashboard
   * @ui dashboard
   * @readOnly
   */
  async status() {
    return { status: this.connected ? 'connected' : 'disconnected', stats: { ... } };
  }

  /** Called from the dashboard UI via callTool */
  async connect() { /* ... */ }
  async disconnect() { /* ... */ }
  async groups() { return [...]; }
  async send(params: { chat: string; text: string }) { /* ... */ }
}
```

HTML pattern for stateful dashboards:
```html
<script>
  // Local UI state — NOT the photon state
  let state = { status: 'disconnected', items: [], selected: null };

  function parseMCP(raw) {
    if (raw && raw.content && Array.isArray(raw.content)) {
      const item = raw.content.find(c => c.type === 'text' && c.text);
      if (item) { try { return JSON.parse(item.text); } catch(e) { return item.text; } }
    }
    return raw;
  }

  // Multiple tools compose the dashboard — status for header, list for sidebar, detail for content
  async function refresh() {
    const statusRaw = await window.photon.callTool('status', {});
    state.status = parseMCP(statusRaw);
    renderHeader();

    if (state.status.connected) {
      const itemsRaw = await window.photon.callTool('groups', {});
      state.items = parseMCP(itemsRaw);
      renderSidebar();
    }
  }

  // onResult handles pushed results (when host triggers a tool)
  window.photon.onResult((result) => {
    const data = parseMCP(result);
    // Detect result type by shape and update relevant UI section
    if ('status' in data) { state.status = data; renderHeader(); }
    else if (Array.isArray(data)) { state.items = data; renderSidebar(); }
  });

  // Initial load
  refresh();
</script>
```

Key principles for stateful dashboards:
- **One @ui, many tools**: The dashboard calls multiple tools via `callTool` to compose its view
- **Detect result type by shape**: `onResult` receives any tool result — inspect the data shape to route to the right renderer
- **Poll sparingly**: Use `onResult` and events instead of timers where possible
- **Keep local state minimal**: The photon is the source of truth; the UI just reflects it

### UI-Only Methods

Use `@internal` + `@audience user` to create methods the dashboard can call but the LLM never sees:

```typescript
/**
 * @ui dashboard
 * @stateful
 */
export default class MyService extends Photon {
  /** Both LLM and UI can call this */
  async status() { return { connected: true }; }

  /**
   * Dashboard-only — hidden from LLM tools/list.
   * @internal
   * @audience user
   * @readOnly
   */
  async metrics() { return { cpu: 42, memory: 128 }; }

  /**
   * Dashboard-only — admin action, not for AI.
   * @internal
   * @audience user
   */
  async restart() { /* ... */ }
}
```

The UI calls these like any other tool (`window.photon.callTool('metrics', {})`). The `@internal` tag hides them from `tools/list` so the LLM can't invoke them. The `@audience user` adds MCP content annotations marking results as human-only. See [Docblock Tags](docblock-tags.md) for the full audience matrix.

## MCP Apps Standard Compatibility

Photon's implementation is compatible with the [MCP Apps Extension (2026-01-26)](https://modelcontextprotocol.github.io/ext-apps/api/). Here's the mapping:

| MCP Apps Standard | Photon Equivalent |
|---|---|
| `registerAppTool()` with `_meta.ui.resourceUri` | `@ui <id>` on method |
| `registerAppResource()` with `text/html;profile=mcp-app` | `@ui <id> <path>` on class |
| `App` class + `app.connect()` | Auto-injected bridge (`window.photon`) |
| `app.ontoolresult` callback | `window.photon.onResult()` |
| `app.callServerTool()` | `window.photon.callTool()` |
| `app.onhostcontextchanged` | `window.photon.onThemeChange()` + CSS variables |
| `app.sendMessage()` | `window.photon.sendFollowUpMessage()` |
| `app.requestDisplayMode()` | `window.openai.requestDisplayMode()` |
| `app.sendLog()` | `console.log()` (in iframe dev tools) |
| `ui://` resource scheme | `ui://<photon>/<ui-id>` (auto-generated) |
| `vite-plugin-singlefile` bundling | Not needed — HTML served directly |
| Double-iframe sandbox (web hosts) | Single sandboxed iframe with `srcdoc` |

### What Photon Adds Beyond the Standard

- **Generator method streaming**: `onProgress`, `onStatus`, `onStream` for real-time updates from `async *` methods
- **Elicitation**: Interactive prompts from generator methods handled by the UI
- **Widget state persistence**: `setWidgetState`/`widgetState` persisted across sessions
- **ChatGPT compatibility**: `window.openai` API for cross-platform apps
- **File upload/download**: `uploadFile()`, `getFileDownloadUrl()` via the OpenAI-compat bridge
- **Zero build step**: No Vite, no bundling — plain HTML files work directly

## Common Mistakes

1. **Wrong @ui path** — Paths are relative to the asset folder (`~/.photon/<name>/`), not the photon file. Use `./ui/file.html`, not `./<name>/ui/file.html`.

2. **Separate JSDoc blocks** — `@ui <id>` must be in the same JSDoc comment as the method. Two separate `/** */` blocks won't work.

3. **Not parsing MCP responses** — `callTool` returns raw MCP format `{content: [{type: "text", text: "..."}]}`. Always use `parseMCPResult()`.

4. **Expecting hot-reload for @ui changes** — Changes to `@ui` annotations require a server restart. HTML file changes hot-reload fine.

5. **Inline assets** — External scripts/stylesheets won't load in `srcdoc` iframes. Inline everything or use CDN URLs.

## References

- [MCP Apps Extension Spec](https://modelcontextprotocol.io/docs/extensions/apps)
- [MCP Apps API Reference](https://modelcontextprotocol.github.io/ext-apps/api/)
- [ext-apps Repository](https://github.com/modelcontextprotocol/ext-apps)
- [Photon Development Guide](../SKILL.md) — for building the photon itself (tools, params, lifecycle)
