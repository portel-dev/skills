---
name: photon-builder
description: Guide for creating Photon MCPs - single-file TypeScript servers with JSDoc metadata. Use when building MCP tools that integrate APIs, process data, or provide functionality. Covers docblock tags, return patterns, dependency injection, and output formatting.
---

# Photon Development Guide

Photons are single-file TypeScript MCP servers. No compilation - runs directly with `tsx`.

## Quick Start

```typescript
/**
 * Weather API - Get current weather and forecasts
 *
 * @name weather
 * @version 1.0.0
 * @author Your Name
 * @dependencies axios@^1.0.0
 */

export default class Weather {
  constructor(private apiKey: string) {}

  /**
   * Get current weather for a city
   * @param city City name {@example London}
   * @format markdown
   */
  async current(params: { city: string }): Promise<string> {
    const res = await fetch(`https://api.weather.com/v1/current?q=${params.city}&key=${this.apiKey}`);
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);

    const data = await res.json();
    return `**${data.name}** - ${data.temp}°C, ${data.description}`;
  }
}
```

## Core Principles

### 1. Return Values Directly

**Return the actual result.** If a method returns, it succeeded. Errors should throw.

```typescript
// WRONG - unnecessary wrapper
async getUser(params: { id: string }) {
  const user = await db.find(params.id);
  return { success: true, data: user };  // DON'T DO THIS
}

// RIGHT - return the value
async getUser(params: { id: string }) {
  const user = await db.find(params.id);
  if (!user) throw new Error(`User not found: ${params.id}`);
  return user;  // Just return it
}
```

### 2. Use Markdown for Rich Output

Return markdown for UI-renderable content. Supports tables, code blocks, mermaid diagrams.

```typescript
/**
 * Generate architecture diagram
 * @format markdown
 */
async diagram(params: { code: string }): Promise<string> {
  const mermaid = this.analyze(params.code);

  return `**Architecture Overview**

\`\`\`mermaid
${mermaid}
\`\`\`

Key components identified above.`;
}
```

### 3. Throw on Errors

Let the runtime handle errors. Don't catch and wrap.

```typescript
// WRONG
async fetchData(params: { url: string }) {
  try {
    const res = await fetch(params.url);
    return { success: true, data: await res.json() };
  } catch (error) {
    return { success: false, error: error.message };  // DON'T
  }
}

// RIGHT
async fetchData(params: { url: string }) {
  const res = await fetch(params.url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
  return res.json();
}
```

## Class Structure

```typescript
/**
 * Brief description of what this photon does
 *
 * @name photon-name
 * @version 1.0.0
 * @author Author Name
 * @license MIT
 * @dependencies package1, package2@^2.0.0
 */

export default class PhotonName {
  /**
   * Constructor params become environment variables
   * PHOTON_NAME_API_KEY, PHOTON_NAME_BASE_URL
   */
  constructor(
    private apiKey: string,
    private baseUrl: string = 'https://api.example.com'
  ) {}

  /**
   * Method description becomes tool description
   * @param query Search query {@example "typescript"}
   * @param limit Max results {@min 1} {@max 100}
   * @format table
   */
  async search(params: { query: string; limit?: number }) {
    // Implementation
  }
}
```

## Dependency Injection

### MCP Injection

```typescript
/**
 * Workflow that uses filesystem MCP
 *
 * @name file-processor
 * @mcp fs npm:@anthropic/mcp-filesystem
 */

export default class FileProcessor {
  constructor(private fs: any) {}  // Injected MCP client

  async process(params: { path: string }) {
    const content = await this.fs.read_file({ path: params.path });
    // Process content...
    return `Processed ${content.length} bytes`;
  }
}
```

### Photon Injection

```typescript
/**
 * Workflow combining multiple photons
 *
 * @name data-pipeline
 * @photon parser data-parser
 * @photon store data-store
 */

export default class DataPipeline {
  constructor(
    private parser: any,
    private store: any
  ) {}

  async run(params: { source: string }) {
    const parsed = await this.parser.parse({ input: params.source });
    await this.store.save({ data: parsed });
    return `Stored ${parsed.length} records`;
  }
}
```

## Output Formats

Use `@format` to hint how results should be rendered:

| Format | Use For | Example Return |
|--------|---------|----------------|
| `markdown` | Rich text, diagrams | `"**Title**\n\nContent..."` |
| `table` | Structured lists | `[{ name: "a", value: 1 }, ...]` |
| `json` | Raw data | `{ complex: { nested: "data" } }` |
| `code:lang` | Source code | `"function foo() { ... }"` |
| `primitive` | Simple values | `"Hello"` or `42` |

### Markdown with Mermaid

```typescript
/**
 * @format markdown
 */
async visualize(params: { data: any }): Promise<string> {
  return `## Data Flow

\`\`\`mermaid
graph LR
    A[Input] --> B[Process]
    B --> C[Output]
\`\`\`

| Step | Duration |
|------|----------|
| Input | 10ms |
| Process | 50ms |
`;
}
```

## Parameter Validation

Use inline tags in `@param` for validation:

```typescript
/**
 * Create a user account
 * @param email User email {@format email}
 * @param age User age {@min 13} {@max 120}
 * @param role Account role {@choice admin,user,guest}
 * @param bio Short bio {@field textarea}
 * @param password Password {@format password}
 */
async createUser(params: {
  email: string;
  age: number;
  role: 'admin' | 'user' | 'guest';
  bio?: string;
  password: string;
}) {
  // Validation happens automatically based on tags
}
```

## Lifecycle Hooks

```typescript
export default class StatefulPhoton {
  private connection: any;

  /** Called once when photon loads */
  async onInitialize() {
    this.connection = await createConnection();
  }

  /** Called before photon unloads */
  async onShutdown() {
    await this.connection.close();
  }

  async query(params: { sql: string }) {
    return this.connection.execute(params.sql);
  }
}
```

## Generator Methods (Workflows)

For multi-step workflows with user interaction:

```typescript
/**
 * @stateful true
 */
export default class DeployWorkflow {
  /**
   * Deploy with confirmation steps
   */
  async *deploy(params: { environment: string }) {
    yield { emit: 'status', message: 'Preparing deployment...' };

    const changes = await this.detectChanges();
    yield { emit: 'log', message: `Found ${changes.length} changes` };

    const confirmed = yield {
      ask: 'confirm',
      message: `Deploy ${changes.length} changes to ${params.environment}?`
    };

    if (!confirmed) {
      return 'Deployment cancelled';
    }

    yield { emit: 'progress', current: 0, total: changes.length };

    for (let i = 0; i < changes.length; i++) {
      await this.applyChange(changes[i]);
      yield { emit: 'progress', current: i + 1, total: changes.length };
    }

    return `Deployed ${changes.length} changes to ${params.environment}`;
  }
}
```

## Common Patterns

### API Client

```typescript
/**
 * @name github-api
 * @dependencies octokit
 */
export default class GitHubAPI {
  private client: Octokit;

  constructor(token: string) {
    this.client = new Octokit({ auth: token });
  }

  /**
   * @format table
   */
  async listRepos(params: { org: string }) {
    const { data } = await this.client.repos.listForOrg({ org: params.org });
    return data.map(r => ({ name: r.name, stars: r.stargazers_count }));
  }
}
```

### Data Processor

```typescript
/**
 * @name csv-tools
 * @dependencies csv-parse
 */
export default class CSVTools {
  /**
   * @param data CSV content
   * @format table
   */
  async parse(params: { data: string }) {
    const records = parse(params.data, { columns: true });
    return records;
  }

  /**
   * @format markdown
   */
  async summarize(params: { data: string }): Promise<string> {
    const records = parse(params.data, { columns: true });
    const columns = Object.keys(records[0] || {});

    return `**CSV Summary**

- **Rows**: ${records.length}
- **Columns**: ${columns.join(', ')}

First 3 rows:

| ${columns.join(' | ')} |
| ${columns.map(() => '---').join(' | ')} |
${records.slice(0, 3).map(r => `| ${columns.map(c => r[c]).join(' | ')} |`).join('\n')}`;
  }
}
```

## References

- **Docblock Tags**: See [references/docblock-tags.md](references/docblock-tags.md) for complete tag reference
