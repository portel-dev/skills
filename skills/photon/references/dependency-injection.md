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
export default class FileProcessor extends PhotonMCP {
  constructor(private fs: any, private github: any) { super(); }

  async process({ path }: { path: string }) {
    const content = await this.fs.read_file({ path });
    return `Processed ${content.length} bytes`;
  }
}
```

## Photon Injection (`@photon`)

Declare photon dependencies for auto-install and auto-load.

### Approach 1: Constructor Injection

```typescript
/**
 * @photon billing billing-photon
 * @photon shipping shipping-photon
 */
export default class OrderProcessor extends PhotonMCP {
  constructor(private billing: any, private shipping: any) { super(); }

  async process({ orderId }: { orderId: string }) {
    const invoice = await this.billing.generate({ orderId });
    return { invoice };
  }
}
```

### Approach 2: Daemon-Routed (`this.call()`)

```typescript
/**
 * @photon billing billing-photon
 */
export default class OrderProcessor extends PhotonMCP {
  async process({ orderId }: { orderId: string }) {
    const invoice = await this.call('billing.generate', { orderId });
    return { invoice };
  }
}
```

### Comparison

| | Constructor Injection | `this.call()` |
|---|---|---|
| **Setup** | `@photon` + constructor param | `@photon` only |
| **Execution** | In-process, direct | Via daemon, cross-process |
| **Speed** | Faster (no IPC) | Slight overhead |
| **Use case** | Tightly coupled helpers | Loosely coupled services |
