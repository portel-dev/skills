# Output Formats Reference

Use `@format` on methods to control how results render in Beam UI and CLI.

## Structural Formats

| Value | Description | Example Return |
|-------|-------------|----------------|
| `primitive` | Single value | `"Hello"` or `42` |
| `table` | Array of objects as table | `[{ name: "a", value: 1 }]` |
| `list` | Styled list (iOS-inspired) | `[{ name: "...", email: "..." }]` |
| `grid` | Visual grid | `[{ title: "...", image: "..." }]` |
| `tree` | Hierarchical data | `{ children: [...] }` |
| `card` | Single object as card | `{ title: "...", body: "..." }` |
| `checklist` | Interactive checkbox list with drag reorder | `[{ text: "Ship v2", done: false }]` |
| `article` | Magazine-style text flow around images | `{ text: "...", images?: [{ url, position?, caption? }] }` |
| `steps` / `stepper` | Step-by-step progress indicator | `[{ label: "Install", status: "complete" }]` |
| `kanban` | Kanban board with columns and cards | `{ columns: [{ title: "Todo", items: [...] }] }` |
| `comparison` | Side-by-side property comparison | `{ items: [{ name: "A", price: "$9" }], highlight: "A" }` |

## Content Formats

| Value | Description |
|-------|-------------|
| `json` | JSON syntax highlighting |
| `markdown` | Markdown rendering (supports mermaid code blocks) |
| `yaml` / `xml` / `html` | Syntax highlighting |
| `mermaid` | Mermaid diagram rendering |
| `code` / `code:typescript` / `code:python` | Syntax-highlighted code (keywords, strings, numbers, comments). Colors use `--syntax-*` CSS variables. |
| `diff` | Unified diff string or `{ before, after, filename? }` — added/removed line highlighting |
| `log` | `[{ level, message, timestamp?, source? }]` — structured log viewer with level coloring |
| `embed` | URL string or `{ url, title? }` — embed external content in an iframe |

## Visualization Formats

| Value | Description |
|-------|-------------|
| `chart` | Auto-detect chart type from data shape |
| `chart:bar` / `chart:line` / `chart:pie` | Specific chart types |
| `chart:hbar` | Horizontal bar chart (same data shape as `chart:bar`) |
| `chart:area` / `chart:scatter` / `chart:donut` / `chart:radar` | More chart types |
| `metric` | KPI display (big number + label + delta) |
| `stat-group` | Row of KPI stat cards — `[{ label, value, delta?, trend?, prefix?, suffix? }]` |
| `gauge` | Circular gauge/progress indicator |
| `progress` | Animated progress bar with percentage |
| `badge` | Colored status badge (auto-detects variant from text) |
| `timeline` | Vertical timeline of events |
| `heatmap` | Color-intensity grid — `{ rows, cols, values }` or `[{ rowKey, colKey, value }]` |
| `calendar` | Monthly/weekly calendar — `[{ title, start, end?, allDay?, color? }]` |
| `map` | Interactive map with markers — `[{ lat, lng, label?, popup? }]` |
| `network` / `graph` | Node-edge graph — `{ nodes: [{ id, label, group? }], edges: [{ from, to, label? }] }` |
| `cron` | Human-readable cron display — expression string or `{ expression, description? }` |
| `qr` | QR code from URL/text |
| `dashboard` | Composite grid of auto-detected panels |
| `cart` | Shopping cart with item rows + totals |

## Design / Layout Formats

| Value | Description |
|-------|-------------|
| `image` | URL string, `{ src, caption? }`, or array — single image or image list |
| `carousel` | `[{ src, caption? }]` — horizontally scrolling image carousel |
| `gallery` | `[{ src, caption?, full? }]` — thumbnail grid with lightbox expand |
| `masonry` | `[{ src, caption? }]` — Pinterest-style masonry image grid |
| `hero` | `{ title, subtitle?, image?, cta?, url? }` — full-width hero section |
| `banner` | `{ message, type?, icon? }` — dismissable notification banner (`type`: `info`/`success`/`error`/`warning`) |
| `quote` | `{ text, author?, source?, avatar? }` — styled pull-quote with attribution |
| `profile` | `{ name, avatar?, role?, bio?, stats?: { key: value } }` — user/entity profile card |
| `feature-grid` | `[{ icon, title, description }]` — marketing feature grid |
| `invoice` / `receipt` | `{ number?, date?, from?, to?, items: [{ description, quantity, rate, amount }], subtotal?, tax?, total?, notes? }` — itemized invoice with totals |

## Presentation Format

| Value | Description |
|-------|-------------|
| `slides` | Marp-style markdown slide deck with keyboard navigation and fullscreen |

```typescript
/**
 * @format slides
 */
async present() {
  return `---
marp: true
theme: gaia
paginate: true
footer: Acme Corp © 2026
---

# Welcome to Acme

![Logo](images/logo.png)

---

## Revenue

- Q1: $12M (+15%)
- Q2: $14M (+22%)

---

# Thank You
`;
}
```

**Frontmatter options:**

| Key | Description |
|-----|-------------|
| `theme` | `default`, `gaia`, `uncover`, `rose`, `dracula`. Auto-detects from Beam theme if omitted. |
| `paginate` | `true` to show slide numbers |
| `header` | Text shown at top of every slide |
| `footer` | Text shown at bottom of every slide |
| `backgroundColor` | Override slide background color |
| `color` | Override text color |
| `baseUrl` | Base URL for relative image/link paths. Defaults to `/api/assets/{photonName}/`. |

**Images:** Use relative paths — they resolve against the photon's `assets/` folder automatically. Place images at `my-photon/assets/images/logo.png`, reference as `![Logo](images/logo.png)`.

**Keyboard:** ← → Space PgUp PgDn Home End for navigation, F for fullscreen.

**Auto-detection:** Returns a string with `marp: true` frontmatter or 3+ `---` separators → auto-detected as slides.

## Checklist Format

Interactive todo/task list with checkboxes, drag reorder, and progress tracking.

```typescript
/**
 * @format checklist
 * @stateful
 */
list() {
  return this.items; // [{text: string, done: boolean}]
}
```

**Data shape:** `{text, done}[]` — array position is the order.

**Features:**
- Custom checkboxes (not native) with accent fill and SVG checkmark
- Done items sink below a "Completed (N)" separator
- "Hide completed" / "Show completed" toggle
- Progress bar showing done/total ratio
- Drag-and-drop reorder with 6-dot grip handle
- Interactive: clicking a checkbox calls `check` method on the photon
- Auto-detected from any `{text, done}[]` data shape (also detects `title`/`name` + `completed`/`checked` variants)

**CLI rendering:** ASCII checkboxes with strikethrough:
```
2/3 done

  ○ Ship v2.0
  ○ Write blog post
  ✓ Record demo
```

## Article Format

Magazine-style text layout with images and multi-column support.

```typescript
/** @format article */
sample() {
  return {
    text: "The future of...",
    images: [
      { url: "https://...", width: 280, height: 210, position: "right", caption: "AI interfaces" }
    ]
  };
}
```

**Data shape:** `{text: string, images?: [{url, width?, height?, position?: 'left'|'right', caption?}]}`

**Rendering:**
- With images: text flows around positioned images using CSS float (Pretext Canvas path available for advanced layouts)
- Without images: automatic two-column layout with column-rule divider
- Drop cap on first paragraph
- Powered by @chenglou/pretext for DOM-free text measurement

## .photon.md Files

Markdown files with live data-method embeds. Same syntax as .photon.html but authored in markdown.

```markdown
# Dashboard

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">

<div style="padding: 16px;">

## Tasks
<div data-method="list" data-format="checklist"></div>

</div>

<div style="padding: 16px;">

## Stats
<div data-method="stats" data-format="metric"></div>

</div>

</div>
```

Place in `<photon-name>/ui/<id>.photon.md`. Reference with `@ui <id> ./ui/<id>.photon.md`.

File resolution priority: `.photon.html` > `.photon.md` > `.html`

## Container Formats

Containers wrap inner content. Data must be an object — keys become section titles.

| Value | Description |
|-------|-------------|
| `panels` | CSS grid of titled panels |
| `tabs` | Tab bar switching between items |
| `accordion` | Collapsible sections |
| `stack` | Vertical stack with spacing |
| `columns` | Side-by-side columns (2-4) |

```typescript
/** @format panels {@inner card, @columns 3} */
async overview(): Promise<{ users: User[]; orders: Order[]; stats: Stats }>

/** @format tabs {@inner kv, @style pills} */
async settings(): Promise<{ general: object; advanced: object }>
```

## Layout Hints

For `list`, `table`, and `grid`:

```typescript
/** @format list {@title name, @subtitle email, @icon avatar, @badge status, @style inset} */
async getUsers(): Promise<User[]>
```

| Hint | Description |
|------|-------------|
| `@title fieldName` | Primary display field |
| `@subtitle fieldName` | Secondary text field |
| `@icon fieldName` | Leading visual (avatar, image) |
| `@badge fieldName` | Status badge field |
| `@detail fieldName` | Trailing detail value |
| `@style styleName` | `plain`, `grouped`, `inset`, `inset-grouped` |
| `@columns N` | Number of columns (for grid) |

For `chart` formats:

```typescript
/** @format chart:bar {@label region, @value revenue} */
async revenueByRegion(): Promise<{ region: string; revenue: number }[]>

/** @format chart:line {@x date, @y signups} */
async signupTrend(): Promise<{ date: string; signups: number }[]>
```

| Hint | Description |
|------|-------------|
| `@label fieldName` | Chart labels (categories, pie segments) |
| `@value fieldName` | Chart values (y-axis, sizes) |
| `@x` / `@y` | Axis mapping |
| `@series fieldName` | Group into multiple series |

For `gauge`: `@min N`, `@max N`

For `timeline`: `@date fieldName`, `@title fieldName`, `@description fieldName`

For containers: `@inner layoutType`, `@columns N`, `@style pills|bordered`

## Auto-Detection

When no `@format` is specified, the auto-UI detects visualization types from data shape:

| Data Shape | Detected Layout |
|------------|----------------|
| Array with `price` + `quantity`/`qty` | `cart` |
| Array with 1 string + 1 numeric field | `chart` (pie/bar) |
| Array with date + numeric fields | `chart` (line) |
| Array with date + title/description (3+ items) | `timeline` |
| Object with 1 numeric + few string fields | `metric` |
| Object with `value` + `max`/`min` or `progress` | `gauge` |
| Object with 3+ keys mixing arrays, objects, numbers | `dashboard` |
