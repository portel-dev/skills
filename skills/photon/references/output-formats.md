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

## Content Formats

| Value | Description |
|-------|-------------|
| `json` | JSON syntax highlighting |
| `markdown` | Markdown rendering (supports mermaid code blocks) |
| `yaml` / `xml` / `html` | Syntax highlighting |
| `mermaid` | Mermaid diagram rendering |
| `code` / `code:typescript` / `code:python` | Language-specific syntax highlighting |

## Visualization Formats

| Value | Description |
|-------|-------------|
| `chart` | Auto-detect chart type from data shape |
| `chart:bar` / `chart:line` / `chart:pie` | Specific chart types |
| `chart:area` / `chart:scatter` / `chart:donut` / `chart:radar` | More chart types |
| `metric` | KPI display (big number + label + delta) |
| `gauge` | Circular gauge/progress indicator |
| `timeline` | Vertical timeline of events |
| `dashboard` | Composite grid of auto-detected panels |
| `cart` | Shopping cart with item rows + totals |

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
