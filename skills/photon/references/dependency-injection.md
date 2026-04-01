# Dependency Injection

## Environment Variables

Primitive constructor parameters auto-map to environment variables:

```typescript
constructor(
  private apiKey: string,           // PHOTON_NAME_APIKEY (required)
  private baseUrl: string = '...',  // PHOTON_NAME_BASEURL (has default)
  private region?: string           // PHOTON_NAME_REGION (optional)
) { super(); }
```

## MCP Injection (`@mcp`)

Inject external MCP servers as constructor dependencies:

```typescript
/**
 * @mcp fs npm:@anthropic/mcp-filesystem
 * @mcp github anthropics/mcp-server-github
 */
export default class FileProcessor extends Photon {
  constructor(private fs: any, private github: any) { super(); }

  async process({ path }: { path: string }) {
    const content = await this.fs.read_file({ path });
    return `Processed ${content.length} bytes`;
  }
}
```

## Photon Injection (`@photon`) — Preferred

**Always prefer constructor injection over `this.call()`.** It makes dependencies explicit, typed, composable, and visible in the docblock.

**Syntax:** `@photon <constructor-param> <photon-to-install>`

- **First value** = the constructor parameter name that receives the injected photon instance
- **Second value** = which photon to install and inject (by marketplace name or qualified path)

```
@photon whatsapp whatsapp
        ─────┬── ────┬────
             │       └─ photon to install (marketplace name "whatsapp")
             └───────── constructor param: private whatsapp: any

@photon router agent-router
        ──┬── ─────┬──────
          │        └─ photon to install (marketplace name "agent-router")
          └────────── constructor param: private router: any
```

The two values differ when the photon name doesn't match your preferred variable name. If they're the same (e.g., `@photon whatsapp whatsapp`), both values are identical.

**Source formats for the second value:**

| Format | Meaning | Example |
|--------|---------|---------|
| `name` | From same marketplace | `@photon db postgres` |
| `marketplace/name` | From specific marketplace | `@photon db portel-dev/postgres` |
| `owner/repo/name` | From GitHub repo | `@photon db Arul-/photons/postgres` |

**Named instances** — append `:instanceName` to run multiple instances of the same photon:

```
@photon homeTodos todo:home
@photon workTodos todo:work
```

Both inject the `todo` photon but as separate instances named `home` and `work`.

Dependencies are **auto-installed** from the same marketplace when the photon is installed.

```typescript
/**
 * Orchestrator — composes billing and shipping photons
 *
 * @photon billing billing
 * @photon shipping shipping
 */
export default class OrderProcessor extends Photon {
  constructor(
    private billing: any,
    private shipping: any,
  ) { super(); }

  async process({ orderId }: { orderId: string }) {
    const invoice = await this.billing.generate({ orderId });
    const label = await this.shipping.createLabel({ orderId });
    return { invoice, label };
  }
}
```

### Event-Driven Composition

Injected photons emit events on channels. Subscribe via the channel broker:

```typescript
import { Photon, getBroker } from '@portel/photon-core';

/**
 * @photon whatsapp whatsapp
 * @photon router message-router
 */
export default class Orchestrator extends Photon {
  constructor(private whatsapp: any, private router: any) { super(); }

  async start() {
    // Subscribe to WhatsApp message events (auto-prefixed: 'whatsapp:messages')
    const broker = getBroker();
    await broker.subscribe('whatsapp:messages', (msg) => {
      this._handleMessage(msg.data);
    });
    return { status: 'listening' };
  }
}
```

### `this.call()` — Legacy/Escape Hatch

Use `this.call()` only when you cannot use constructor injection (e.g., dynamic photon names, optional dependencies):

```typescript
// Only for dynamic/optional cross-photon calls
const result = await this.call('billing.generate', { orderId });
```

### Comparison

| | Constructor Injection (preferred) | `this.call()` |
|---|---|---|
| **Dependencies** | Explicit in docblock + constructor | Hidden in method bodies |
| **Readability** | Clear dependency graph | Requires reading all methods |
| **Execution** | In-process, direct | Via daemon, cross-process |
| **Speed** | Faster (no IPC) | Slight overhead |
| **Events** | Can subscribe to injected photon's channels | No event access |
| **Use case** | Default for all photon composition | Dynamic/optional deps only |
