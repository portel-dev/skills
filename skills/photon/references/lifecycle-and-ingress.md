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
| Lifecycle (`onStart`, etc.) | Hidden | Runtime-only. |

Compose by stacking tags:

```ts
/** @scheduled 0 0 * * *
 *  @internal */
async nightlyCleanup() { ... }   // scheduled + hidden from MCP
```

---

## Lifecycle hooks

Four reserved method names. All optional, all async, all hidden from MCP.

```ts
class MyPhoton extends Photon {
  async onStart()  { /* async init: DB, external subs, cache warm-up */ }
  async onStop()   { /* flush, close, cancel — runs on SIGTERM/unload */ }
  async onReload() { /* hot-reload rebind without losing state */ }
  async onError(err, ctx) { /* centralized error observability */ }
}
```

- `onStart` fires eagerly in Beam, lazily in CLI (before first invocation).
- `onStop` has a bounded timeout (10s default) so shutdown cannot hang.
- `@photon` dependencies start in dependency order; stop in reverse.

Use lifecycle hooks whenever the constructor would need to be `async` — that's the signal.

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

When helping photon authors, check for these patterns and route them to the new primitives:

1. **Async setup in constructor** → use `onStart`.
2. **Cleanup code in a `dispose`/`close` method called from nowhere** → move to `onStop`.
3. **`handle*` methods** → add explicit `@webhook`; migration required before next major.
4. **`@cron`** → prefer `@scheduled`; alias still works.
5. **Webhook with HMAC verification inside the method body** → move to declarative `@webhook-auth`.
6. **`PHOTON_WEBHOOK_SECRET` in production** → upgrade to per-method `@webhook-auth`.

---

## Related

- [docblock-tags.md](./docblock-tags.md) — current tag reference (will be updated when implementation lands)
- [daemon-features.md](./daemon-features.md) — webhook + schedule runtime surface
- [Full design in photon repo](https://github.com/portel-dev/photon/blob/main/docs/internals/LIFECYCLE-AND-INGRESS.md)
