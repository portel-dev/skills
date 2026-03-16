# Daemon Features

Tags for webhooks, scheduled jobs, distributed locks, and worker isolation. Extracted at build time and used by the Photon daemon.

## Worker Thread Isolation (`@worker` / `@noworker`)

Photons that manage long-running resources (WebSocket connections, polling loops, auth sessions) run in isolated worker threads. If another photon crashes or a hot-reload fails, isolated photons are unaffected.

**Auto-detection:** Photons with both `onShutdown()` and `onInitialize()` lifecycle methods are automatically placed in workers — no tag needed.

**Explicit control:**

```typescript
/**
 * @worker          ← force isolation (even without lifecycle hooks)
 */
export default class MyConnector extends Photon { ... }

/**
 * @noworker        ← force in-process (even with lifecycle hooks)
 */
export default class FastDev extends Photon { ... }
```

**Priority:** `@noworker` > `@worker` > auto-detect (lifecycle hooks) > default (in-process)

**What changes in a worker:**
- Tool calls routed via IPC (~1-2ms overhead)
- `@photon` cross-deps resolved via RPC through main thread
- Pub/sub events bridged automatically between workers
- Crash only affects that worker — other photons keep running
- Hot-reload within the worker; failure preserves old instance

## Webhooks (`@webhook`)

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

- `@webhook` — uses method name as endpoint path
- `@webhook <path>` — custom path
- `handle*` prefix — auto-detected as webhook

## Scheduled Jobs (`@scheduled` / `@cron`)

```typescript
/** @scheduled 0 0 * * * */
async archive(): Promise<{ archived: number }> { /* daily at midnight */ }

/** @cron 30 2 * * 1-5 */
async cleanup(): Promise<void> { /* Mon-Fri at 02:30 */ }
```

Cron format: `minute hour day-of-month month day-of-week`

Common patterns: `0 0 * * *` (daily), `0 * * * *` (hourly), `0 0 * * 0` (weekly Sunday)

**Static vs Runtime:** `@scheduled`/`@cron` are for fixed schedules known at build time. For dynamic schedules created at runtime, use `this.schedule`:

```typescript
// Create a schedule programmatically
await this.schedule.create({
  name: 'user-backup',
  schedule: '0 2 * * *',       // 5-field cron
  method: 'backup',
  params: { userId: 'abc' },
});

// Shorthands: @hourly, @daily, @weekly, @monthly, @yearly
await this.schedule.create({ name: 'check', schedule: '@hourly', method: 'poll' });

// Manage: pause, resume, cancel, list, update
await this.schedule.pause(taskId);
await this.schedule.resume(taskId);
await this.schedule.cancel(taskId);
const active = await this.schedule.list('active');
await this.schedule.update(taskId, { schedule: '0 3 * * *' });

// One-shot (runs once then auto-completes)
await this.schedule.create({ name: 'reminder', schedule: '@daily', method: 'notify', fireOnce: true });
```

Full API: `create`, `get`, `getByName`, `list`, `update`, `pause`, `resume`, `cancel`, `cancelByName`, `cancelAll`, `has`.

## Distributed Locks (`@locked`)

```typescript
/** @locked */
async updateBoard(params: { board: string; data: any }) {
  // Lock name: "updateBoard" (method name)
}

/** @locked board:write */
async batchUpdate(params: { taskIds: string[] }) {
  // Custom lock name: "board:write"
}
```

For dynamic lock names, use `this.withLock()`:

```typescript
async moveTask(params: { taskId: string; column: string }) {
  return this.withLock(`task:${params.taskId}`, async () => {
    const task = await this.loadTask(params.taskId);
    task.column = params.column;
    await this.saveTask(task);
    return task;
  });
}
```

## Async Execution (`@async`)

Background tasks that return an execution ID immediately:

```typescript
/**
 * @async
 * @param quarter The quarter (e.g. "Q1-2026")
 */
async generate({ quarter }: { quarter: string }) {
  const report = await this.buildReport(quarter);
  return report; // Stored in audit trail
}
```

Client receives: `{ executionId: "exec_...", status: "running" }`

Results stored in `~/.photon/logs/{photonId}/executions.jsonl`.
