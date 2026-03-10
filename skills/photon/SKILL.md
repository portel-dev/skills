---
name: photon
description: Complete guide for building Photon MCPs — single-file TypeScript servers with JSDoc metadata. Covers docblock tags, output formats, dependency injection, custom UIs, visualization, daemon features, scoped memory, and async execution. Use when building any photon, adding UIs, or generating diagrams.
---

# Photon Development Guide

Photons are single-file TypeScript MCP servers. No compilation — runs directly with `tsx`.

## Installation

```bash
# Install the Photon runtime globally
npm install -g @portel/photon

# Create a new photon
photon maker new my-weather

# Or create the file manually
# Place .photon.ts files in ~/.photon/
```

This creates `~/.photon/my-weather.photon.ts` with a starter template.

### Running Your Photon

```bash
# Launch Beam (interactive control panel — opens in browser)
photon beam

# Run as MCP server (for Claude Desktop, Cursor, etc.)
photon mcp my-weather

# Run from command line
photon cli my-weather current --city London

# Run as HTTP server with SSE transport
photon sse my-weather
```

### Connecting to Claude Desktop

Add to your Claude Desktop MCP config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "my-weather": {
      "command": "photon",
      "args": ["mcp", "my-weather"]
    }
  }
}
```

## Quick Start

```typescript
import { PhotonMCP } from '@portel/photon-core';

/**
 * Weather API — Get current weather and forecasts
 *
 * @version 1.0.0
 * @dependencies axios@^1.0.0
 */
export default class Weather extends PhotonMCP {
  constructor(private apiKey: string) { super(); }

  /**
   * Get current weather for a city
   * @param city City name {@example London}
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

### 1. Return Values Directly

**Return the actual result.** If a method returns, it succeeded. Errors should throw.

```typescript
// WRONG — unnecessary wrapper
async getUser({ id }: { id: string }) {
  const user = await db.find(id);
  return { success: true, data: user };  // DON'T DO THIS
}

// RIGHT — return the value
async getUser({ id }: { id: string }) {
  const user = await db.find(id);
  if (!user) throw new Error(`User not found: ${id}`);
  return user;
}
```

### 2. Use Markdown for Rich Output

Return markdown for UI-renderable content. Supports tables, code blocks, mermaid diagrams.

```typescript
/**
 * @format markdown
 */
async diagram({ code }: { code: string }): Promise<string> {
  return `**Architecture Overview**

\`\`\`mermaid
graph LR
    A[Input] --> B[Process] --> C[Output]
\`\`\``;
}
```

### 3. Throw on Errors

Let the runtime handle errors. Don't catch and wrap.

```typescript
// WRONG
async fetchData({ url }: { url: string }) {
  try {
    const res = await fetch(url);
    return { success: true, data: await res.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// RIGHT
async fetchData({ url }: { url: string }) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
  return res.json();
}
```

## Class Structure

```typescript
/**
 * Brief description of what this photon does
 *
 * @version 1.0.0
 * @author Author Name
 * @license MIT
 * @runtime ^1.5.0
 * @dependencies package1, package2@^2.0.0
 * @icon 🔧
 * @tags api, utility
 */
export default class PhotonName extends PhotonMCP {
  /**
   * Constructor params become environment variables:
   * PHOTON_PHOTONNAME_APIKEY, PHOTON_PHOTONNAME_BASEURL
   */
  constructor(
    private apiKey: string,
    private baseUrl: string = 'https://api.example.com'
  ) { super(); }

  /**
   * Method description becomes tool description
   * @param query Search query {@example "typescript"}
   * @param limit Max results {@min 1} {@max 100}
   * @format table
   * @returns Search results {@label Search}
   */
  async search({ query, limit }: { query: string; limit?: number }) {
    // Implementation
  }
}
```

See [references/docblock-tags.md](references/docblock-tags.md) for the complete tag reference.

## Constructor & Dependency Injection

### Environment Variables

Primitive constructor parameters are sourced from environment variables automatically:

```typescript
constructor(
  private apiKey: string,           // PHOTON_NAME_APIKEY (required)
  private baseUrl: string = '...',  // PHOTON_NAME_BASEURL (has default)
  private region?: string           // PHOTON_NAME_REGION (optional)
) { super(); }
```

### MCP Injection (`@mcp`)

```typescript
/**
 * @mcp fs npm:@anthropic/mcp-filesystem
 * @mcp github anthropics/mcp-server-github
 */
export default class FileProcessor extends PhotonMCP {
  constructor(private fs: any, private github: any) { super(); }

  async process({ path }: { path: string }) {
    const content = await this.fs.read_file({ path });
    return `Processed ${content.length} bytes`;
  }
}
```

### Photon Injection (`@photon`)

Declare photon dependencies for auto-install and auto-load:

```typescript
/**
 * @photon billing billing-photon
 * @photon shipping shipping-photon
 */
export default class OrderProcessor extends PhotonMCP {
  // Approach 1: Constructor injection (direct instance)
  constructor(private billing: any, private shipping: any) { super(); }

  async process({ orderId }: { orderId: string }) {
    const invoice = await this.billing.generate({ orderId });
    return { invoice };
  }
}
```

Or use `this.call()` for daemon-routed invocation (no constructor param needed):

```typescript
/**
 * @photon billing billing-photon
 */
export default class OrderProcessor extends PhotonMCP {
  async process({ orderId }: { orderId: string }) {
    // Approach 2: Daemon-routed (cross-process, loosely coupled)
    const invoice = await this.call('billing.generate', { orderId });
    return { invoice };
  }
}
```

| | Constructor Injection | `this.call()` |
|---|---|---|
| **Setup** | `@photon` + constructor param | `@photon` only |
| **Execution** | In-process, direct method call | Via daemon, cross-process |
| **Speed** | Faster (no IPC overhead) | Slight overhead |
| **Use case** | Tightly coupled helpers | Loosely coupled services |

## Output Formats

Use `@format` to hint how results should be rendered.

### Structural Formats

| Value | Description | Example Return |
|-------|-------------|----------------|
| `primitive` | Single value | `"Hello"` or `42` |
| `table` | Array of objects as table | `[{ name: "a", value: 1 }]` |
| `list` | Styled list (iOS-inspired) | `[{ name: "...", email: "..." }]` |
| `grid` | Visual grid | `[{ title: "...", image: "..." }]` |
| `tree` | Hierarchical data | `{ children: [...] }` |
| `card` | Single object as card | `{ title: "...", body: "..." }` |

### Content Formats

| Value | Description |
|-------|-------------|
| `json` | JSON syntax highlighting |
| `markdown` | Markdown rendering |
| `yaml` / `xml` / `html` | Syntax highlighting |
| `mermaid` | Mermaid diagram rendering |

### Visualization Formats

| Value | Description |
|-------|-------------|
| `chart` | Auto-detect chart type from data shape |
| `chart:bar` / `chart:line` / `chart:pie` | Specific chart types |
| `chart:area` / `chart:scatter` / `chart:donut` / `chart:radar` | More chart types |
| `metric` | KPI display (big number + label + delta) |
| `gauge` | Circular gauge/progress indicator |
| `timeline` | Vertical timeline of events |
| `dashboard` | Composite grid of auto-detected panels |
| `cart` | Shopping cart with item rows + totals |

### Container Formats (Composable)

Containers wrap inner content. Data must be an object — keys become section titles.

| Value | Description |
|-------|-------------|
| `panels` | CSS grid of titled panels |
| `tabs` | Tab bar switching between items |
| `accordion` | Collapsible sections |
| `stack` | Vertical stack with spacing |
| `columns` | Side-by-side columns (2-4) |

```typescript
/**
 * @format panels {@inner card, @columns 3}
 */
async overview(): Promise<{ users: User[]; orders: Order[]; stats: Stats }>

/**
 * @format tabs {@inner kv, @style pills}
 */
async settings(): Promise<{ general: object; advanced: object }>
```

### Code Formats

| Value | Description |
|-------|-------------|
| `code` | Generic code block |
| `code:javascript` / `code:typescript` / `code:python` | Language-specific |

### Layout Hints

For `list`, `table`, and `grid`:

```typescript
/**
 * @format list {@title name, @subtitle email, @icon avatar, @badge status, @style inset}
 */
async getUsers(): Promise<User[]>
```

| Hint | Description |
|------|-------------|
| `@title fieldName` | Primary display field |
| `@subtitle fieldName` | Secondary text field |
| `@icon fieldName` | Leading visual (avatar, image) |
| `@badge fieldName` | Status badge field |
| `@detail fieldName` | Trailing detail value |
| `@style styleName` | `plain`, `grouped`, `inset`, `inset-grouped` |
| `@columns N` | Number of columns (for grid) |

For `chart` formats:

```typescript
/**
 * @format chart:bar {@label region, @value revenue}
 */
async revenueByRegion(): Promise<{ region: string; revenue: number }[]>

/**
 * @format chart:line {@x date, @y signups}
 */
async signupTrend(): Promise<{ date: string; signups: number }[]>
```

| Hint | Description |
|------|-------------|
| `@label fieldName` | Chart labels (categories, pie segments) |
| `@value fieldName` | Chart values (y-axis, sizes) |
| `@x` / `@y` | Axis mapping |
| `@series fieldName` | Group into multiple series |

For `gauge`: `@min N`, `@max N`

For `timeline`: `@date fieldName`, `@title fieldName`, `@description fieldName`

For containers: `@inner layoutType`, `@columns N`, `@style pills|bordered`

## Parameter Validation

Use inline tags in `@param` for validation and UI hints:

```typescript
/**
 * Create a user account
 * @param email User email {@format email}
 * @param age User age {@min 13} {@max 120}
 * @param role Account role {@choice admin,user,guest}
 * @param bio Short bio {@field textarea} {@placeholder Tell us about yourself...}
 * @param password Password {@format password}
 * @param limit Max results {@default 10}
 * @param apiKey API Key {@hint Found in your dashboard}
 * @param tags Tags {@unique}
 */
```

All inline parameter tags:

| Tag | Description |
|-----|-------------|
| `{@min N}` / `{@max N}` | Numeric range |
| `{@format type}` | Input format (email, url, date, password, etc.) |
| `{@pattern regex}` | Regex validation |
| `{@example value}` | Example value |
| `{@choice a,b,c}` | Allowed values (dropdown) |
| `{@field type}` | HTML input type (text, textarea, number, etc.) |
| `{@label name}` | Custom display label |
| `{@default value}` | Default value |
| `{@placeholder text}` | Placeholder text |
| `{@hint text}` | Help text below field |
| `{@readOnly}` / `{@writeOnly}` | Access modifiers |
| `{@unique}` | Array items must be unique |
| `{@multipleOf N}` | Number must be multiple of N |
| `{@deprecated message}` | Mark as deprecated |
| `{@accept pattern}` | File type filter (e.g. `.ts,.js`) |

## Lifecycle Hooks

```typescript
export default class StatefulPhoton extends PhotonMCP {
  private connection: any;

  /** Called once when photon loads */
  async onInitialize() {
    this.connection = await createConnection();
  }

  /** Called before photon unloads */
  async onShutdown() {
    await this.connection.close();
  }

  async query({ sql }: { sql: string }) {
    return this.connection.execute(sql);
  }
}
```

## Generator Methods (Workflows)

For multi-step workflows with user interaction:

```typescript
/**
 * @stateful true
 */
export default class DeployWorkflow extends PhotonMCP {
  async *deploy({ environment }: { environment: string }) {
    yield { emit: 'status', message: 'Preparing deployment...' };

    const changes = await this.detectChanges();
    yield { emit: 'log', message: `Found ${changes.length} changes` };

    const confirmed = yield {
      ask: 'confirm',
      message: `Deploy ${changes.length} changes to ${environment}?`
    };

    if (!confirmed) return 'Deployment cancelled';

    yield { emit: 'progress', current: 0, total: changes.length };

    for (let i = 0; i < changes.length; i++) {
      await this.applyChange(changes[i]);
      yield { emit: 'progress', current: i + 1, total: changes.length };
    }

    return `Deployed ${changes.length} changes to ${environment}`;
  }
}
```

## Daemon Features

### Webhooks (`@webhook`)

```typescript
/**
 * Handle Stripe payment events
 * @webhook stripe
 */
async handleStripePayment({ event }: { event: any }) {
  // Accessible at POST /webhook/stripe
}

// Or auto-detected via handle* prefix:
async handleGithubIssue({ action, issue }: { action: string; issue: any }) {
  // Accessible at POST /webhook/handleGithubIssue
}
```

### Scheduled Jobs (`@scheduled` / `@cron`)

```typescript
/**
 * Archive old tasks daily at midnight
 * @scheduled 0 0 * * *
 */
async scheduledArchiveOldTasks(): Promise<{ archived: number }> {
  // Runs daily at 00:00
}

/**
 * Cleanup every weekday at 2:30 AM
 * @cron 30 2 * * 1-5
 */
async weekdayCleanup(): Promise<void> {
  // Runs Mon-Fri at 02:30
}
```

Cron format: `minute hour day-of-month month day-of-week`

### Distributed Locks (`@locked`)

```typescript
/**
 * Update board with exclusive access
 * @locked
 */
async updateBoard({ board, data }: { board: string; data: any }) {
  // Lock name: "updateBoard" (method name)
}

/**
 * @locked board:write
 */
async batchUpdate({ taskIds }: { taskIds: string[] }) {
  // Custom lock name: "board:write"
}
```

For programmatic locking with dynamic names:

```typescript
async moveTask({ taskId, column }: { taskId: string; column: string }) {
  return this.withLock(`task:${taskId}`, async () => {
    const task = await this.loadTask(taskId);
    task.column = column;
    await this.saveTask(task);
    return task;
  });
}
```

## Scoped Memory (`this.memory`)

Zero-config persistent key-value storage. Three scopes:

| Scope | Storage | Use Case |
|-------|---------|----------|
| `photon` (default) | `~/.photon/data/{photonId}/` | Private state |
| `session` | `~/.photon/sessions/{sessionId}/{photonId}/` | Per-user session |
| `global` | `~/.photon/data/_global/` | Shared across all photons |

```typescript
export default class Bookmarks extends PhotonMCP {
  async save({ url, title, tags }: { url: string; title: string; tags?: string }) {
    const bookmarks = await this.memory.get<Bookmark[]>('bookmarks') ?? [];
    bookmarks.push({ id: crypto.randomUUID(), url, title, tags: tags?.split(',') ?? [] });
    await this.memory.set('bookmarks', bookmarks);
    return { saved: true, total: bookmarks.length };
  }

  /**
   * @format list {@title title, @subtitle url, @badge tags}
   */
  async list({ tag }: { tag?: string } = {}) {
    const bookmarks = await this.memory.get<Bookmark[]>('bookmarks') ?? [];
    return tag ? bookmarks.filter(b => b.tags.includes(tag)) : bookmarks;
  }

  async stats() {
    const count = (await this.memory.get<Bookmark[]>('bookmarks'))?.length ?? 0;
    await this.memory.set('bookmark-count', count, 'global'); // Shared counter
    return { bookmarks: count };
  }
}
```

API: `get<T>(key, scope?)`, `set(key, value, scope?)`, `delete(key, scope?)`, `has(key, scope?)`, `keys(scope?)`, `clear(scope?)`, `getAll(scope?)`, `update(key, fn, scope?)`

## Async Execution (`@async`)

Background tasks that return an execution ID immediately:

```typescript
/**
 * Generate quarterly report — takes several minutes
 * @async
 * @param quarter The quarter (e.g. "Q1-2026")
 */
async generate({ quarter }: { quarter: string }) {
  const data = await this.fetchAllData(quarter);
  const report = await this.buildReport(data);
  await this.memory.set('latest_report', report);
  return report; // Stored in audit trail
}
```

Client receives immediately: `{ executionId: "exec_...", status: "running" }`

## MCP Standard Annotations

Photon maps JSDoc tags to MCP protocol annotations (spec 2025-11-25). These help clients make UX decisions like auto-approval, confirmation gates, and retry behavior.

### Tool Annotations

```typescript
/**
 * List all tasks — safe, no side effects
 * @readOnly
 * @idempotent
 * @closedWorld
 * @title List All Tasks
 */
async list() { ... }

/**
 * Permanently delete a task — requires confirmation
 * @destructive
 * @openWorld
 * @title Delete Task
 */
async remove({ id }: { id: string }) { ... }
```

| Tag | MCP Field | Effect |
|-----|-----------|--------|
| `@readOnly` | `annotations.readOnlyHint: true` | Client may auto-approve |
| `@destructive` | `annotations.destructiveHint: true` | Client should require confirmation |
| `@idempotent` | `annotations.idempotentHint: true` | Client may safely retry |
| `@openWorld` | `annotations.openWorldHint: true` | Tool calls external systems |
| `@closedWorld` | `annotations.openWorldHint: false` | Tool operates only on local data |
| `@title` | `annotations.title` | Display name in tool selection UI |

**Note:** Method-level `@readOnly` (no curly braces) is distinct from parameter-level `{@readOnly}` (inside `@param` tags). They serve different purposes.

### Content Annotations

Control who sees tool results and how important they are:

```typescript
/**
 * Results shown only to the human user
 * @audience user
 * @priority 0.9
 */
async userReport() { ... }

/**
 * Internal context for the AI assistant only
 * @audience assistant
 * @priority 0.3
 */
async context() { ... }

/**
 * Results for both user and assistant (default)
 * @audience user assistant
 */
async shared() { ... }
```

### Structured Output

Photon auto-generates `Tool.outputSchema` from TypeScript return types — no tags needed:

```typescript
// Inline return type — schema auto-inferred
async create(params: { title: string }): Promise<{ id: string; title: string; done: boolean }> {
  return { id: 'task-001', title: params.title, done: false };
}
```

For field descriptions, use an interface with JSDoc on properties:

```typescript
interface Task {
  /** Unique task identifier */
  id: string;
  /** Task title */
  title: string;
  /** Whether the task is complete */
  done: boolean;
}

async create(params: { title: string }): Promise<Task> { ... }
```

When `outputSchema` is present, MCP responses include `structuredContent` alongside text content, giving AI clients typed data.

## Custom UIs (MCP Apps)

Photons can have interactive HTML UIs. Brief overview — see [references/mcp-apps.md](references/mcp-apps.md) for full details.

```typescript
/**
 * @ui dashboard ./ui/dashboard.html
 */
export default class MyApp extends PhotonMCP {
  /**
   * @ui dashboard
   * @format json
   */
  async getData({ range }: { range: string }) {
    return { range, metrics: { users: 1234 } };
  }
}
```

The UI HTML gets a photon-named global proxy auto-injected (e.g., `window.myApp` for a photon named `my-app`):

```javascript
const result = await window.myApp.getData({ range: '7d' });
window.myApp.onResult((result) => { /* update UI */ });
window.myApp.onThemeChange((theme) => { /* light/dark */ });
```

## Visualization (Mermaid Diagrams)

Generate Mermaid diagrams for any photon — see [references/visualization.md](references/visualization.md) for the complete guide.

- **Workflow photons** (generators with ask/emit) → Flowcharts showing execution flow
- **Tool collection photons** (async methods) → API surface diagrams
- Bidirectional: Photon → Mermaid and Mermaid → Photon

## Common Patterns

### API Client

```typescript
/**
 * @dependencies octokit
 */
export default class GitHubAPI extends PhotonMCP {
  private client: Octokit;

  constructor(token: string) {
    super();
    this.client = new Octokit({ auth: token });
  }

  /**
   * @format table
   */
  async repos({ org }: { org: string }) {
    const { data } = await this.client.repos.listForOrg({ org });
    return data.map(r => ({ name: r.name, stars: r.stargazers_count }));
  }
}
```

### Data Processor

```typescript
/**
 * @dependencies csv-parse
 */
export default class CSVTools extends PhotonMCP {
  /**
   * @param data CSV content
   * @format table
   */
  async parse({ data }: { data: string }) {
    return parse(data, { columns: true });
  }

  /**
   * @format markdown
   */
  async summarize({ data }: { data: string }): Promise<string> {
    const records = parse(data, { columns: true });
    const columns = Object.keys(records[0] || {});

    return `**CSV Summary**

- **Rows**: ${records.length}
- **Columns**: ${columns.join(', ')}

| ${columns.join(' | ')} |
| ${columns.map(() => '---').join(' | ')} |
${records.slice(0, 3).map(r => `| ${columns.map(c => r[c]).join(' | ')} |`).join('\n')}`;
  }
}
```

## Method Naming Convention

Method names are CLI tool names. They read as `<photon> <method>`:

- **Use single words**: `start`, `drop`, `board`, `stats`
- **Not camelCase**: ~~`newGame`~~, ~~`dropPiece`~~
- **Verb for actions, noun for views**: `start`, `drop` (verbs) vs `board`, `stats` (nouns)
- **Test by reading aloud**: `connect-four start` reads like English

## References

- **[Docblock Tags](references/docblock-tags.md)** — Complete tag reference (class, method, inline, daemon)
- **[MCP Apps](references/mcp-apps.md)** — Building custom HTML UIs for photons
- **[Visualization](references/visualization.md)** — Mermaid diagram generation
- **[Mermaid Syntax](references/mermaid-syntax.md)** — Flowchart shapes, arrows, subgraphs
- **[Photon Patterns](references/photon-patterns.md)** — Common patterns and their Mermaid equivalents
- **[Examples](references/examples.md)** — Complete Photon↔Mermaid conversion examples
