# Protocol Mapping: MCP Apps Standard ↔ Photon

## Message Flow Comparison

### Standard MCP Apps (ext-apps SDK)

```
1. Host creates iframe with sandbox proxy (double-iframe for web)
2. App calls app.connect() → sends ui/initialize request
3. Host responds with hostContext, hostCapabilities, protocolVersion
4. App sends ui/notifications/initialized
5. Host sends ui/notifications/tool-input (complete args)
6. Host sends ui/notifications/tool-result (after execution)
7. App calls tools/call via postMessage for interactive tool calls
8. Host forwards to MCP server, returns JSON-RPC response
```

### Photon Beam

```
1. Host creates single sandboxed iframe with srcdoc
2. Bridge script auto-injected before </head>
3. Bridge sends photon:ready + ui/ready on load
4. Host sends photon:theme-change with tokens
5. Host sends photon:init with toolInput/context (or photon:result with data)
6. UI calls tools/call via postMessage (JSON-RPC 2.0)
7. Host (beam-app.ts) forwards to MCP server via mcpClient.callTool()
8. Host returns JSON-RPC response to iframe
```

## JSON-RPC Messages (Shared)

Both Photon and the standard use `tools/call` over postMessage:

```javascript
// UI → Host (request)
{
  jsonrpc: "2.0",
  id: "call_1_abc123",
  method: "tools/call",
  params: {
    name: "methodName",
    arguments: { key: "value" }
  }
}

// Host → UI (response)
{
  jsonrpc: "2.0",
  id: "call_1_abc123",
  result: {
    content: [{ type: "text", text: "{...}" }]
  }
}
```

## Initialization Differences

### Standard: ui/initialize handshake

```javascript
// App → Host
{
  jsonrpc: "2.0",
  id: 1,
  method: "ui/initialize",
  params: {
    appInfo: { name: "My App", version: "1.0.0" },
    appCapabilities: { tools: { listChanged: true } },
    protocolVersion: "2026-01-26"
  }
}

// Host → App (response)
{
  jsonrpc: "2.0",
  id: 1,
  result: {
    protocolVersion: "2026-01-26",
    hostInfo: { name: "Claude", version: "1.0" },
    hostCapabilities: {
      openLinks: {},
      serverTools: { listChanged: true },
      logging: {},
      sandbox: { permissions: {}, csp: {} }
    },
    hostContext: {
      theme: "dark",
      styles: { variables: { "--color-background": "#1a1a1a" } },
      displayMode: "inline",
      locale: "en-US",
      containerDimensions: { maxHeight: 600 }
    }
  }
}

// App → Host (notification)
{ jsonrpc: "2.0", method: "ui/notifications/initialized" }
```

### Photon: Bridge auto-initialization

```javascript
// Bridge auto-sends on load:
{ type: "photon:ready" }
{ jsonrpc: "2.0", method: "ui/ready", params: {} }
{ type: "photon:get-state" }  // Request persisted widget state

// Host sends back:
{
  type: "photon:theme-change",
  theme: "dark",
  themeTokens: { "--color-bg": "#0d0d0d", ... }
}

// Host also handles ui/initialize if app sends it (for standard-built apps)
```

## Tool Result Delivery

### Standard

```javascript
// Host → App (notification after tool completes)
{
  jsonrpc: "2.0",
  method: "ui/notifications/tool-result",
  params: {
    content: [{ type: "text", text: "..." }],
    structuredContent: { /* optional */ }
  }
}
```

### Photon

```javascript
// Host → App
{
  type: "photon:result",
  data: { /* raw MCP result */ }
}

// Also supports MCP standard format (handled by bridge):
{
  jsonrpc: "2.0",
  method: "ui/notifications/tool-result",
  params: { result: /* ... */ }
}
```

## Features Only in Photon

### Generator Method Events

```javascript
// Host → App (from async * yield { emit: 'progress', ... })
{
  type: "photon:emit",
  event: { emit: "progress", current: 5, total: 10 }
}

{
  type: "photon:emit",
  event: { emit: "status", message: "Processing step 5..." }
}
```

### Elicitation (Interactive Prompts)

```javascript
// Host → App (from yield { ask: 'confirm', ... })
{
  type: "photon:ask",
  id: "ask_123",
  event: { ask: "confirm", message: "Deploy to production?" }
}

// App → Host (user response)
{
  type: "photon:ask-response",
  id: "ask_123",
  value: true
}
```

### Widget State Persistence

```javascript
// App → Host
{ type: "photon:set-state", state: { page: 2, filter: "active" } }

// Host → App (on load, if state exists)
{ type: "photon:init-state", state: { page: 2, filter: "active" } }
```

### File Upload/Download

```javascript
// App → Host
{
  type: "photon:upload-file",
  callId: "call_1",
  fileName: "data.csv",
  fileType: "text/csv",
  fileSize: 1024,
  data: "data:text/csv;base64,..."
}

// Host → App
{ type: "photon:upload-file-response", callId: "call_1", fileId: "file_abc" }
```

## Features Only in Standard (Not Yet in Photon)

| Feature | Standard Method | Status in Photon |
|---|---|---|
| Streaming partial input | `ui/notifications/tool-input-partial` | Not implemented |
| Model context update | `ui/update-model-context` | Not implemented |
| Open external link | `ui/open-link` | Via `window.openai.openExternal()` (different protocol) |
| Display mode request | `ui/request-display-mode` | Via `window.openai.requestDisplayMode()` |
| Resource teardown | `ui/resource-teardown` | Not implemented |
| Double-iframe sandbox | Outer proxy + inner app | Single iframe with srcdoc |
| CSP metadata | `_meta.ui.csp` on resources | Not implemented |
| Permission requests | `_meta.ui.permissions` | Not implemented |
| Tool visibility | `_meta.ui.visibility: ["app"]` | Not implemented |
| Auto-resize | `ui/notifications/size-changed` | Via `notifyIntrinsicHeight()` |
| Host CSS variables (88) | `hostContext.styles.variables` | Photon theme tokens (similar but different keys) |
| Host font injection | `hostContext.styles.css.fonts` | Not implemented |
| Safe area insets | `hostContext.safeAreaInsets` | Not implemented |

## Resource URI Format

Both use the same scheme:

```
ui://<server-or-photon-name>/<resource-id>
```

Standard example: `ui://weather-server/forecast`
Photon example: `ui://my-app/dashboard`

MIME type (both): `text/html;profile=mcp-app`
