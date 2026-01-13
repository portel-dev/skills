# Docblock Tags Reference

Photon uses JSDoc-style docblock tags to extract metadata, configure tools, and generate documentation.

## Class-Level Tags

Place in the main JSDoc comment at the top of your `.photon.ts` file.

| Tag | Usage | Example |
|-----|-------|---------|
| `@name` | Photon identifier (required) | `@name weather-api` |
| `@version` | Semantic version | `@version 1.0.0` |
| `@author` | Author name | `@author Jane Doe` |
| `@license` | License type | `@license MIT` |
| `@description` | (Implicit) First paragraph of JSDoc | `/** Weather API integration */` |
| `@repository` | Source repository URL | `@repository https://github.com/user/repo` |
| `@homepage` | Project homepage | `@homepage https://example.com` |
| `@dependencies` | NPM packages to auto-install | `@dependencies axios@^1.0.0, lodash` |
| `@mcps` | MCP dependencies (for diagrams) | `@mcps filesystem, git` |
| `@photons` | Photon dependencies (for diagrams) | `@photons calculator` |
| `@stateful` | Maintains state between calls | `@stateful true` |
| `@idleTimeout` | Process idle timeout in ms | `@idleTimeout 300000` |
| `@mcp` | Inject MCP dependency | `@mcp fs filesystem` |
| `@photon` | Inject Photon dependency | `@photon auth auth-service` |
| `@ui` | Define UI template asset | `@ui my-view ./ui/view.html` |
| `@prompt` | Define static prompt asset | `@prompt greet ./prompts/greet.txt` |
| `@resource` | Define static resource asset | `@resource data ./data.json` |

## Method-Level Tags

Place in JSDoc comment immediately preceding the tool method.

| Tag | Usage | Example |
|-----|-------|---------|
| `@param` | Parameter description | `@param name User's name` |
| `@example` | Code example | `@example await tool.greet({ name: 'World' })` |
| `@format` | Output format hint | `@format markdown` |
| `@autorun` | Auto-execute when selected (idempotent) | `@autorun` |
| `@ui` | Link to UI template | `@ui my-view` |

## Parameter Inline Tags

Place within `@param` description text for validation and UI hints.

| Tag | Usage | Example |
|-----|-------|---------|
| `{@min N}` | Minimum numeric value | `@param age Age {@min 0}` |
| `{@max N}` | Maximum numeric value | `@param score Score {@max 100}` |
| `{@format type}` | Input format/validation | `@param email Email {@format email}` |
| `{@pattern regex}` | Regex pattern to match | `@param zip Zip code {@pattern ^[0-9]{5}$}` |
| `{@example value}` | Example value | `@param city City {@example London}` |
| `{@choice a,b,c}` | Allowed values (dropdown) | `@param status Status {@choice pending,approved,rejected}` |
| `{@field type}` | HTML input type | `@param bio Bio {@field textarea}` |

## Output Format Values (`@format`)

| Type | Values | Description |
|------|--------|-------------|
| **Structural** | `primitive`, `table`, `tree`, `list`, `none` | Data shape hints |
| **Content** | `json`, `markdown`, `yaml`, `xml`, `html` | Syntax/rendering |
| **Code** | `code`, `code:lang` | Code block (e.g., `code:javascript`) |
| **Diagram** | `mermaid` | Mermaid diagram syntax |

## Input Format Values (`{@format}`)

| Value | Description |
|-------|-------------|
| `email` | Email input with validation |
| `url` / `uri` | URL input with validation |
| `date` | Date picker |
| `date-time` | Date and time picker |
| `time` | Time picker |
| `password` | Password input (masked) |
| `textarea` / `multiline` | Multi-line text area |
| `uuid` | UUID validation |

## Field Types (`{@field}`)

| Value | Description |
|-------|-------------|
| `text` | Single-line text (default) |
| `textarea` | Multi-line text area |
| `number` | Number input with spinner |
| `password` | Password input (masked) |
| `checkbox` | Boolean checkbox |
| `select` | Dropdown (use with `{@choice}`) |
| `hidden` | Hidden field |
