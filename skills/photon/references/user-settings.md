# User Settings

Photons can expose configurable options via `protected settings`. The runtime auto-generates a settings MCP tool and persists values to disk.

## Declaration

```typescript
export default class MyAgent extends Photon {
  protected settings = {
    /** Polling interval in milliseconds */
    pollIntervalMs: 5000,
    /** Maximum concurrent operations */
    maxConcurrent: 3,
    /** Automatically resume after restart */
    autoResume: true,
  };

  async doWork() {
    const interval = this.settings.pollIntervalMs; // read-only Proxy
  }
}
```

## How It Works

1. **Declaration**: Define `protected settings = { ... }` with typed defaults and JSDoc descriptions
2. **Auto-generated tool**: Runtime creates a `settings` MCP tool with a form matching the settings shape
3. **Read-only Proxy**: `this.settings` is a Proxy — reads work, writes throw (use the settings tool instead)
4. **Persistence**: Values saved to `~/.photon/state/<name>/<instance>-settings.json`

## User Access

```bash
# View/edit settings via CLI
photon cli my-agent settings

# In Beam: click the settings icon on the photon card
```

## Auto-Resume Pattern

For photons that manage long-running connections or background tasks:

```typescript
export default class Connector extends Photon {
  protected settings = {
    /** Auto-reconnect on restart */
    autoResume: true,
    /** Connection target */
    target: '',
  };

  async onInitialize() {
    if (this.settings.autoResume && this.settings.target) {
      await this.connect({ target: this.settings.target });
    }
  }

  async connect({ target }: { target: string }) {
    // ... establish connection
  }
}
```

When the daemon restarts, `onInitialize` reads persisted settings and auto-resumes if configured.

## Key Rules

- Settings values must be JSON-serializable (no functions, classes, or circular refs)
- JSDoc on setting properties becomes field descriptions in the auto-generated form
- Default values determine the field type (number, string, boolean)
- Settings persist per instance — multiple instances of the same photon have independent settings
