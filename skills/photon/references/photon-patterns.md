# Photon Patterns and Their Mermaid Equivalents

## Emit Patterns

### Status Emit

**Photon:**
```typescript
yield { emit: 'status', message: 'Processing data...' };
```

**Mermaid:**
```mermaid
STATUS[📢 Processing data...]
```

---

### Progress Emit

**Photon:**
```typescript
yield { emit: 'progress', value: 0.5, message: 'Halfway there' };
```

**Mermaid:**
```mermaid
PROGRESS[⏳ 50% Halfway there]
```

---

### Toast Emit

**Photon:**
```typescript
yield { emit: 'toast', message: 'Saved!', type: 'success' };
```

**Mermaid:**
```mermaid
TOAST[🎉 Saved!]
```

---

### Log Emit

**Photon:**
```typescript
yield { emit: 'log', message: 'Debug info', level: 'debug' };
```

**Mermaid:**
```mermaid
LOG[📝 Debug info]
```

Note: Logs are often omitted from diagrams for clarity. Include only significant logs.

---

### Thinking Emit

**Photon:**
```typescript
yield { emit: 'thinking', active: true };
// ... long operation
yield { emit: 'thinking', active: false };
```

**Mermaid:**
```mermaid
THINK_START[🧠 Thinking...]
LONG_OP[🔄 Long operation]
THINK_END[🧠 Done]

THINK_START --> LONG_OP --> THINK_END
```

---

### Artifact Emit

**Photon:**
```typescript
yield { emit: 'artifact', type: 'json', title: 'Results', content: data };
```

**Mermaid:**
```mermaid
ARTIFACT[📊 Show: Results]
```

---

## Ask Patterns

### Confirm Ask

**Photon:**
```typescript
const proceed: boolean = yield {
  ask: 'confirm',
  message: 'Continue with operation?',
  dangerous: false
};

if (!proceed) {
  return { cancelled: true };
}
```

**Mermaid:**
```mermaid
CONFIRM{🙋 Continue with operation?}
CONFIRM -->|No| CANCELLED([❌ Cancelled])
CONFIRM -->|Yes| NEXT_STEP
```

---

### Dangerous Confirm

**Photon:**
```typescript
const confirmed: boolean = yield {
  ask: 'confirm',
  message: 'Delete all data?',
  dangerous: true
};
```

**Mermaid:**
```mermaid
CONFIRM{⚠️🙋 Delete all data?}
```

Note: Use ⚠️ prefix for dangerous confirmations.

---

### Select Ask (Single)

**Photon:**
```typescript
const format: string = yield {
  ask: 'select',
  message: 'Choose output format:',
  options: ['JSON', 'CSV', 'XML']
};

switch (format) {
  case 'JSON': // ...
  case 'CSV': // ...
  case 'XML': // ...
}
```

**Mermaid:**
```mermaid
SELECT{📋 Choose output format}
SELECT -->|JSON| JSON_PATH[💾 Save JSON]
SELECT -->|CSV| CSV_PATH[💾 Save CSV]
SELECT -->|XML| XML_PATH[💾 Save XML]
```

---

### Select Ask (Multi)

**Photon:**
```typescript
const features: string[] = yield {
  ask: 'select',
  message: 'Enable features:',
  options: ['Auth', 'Logging', 'Metrics'],
  multi: true
};
```

**Mermaid:**
```mermaid
SELECT{📋 Enable features (multi)}
SELECT --> PROCESS[🔄 Process selected]
```

Note: Multi-select is harder to visualize; show as single node with note.

---

### Text Ask

**Photon:**
```typescript
const name: string = yield {
  ask: 'text',
  message: 'Enter project name:',
  default: 'my-project'
};
```

**Mermaid:**
```mermaid
INPUT{✏️ Enter project name}
INPUT --> NEXT[Use name]
```

---

### Number Ask

**Photon:**
```typescript
const count: number = yield {
  ask: 'number',
  message: 'How many items?',
  min: 1,
  max: 100,
  default: 10
};
```

**Mermaid:**
```mermaid
INPUT{🔢 How many items? (1-100)}
```

---

### Password Ask

**Photon:**
```typescript
const apiKey: string = yield {
  ask: 'password',
  message: 'Enter API key:'
};
```

**Mermaid:**
```mermaid
INPUT{🔒 Enter API key}
```

---

## MCP Call Patterns

### Simple MCP Call

**Photon:**
```typescript
const result = await this.mcp('gmail').sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  body: 'World'
});
```

**Mermaid:**
```mermaid
MCP[📧 gmail.sendEmail]
```

---

### MCP with Error Handling

**Photon:**
```typescript
try {
  await this.mcp('slack').postMessage({ channel, text });
} catch (error) {
  yield { emit: 'toast', message: 'Slack failed', type: 'error' };
  return { success: false, error };
}
```

**Mermaid:**
```mermaid
MCP[💬 slack.postMessage]
MCP --> SUCCESS
MCP -.->|Error| ERROR[⚠️ Slack failed]
ERROR --> FAILED([❌ Failed])
```

---

## Photon Call Patterns

### Call Another Photon

**Photon:**
```typescript
const rss = yield* this.photon('rss-aggregator').quickAggregate({
  feeds: ['https://hn.rss'],
  format: 'json'
});
```

**Mermaid:**
```mermaid
PHOTON[📦 rss-aggregator.quickAggregate]
```

---

### Chain Photons

**Photon:**
```typescript
const feeds = yield* this.photon('rss-aggregator').aggregate({ feeds });
const releases = yield* this.photon('github-tracker').track({ repos });
const digest = this.combine(feeds, releases);
```

**Mermaid:**
```mermaid
PHOTON1[📦 rss-aggregator.aggregate]
PHOTON2[📦 github-tracker.track]
COMBINE[🔄 Combine results]

PHOTON1 --> PHOTON2 --> COMBINE
```

---

## Control Flow Patterns

### Sequential Steps

**Photon:**
```typescript
yield { emit: 'status', message: 'Step 1' };
await this.doStep1();

yield { emit: 'status', message: 'Step 2' };
await this.doStep2();

yield { emit: 'status', message: 'Step 3' };
await this.doStep3();
```

**Mermaid:**
```mermaid
STEP1[📢 Step 1] --> DO1[🔄 doStep1]
DO1 --> STEP2[📢 Step 2] --> DO2[🔄 doStep2]
DO2 --> STEP3[📢 Step 3] --> DO3[🔄 doStep3]
```

---

### Early Return

**Photon:**
```typescript
if (items.length === 0) {
  yield { emit: 'toast', message: 'No items found', type: 'warning' };
  return { success: true, count: 0 };
}
```

**Mermaid:**
```mermaid
CHECK{Items exist?}
CHECK -->|No| EMPTY[⚠️ No items found]
EMPTY --> EARLY_END([✅ Success: 0])
CHECK -->|Yes| CONTINUE
```

---

### Loop Over Items

**Photon:**
```typescript
for (let i = 0; i < items.length; i++) {
  yield { emit: 'progress', value: i / items.length };
  await this.processItem(items[i]);
}
```

**Mermaid:**
```mermaid
LOOP_START[🔄 Process items]
LOOP_START --> PROGRESS[⏳ Progress]
PROGRESS --> PROCESS[Process item]
PROCESS --> MORE{More items?}
MORE -->|Yes| PROGRESS
MORE -->|No| DONE[Done]
```

---

### Try-Catch

**Photon:**
```typescript
try {
  const result = await this.riskyOperation();
  yield { emit: 'toast', message: 'Success!', type: 'success' };
} catch (error) {
  yield { emit: 'toast', message: error.message, type: 'error' };
  return { success: false };
}
```

**Mermaid:**
```mermaid
OP[🔄 Risky operation]
OP --> SUCCESS_TOAST[🎉 Success!]
OP -.->|Error| ERROR_TOAST[❌ Error message]
ERROR_TOAST --> FAILED([❌ Failed])
```

---

## Async Event Waiting

### Promise Resolver Pattern

When a generator needs to pause until an external system (WebSocket, event emitter, callback-based library) fires an event, use a deferred Promise whose resolver is called from the event handler.

**Photon:**
```typescript
async *connect() {
  yield { emit: 'status', message: 'Connecting...' };

  // Create a deferred promise
  let resolveEvent: (value: any) => void;
  const eventPromise = new Promise(resolve => { resolveEvent = resolve; });

  // Wire external events to the resolver
  this.socket.on('qr', (code) => resolveEvent({ type: 'qr', code }));
  this.socket.on('connected', () => resolveEvent({ type: 'connected' }));

  await this.initSocket();

  // Generator suspends here until one of the events fires
  const event = await eventPromise;

  if (event.type === 'qr') {
    yield { emit: 'qr', value: event.code, message: 'Scan to authenticate' };

    // Chain another deferred promise for the next event
    const connected = await new Promise(resolve => {
      this.socket.on('connected', () => resolve(true));
    });
  }

  yield { emit: 'toast', message: 'Connected!', type: 'success' };
  return { status: 'connected' };
}
```

**Mermaid:**
```mermaid
flowchart TD
    START([▶ Start]) --> STATUS[📢 Connecting...]
    STATUS --> SETUP[🔧 Wire event listeners]
    SETUP --> INIT[🔄 initSocket]
    INIT --> WAIT[⏳ Await external event]
    WAIT -->|qr| QR[📢 Scan to authenticate]
    QR --> WAIT2[⏳ Await connected]
    WAIT2 --> TOAST[🎉 Connected!]
    WAIT -->|connected| TOAST
    TOAST --> DONE([✅ Connected])
```

The key insight: `await eventPromise` suspends the generator until the external callback calls `resolveEvent(...)`. This bridges callback-based APIs into the linear generator flow. Chain multiple deferred promises to wait for a sequence of events.

---

## Dependency Declaration

### In Photon JSDoc

```typescript
/**
 * @name my-workflow
 * @dependencies lodash@^4.17.0, date-fns@^2.30.0
 * @mcps gmail, slack, notion
 * @photons rss-aggregator, github-tracker
 */
```

### In Mermaid

```mermaid
subgraph deps["Dependencies"]
    direction LR
    NPM1[📚 lodash]
    NPM2[📚 date-fns]
    MCP1[🔌 gmail]
    MCP2[🔌 slack]
    MCP3[🔌 notion]
    PHOTON1[📦 rss-aggregator]
    PHOTON2[📦 github-tracker]
end
```

Connect with dotted arrows from usage points:
```mermaid
SEND_EMAIL -.-> MCP1
POST_SLACK -.-> MCP2
FETCH_RSS -.-> PHOTON1
```

---

## Complete Workflow Template

### Photon

```typescript
/**
 * @name template-workflow
 * @description Template showing all common patterns
 * @mcps slack
 * @photons helper-photon
 */
export default class TemplateWorkflow {
  async *run(params: { input: string }) {
    // 1. Status
    yield { emit: 'status', message: 'Starting...' };

    // 2. Call another Photon
    const data = yield* this.photon('helper-photon').getData({ input: params.input });

    // 3. Progress
    yield { emit: 'progress', value: 0.5 };

    // 4. Confirm
    const proceed: boolean = yield { ask: 'confirm', message: 'Continue?' };
    if (!proceed) return { cancelled: true };

    // 5. Select
    const format: string = yield {
      ask: 'select',
      message: 'Format?',
      options: ['A', 'B']
    };

    // 6. MCP call
    await this.mcp('slack').post({ text: data });

    // 7. Toast
    yield { emit: 'toast', message: 'Done!', type: 'success' };

    return { success: true };
  }
}
```

### Mermaid

```mermaid
flowchart TD
    subgraph template-workflow["📦 Template Workflow"]
        START([▶ Start])
        START --> STATUS[📢 Starting...]
        STATUS --> PHOTON[📦 helper-photon.getData]
        PHOTON --> PROGRESS[⏳ 50%]
        PROGRESS --> CONFIRM{🙋 Continue?}
        CONFIRM -->|No| CANCELLED([❌ Cancelled])
        CONFIRM -->|Yes| SELECT{📋 Format?}
        SELECT -->|A| MCP
        SELECT -->|B| MCP
        MCP[💬 slack.post] --> TOAST[🎉 Done!]
        TOAST --> SUCCESS([✅ Success])
    end

    subgraph deps["Dependencies"]
        DEP1[🔌 slack]
        DEP2[📦 helper-photon]
    end

    MCP -.-> DEP1
    PHOTON -.-> DEP2
```
