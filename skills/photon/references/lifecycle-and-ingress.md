# Lifecycle Hooks & Ingress Model

**Status**: Design approved, implementation in progress (as of 2026-04-17)

Preview of upcoming photon runtime capabilities. When skill authors see these tags or methods in photon authoring, route to this reference. Full authoritative design: [`portel-dev/photon` → docs/internals/LIFECYCLE-AND-INGRESS.md](https://github.com/portel-dev/photon/blob/main/docs/internals/LIFECYCLE-AND-INGRESS.md).

---

## The principle: ingress × visibility are orthogonal

| Ingress | MCP tool list | Notes |
|---|---|---|
| Regular method | Visible | Default. |
| `@webhook` | **Hidden** | HTTP-only endpoint. |
| `@scheduled` | Visible | Runs on schedule AND user-callable. |
| `@internal` | Hidden | Opt-out. Composes with any ingress. |
| Lifecycle hooks | Hidden | Runtime-only. |

Compose by stacking tags:

```ts
/** @scheduled 0 0 * * *
 *  @internal */
async nightlyCleanup() { ... }   // scheduled + hidden from MCP
```

---

## Lifecycle hooks

### Existing (already shipped, do not rename)

Photons already have two lifecycle hooks. This design does **not** change them.

```ts
class MyPhoton extends Photon {
  async onInitialize() { /* async init: DB, external subs, cache warm-up */ }
  async onShutdown()   { /* flush, close, cancel — runs on SIGTERM/unload */ }
}
```

Already wired across both loaders, Beam drain on SIGTERM, hot-reload, and worker-thread auto-detection. Scaffolded by the default photon template.

### New in round 1

One genuinely new hook. Optional, async, hidden from MCP.

```ts
class MyPhoton extends Photon {
  async onError(err, ctx) { /* centralized error observability */ }
}
```

- `onError(err, ctx)` — fires after any tool method throws. Observability only; cannot suppress or transform the error. A throw or timeout inside `onError` is logged and swallowed. Default timeout is 5s.

### State preservation across hot reload (existing, now consistent)

No new hook for state-preserving reload — the existing hooks already support it via context parameters:

```ts
class MyPhoton extends Photon {
  async onShutdown(ctx) {
    if (ctx?.reason === 'hot-reload') return; // skip destructive cleanup
    await this.socket?.close();
  }
  async onInitialize(ctx) {
    if (ctx?.reason === 'hot-reload' && ctx.oldInstance?.socket) {
      this.socket = ctx.oldInstance.socket; // reuse the live socket
      return;
    }
    this.socket = await openSocket();
  }
}
```

Non-function own properties are auto-transferred from `oldInstance` to the new instance, so only non-copyable resources (sockets, timers, DB connections) need explicit handling. The daemon hot-reload path already passed this context; round 1 fixes the Beam hot-reload path to match.

### Ordering with `@photon` deps

- `onInitialize` fires in dependency order (deps first).
- `onShutdown` fires in reverse (dependents first).

---

## Webhooks v2

### Hidden from MCP
Any method marked `@webhook` is an HTTP endpoint only. It does not appear in the MCP tool list.

### Per-service authentication
Declarative auth with built-in verifiers for common providers:

```ts
/**
 * @webhook stripe/events
 * @webhook-auth stripe Stripe-Signature env:STRIPE_WEBHOOK_SECRET
 */
async handleStripe(body: any) { ... }

/**
 * @webhook github/push
 * @webhook-auth github-sha256 X-Hub-Signature-256 env:GH_WEBHOOK_SECRET
 */
async onPush(body: any) { ... }
```

Built-in schemes: `stripe`, `github-sha256`, `github-sha1`, `slack`, `twilio`, `hmac-sha256`, `hmac-sha1`, `bearer`, `shared-secret`, `none`.

The runtime verifies signatures before dispatch. Handlers never see unauthenticated traffic.

### Raw body access
For custom verification, `_webhook.raw` exposes the unparsed bytes.

### CLI testing
```bash
photon webhook stripe handleStripe --body @event.json --sign stripe --secret env:STRIPE_WEBHOOK_SECRET
photon webhook forms handleSubmission --body @sample.json --dry-run
```

### Breaking change: no more `handle*` prefix
Only `@webhook` declares a webhook. The `handle*` auto-registration is removed (one-minor-version warning window before silence). Migration: add `@webhook` to each `handle*` method.

---

## `@scheduled` (was `@cron`)

`@cron` becomes a soft-deprecated alias for `@scheduled`. The rename unlocks broader syntax:

```ts
@scheduled 0 * * * *                   // cron (canonical)
@scheduled every 5 minutes             // interval
@scheduled daily at 9am                // natural
@scheduled at 2026-05-01T00:00:00Z     // one-shot
```

Use cron for complex schedules, the natural forms for readability on common cases.

---

## Skill-author checklist

When helping photon authors, check for these patterns and route them to the right primitives:

1. **Async setup in constructor** → use `onInitialize` (already available).
2. **Cleanup in a `dispose`/`close` method called from nowhere** → move to `onShutdown` (already available).
3. **Photon that needs to survive hot-reload with live connections** → branch on `ctx?.reason === 'hot-reload'` in `onInitialize`/`onShutdown`; use `ctx.oldInstance` to reuse non-copyable resources.
4. **Per-method try/catch for logging** → consider `onError` instead (round 1 new).
5. **`handle*` methods** → add explicit `@webhook`; migration required before next major.
6. **`@cron`** → prefer `@scheduled`; alias still works.
7. **Webhook with HMAC verification inside the method body** → move to declarative `@webhook-auth`.
8. **`PHOTON_WEBHOOK_SECRET` in production** → upgrade to per-method `@webhook-auth`.

---

## Related

- [docblock-tags.md](./docblock-tags.md) — current tag reference (will be updated when implementation lands)
- [daemon-features.md](./daemon-features.md) — webhook + schedule runtime surface
- [Full design in photon repo](https://github.com/portel-dev/photon/blob/main/docs/internals/LIFECYCLE-AND-INGRESS.md)
