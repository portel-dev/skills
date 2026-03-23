# Photon Validation — Promise Checking

## Core Idea

A photon's backend methods are its **capabilities**. Its `@ui` template is the **interface** to those capabilities. Its docblock `## UI Promises` section is the **contract**. Validation means checking the interface delivers on the contract.

## Promise Signals

The backend declares promises through annotations:

| Annotation | Promise |
|-----------|---------|
| `@ui <id>` on class | This photon has a visual interface |
| `@ui <id>` on method | This method's result is rendered in the UI |
| `@autorun` | This method runs automatically when the UI opens |
| `@audience user` | The result is for the human — the UI should show it |
| `@readOnly` | Safe to call repeatedly — UI can poll/refresh |
| Public method (no `@internal`) | This capability is accessible |

## Gap Detection

Compare:

**What the backend provides:**
- All public methods and their annotations
- The `## UI Promises` docblock section

**What the UI consumes:**
- Method calls in the HTML template (`window["photon"].method()`)
- Event handlers (`window.photon.onResult()`, `window.photon.onEmit()`)
- Interactive controls (buttons, inputs, dropdowns)

**Gaps are:**
- A public `@ui` method with no corresponding UI call
- A `## UI Promises` line with no corresponding UI feature
- A backend capability (e.g., `move`, `reorder`) with no UI control
- A UI state (empty, error, loading) with no handling

## Writing Good Promises

Promises should be **specific and testable**, not vague:

```
BAD:  "Rich editing experience"
GOOD: "Click any paragraph to edit it inline"

BAD:  "Presentation management"
GOOD: "Drag-and-drop to reorder slides in the filmstrip"

BAD:  "File support"
GOOD: "File picker overlay to browse, search, and create documents"
```

Each promise should map to a concrete UI element or interaction.

## Validation Checklist

Before marking any `@ui` photon as done:

- [ ] Every `## UI Promises` line has a working UI feature
- [ ] Every `@ui` method is called by the HTML template
- [ ] Every `@audience user` method has a visible UI control
- [ ] Empty state is handled (not blank panels)
- [ ] Error state shows a meaningful message
- [ ] All toolbar/control buttons function
- [ ] Responsive layout works (no overflow, no clipping)
- [ ] Screenshot review shows no cosmetic bugs
