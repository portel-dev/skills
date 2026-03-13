# Directory Structure Convention

The `~/.photon/` directory has a strict separation between **source/assets** (what the photon is) and **runtime data** (what the photon produces). Mixing these causes file watcher loops and hot-reload bugs.

## Layout

```
~/.photon/
├── <name>.photon.ts          # Source file (or symlink to dev repo)
├── <name>/                   # Asset folder (UI templates, images, CSS)
│   └── ui/
│       └── dashboard.html
│
├── state/<name>/             # Runtime: persisted state (this.memory, settings)
│   ├── default.json          # Default instance state
│   ├── default.log           # Default instance event log
│   └── default-settings.json # User settings
│
├── data/<name>/              # Runtime: photon-written data (auth, media, downloads)
│   ├── auth/                 # Example: WhatsApp auth state
│   └── media/                # Example: downloaded files
│
├── cache/                    # Runtime: compiled .mjs cache, completions
│   └── completions.cache
│
├── logs/<name>/              # Runtime: execution logs, audit trails
│   └── executions.jsonl
│
└── config.json               # Global daemon config
```

## The Two Zones

### Source Zone (top-level)

| Path | Purpose | Managed By |
|------|---------|------------|
| `<name>.photon.ts` | Photon source file | Developer (or symlink) |
| `<name>/` | Asset folder for `@ui`, `@prompt`, `@resource` | Developer |

The **file watcher** monitors this zone for hot-reload. Only `.photon.ts` file changes at the top level trigger reloads. Asset folders are watched separately via symlink target watchers.

For symlinked photons (development mode), the asset folder is resolved at the **symlink target** — e.g., if `~/.photon/my-app.photon.ts` → `/Projects/my-app/my-app.photon.ts`, assets are discovered at `/Projects/my-app/my-app/`.

### Runtime Zone (subdirectories)

| Path | Purpose | Managed By |
|------|---------|------------|
| `state/<name>/` | `this.memory`, settings, event logs | Runtime (automatic) |
| `data/<name>/` | Photon-written files (auth, media, downloads) | Photon code (manual) |
| `cache/` | Compiled TypeScript cache | Runtime (automatic) |
| `logs/<name>/` | Execution audit logs | Runtime/daemon (automatic) |

The **file watcher ignores** everything in runtime subdirectories. Writing to these paths will never trigger hot-reload.

## Rules for Photon Authors

### DO: Store runtime data in `data/<name>/`

```typescript
import * as os from 'os';
import * as path from 'path';

const DATA_DIR = path.join(os.homedir(), '.photon', 'data', 'my-app');

// Auth state, downloaded files, caches, databases — all go here
const authDir = path.join(DATA_DIR, 'auth');
const mediaDir = path.join(DATA_DIR, 'media');
```

### DON'T: Write runtime data to the asset folder

```typescript
// WRONG — triggers hot-reload loops!
const authDir = path.join(os.homedir(), '.photon', 'my-app', 'auth');

// WRONG — any subfolder under ~/.photon/<name>/ is the asset zone
const mediaDir = path.join(os.homedir(), '.photon', 'my-app', 'media');
```

### DON'T: Write data directly under `~/.photon/`

```typescript
// WRONG — pollutes the source zone
const dbFile = path.join(os.homedir(), '.photon', 'my-data.db');
```

## How the Runtime Uses Each Directory

| API | Reads From | Writes To |
|-----|-----------|-----------|
| `this.memory.get/set()` | `state/<name>/` | `state/<name>/` |
| `this.settings` | `state/<name>/-settings.json` | `state/<name>/-settings.json` |
| `@ui` / `discoverAssets()` | `<name>/` (or symlink target) | — |
| `this.schedule` | `state/<name>/` | `state/<name>/` |
| Event logs | — | `logs/<name>/` |
| Compiled cache | — | `cache/` |
