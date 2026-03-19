# Docblock Tags Reference

All supported JSDoc tags organized by scope. For usage examples, see the relevant reference files.

## Class-Level Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `@version` | Photon version | `@version 1.0.0` |
| `@author` | Author | `@author Jane Doe` |
| `@license` | License type | `@license MIT` |
| `@repository` | Source repo URL | `@repository https://github.com/user/repo` |
| `@homepage` | Project URL | `@homepage https://example.com` |
| `@runtime` | Required runtime version (semver range) | `@runtime ^1.5.0` |
| `@dependencies` | NPM packages to auto-install | `@dependencies axios@^1.0.0, lodash` |
| `@mcp` | MCP dependency for constructor injection | `@mcp github anthropics/mcp-server-github` |
| `@photon` | Photon dependency (auto-install + auto-load) | `@photon billing billing-photon` |
| `@cli` | System CLI tool dependency | `@cli git - https://git-scm.com/downloads` |
| `@mcps` | MCP dependencies list (for diagrams) | `@mcps filesystem, git` |
| `@photons` | Photon dependencies list (for diagrams) | `@photons calculator` |
| `@stateful` | Photon maintains state between calls | `@stateful true` |
| `@idleTimeout` | Idle timeout before process termination (ms) | `@idleTimeout 300000` |
| `@ui` | UI template asset. `.photon.html` = declarative (data-attribute binding, no JS). `.html` = full control. | `@ui my-view ./ui/view.html` or `@ui my-view ./ui/view.photon.html` |
| `@prompt` | Static prompt asset | `@prompt greet ./prompts/greet.txt` |
| `@resource` | Static resource asset | `@resource data ./data.json` |
| `@icon` | Photon icon (emoji or image path) | `@icon 🔧` or `@icon ./icons/tool.png` |
| `@icons` | Icon image variants with size/theme | `@icons ./icons/tool-48.png 48x48 dark` |
| `@tags` | Categorization tags | `@tags database, sql, postgresql` |
| `@label` | Custom display name in Beam sidebar | `@label My Custom Tool` |
| `@persist` | Enable settings UI persistence | `@persist` |
| `@internal` | Hide photon from sidebar | `@internal` |
| `@worker` | Force worker thread isolation (crash-safe) | `@worker` |
| `@noworker` | Force in-process even with lifecycle hooks | `@noworker` |
| `@auth` | MCP OAuth auth requirement. Enables `this.caller`. | `@auth required` or `@auth optional` |
| `@forkedFrom` | Origin for forked photons (auto-injected) | `@forkedFrom portel-dev/photons#kanban` |

## Method-Level Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `@param` | Tool parameter description | `@param name User's full name` |
| `@returns` | Return value description (supports `{@label}`) | `@returns The result {@label Run}` |
| `@example` | Code example | `@example await tool.greet({ name: 'World' })` |
| `@format` | Output format hint | `@format table` |
| `@icon` | Tool icon (emoji, name, or image path) | `@icon 🧮` or `@icon ./calc.png` |
| `@icons` | Tool icon variants with size/theme | `@icons ./calc-48.png 48x48 dark` |
| `@autorun` | Auto-execute when selected in Beam | `@autorun` |
| `@async` | Run in background, return execution ID | `@async` |
| `@ui` | Link to UI template | `@ui my-view` |
| `@title` | **MCP.** Human-readable display name | `@title Create New Task` |
| `@readOnly` | **MCP.** No side effects — safe to auto-approve | `@readOnly` |
| `@destructive` | **MCP.** Requires confirmation | `@destructive` |
| `@idempotent` | **MCP.** Safe to retry | `@idempotent` |
| `@openWorld` | **MCP.** Calls external systems | `@openWorld` |
| `@closedWorld` | **MCP.** Local data only (openWorldHint: false) | `@closedWorld` |
| `@audience` | **MCP.** Who sees results | `@audience user` |
| `@priority` | **MCP.** Content importance (0.0–1.0) | `@priority 0.8` |
| `@internal` | Hide method from LLM and sidebar | `@internal` |
| `@deprecated` | Mark tool as deprecated | `@deprecated Use v2 instead` |

### Functional Method Tags

These tags add middleware behavior:

| Tag | Description | Example |
|-----|-------------|---------|
| `@fallback` | Return default value on error | `@fallback []` |
| `@logged` | Auto-log execution with timing | `@logged` or `@logged debug` |
| `@circuitBreaker` | Fast-reject after consecutive failures | `@circuitBreaker 5 30s` |
| `@cached` | Memoize results with TTL | `@cached 5m` |
| `@timeout` | Execution time limit | `@timeout 30s` |
| `@retryable` | Auto-retry on failure | `@retryable 3 1s` |
| `@throttled` | Rate limit per method | `@throttled 10/min` |
| `@debounced` | Collapse rapid repeated calls | `@debounced 500ms` |
| `@queued` | Sequential execution queue | `@queued 1` |
| `@validate` | Runtime input validation | `@validate params.email must be valid` |
| `@use` | Apply custom middleware | `@use audit {@level info}` |

## Daemon Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `@webhook` | Expose as HTTP webhook endpoint | `@webhook stripe` |
| `@scheduled` | Static cron schedule (build-time) | `@scheduled 0 0 * * *` |
| `@cron` | Alias for `@scheduled` | `@cron 30 2 * * 1-5` |
| `@locked` | Distributed lock | `@locked` or `@locked board:write` |

For runtime (dynamic) scheduling, use `this.schedule` API instead — see [Daemon Features](daemon-features.md).

## Inline Parameter Tags

Placed within `@param` descriptions using `{@tag}` syntax:

| Tag | Description | Example |
|-----|-------------|---------|
| `{@min N}` / `{@max N}` | Numeric range | `@param age Age {@min 0} {@max 120}` |
| `{@format type}` | Input format | `@param email Email {@format email}` |
| `{@pattern regex}` | Regex validation | `@param zip Zip {@pattern ^[0-9]{5}$}` |
| `{@example value}` | Example value | `@param city City {@example London}` |
| `{@choice a,b,c}` | Allowed values (dropdown) | `@param role Role {@choice admin,user}` |
| `{@choice-from method}` | Dynamic dropdown from another method's return value *(v1.14+)* | `@param group Group {@choice-from groups.name}` |
| `{@field type}` | HTML input type | `@param bio Bio {@field textarea}` |
| `{@label name}` | Custom display label | `@param name Name {@label Your Name}` |
| `{@default value}` | Default value | `@param limit Max {@default 10}` |
| `{@placeholder text}` | Placeholder text | `@param q Search {@placeholder Enter...}` |
| `{@hint text}` | Help text below field | `@param key Key {@hint Found in dashboard}` |
| `{@readOnly}` / `{@writeOnly}` | Access modifiers | `@param id ID {@readOnly}` |
| `{@unique}` | Array items must be unique | `@param tags Tags {@unique}` |
| `{@multipleOf N}` | Number multiple | `@param qty Qty {@multipleOf 5}` |
| `{@deprecated msg}` | Deprecated parameter | `@param old Old {@deprecated Use new}` |
| `{@accept pattern}` | File type filter | `@param file File {@accept .ts,.js}` |

## MCP Annotations

Tags marked **MCP.** map to MCP protocol `Tool.annotations` (spec 2025-11-25):

- `@readOnly` → `annotations.readOnlyHint: true`
- `@destructive` → `annotations.destructiveHint: true`
- `@idempotent` → `annotations.idempotentHint: true`
- `@openWorld` / `@closedWorld` → `annotations.openWorldHint: true/false`
- `@title` → `annotations.title`
- `@audience` → content block `annotations.audience`:
  - `@audience user` — results for the human (dashboard data, admin views)
  - `@audience assistant` — results for the LLM only (internal context)
  - Both/default — results for both audiences
- `@priority` → content block `annotations.priority`

**Disambiguation:** Method-level `@readOnly` (tool hint) vs param-level `{@readOnly}` (JSON Schema) — no conflict.

### UI-Only Methods Pattern

Combine `@internal` + `@audience user` for methods callable by UI templates (`window.photon.callTool()`) but hidden from the LLM:

```typescript
/**
 * Dashboard-only method — not visible to AI.
 * @internal
 * @audience user
 * @readOnly
 */
async journal(params: { agent: string }): Promise<Entry[]> { ... }
```

| Combination | LLM sees tool? | UI can call? | Use case |
|-------------|---------------|-------------|----------|
| *(no tags)* | Yes | Yes | Standard tools |
| `@internal` | No | Yes | Scheduled jobs, system callbacks |
| `@internal` + `@audience user` | No | Yes | Dashboard-only methods |
| `@audience assistant` | Yes | Yes | LLM-facing data human doesn't need |

## Structured Output

Auto-generated from TypeScript return types. Use interfaces with JSDoc for field descriptions:

```typescript
interface Task {
  /** Unique task identifier */
  id: string;
  /** Whether the task is complete */
  done: boolean;
}

async create(params: { title: string }): Promise<Task> { ... }
```

MCP responses include `structuredContent` alongside text when `outputSchema` is present.

## Icon Images

`@icon` supports emoji and file paths. File paths are resolved to `data:` URIs for MCP `Tool.icons[]`:

```typescript
/**
 * @icon ./icons/calc.png                  // single image
 * @icons ./icons/calc-48.png 48x48        // explicit size
 * @icons ./icons/calc-dark.svg dark        // theme variant
 * @icons ./icons/calc-96.png 96x96 dark   // size + theme
 */
```

Supported formats: PNG, JPEG, GIF, SVG, WebP, ICO. Paths relative to photon file.
