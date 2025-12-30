# Mermaid Flowchart Syntax Reference

## Basic Syntax

### Flowchart Direction

```mermaid
flowchart TD    %% Top-Down (default for workflows)
flowchart LR    %% Left-Right
flowchart BT    %% Bottom-Top
flowchart RL    %% Right-Left
```

**Recommendation**: Use `TD` (Top-Down) for workflows as it matches natural reading order.

---

## Node Shapes

### For Photon Workflows

| Shape | Syntax | Use Case |
|-------|--------|----------|
| Stadium | `([text])` | Start/End points |
| Rectangle | `[text]` | Actions, emits |
| Diamond | `{text}` | Decisions, asks |
| Rounded | `(text)` | Sub-processes |
| Hexagon | `{{text}}` | Preparation steps |

### Examples

```mermaid
flowchart TD
    A([Start])           %% Stadium - entry/exit
    B[Process data]      %% Rectangle - action
    C{Make decision}     %% Diamond - decision
    D(Sub-process)       %% Rounded - helper
    E{{Prepare}}         %% Hexagon - setup
```

---

## Arrows and Connections

### Basic Arrows

```mermaid
flowchart TD
    A --> B        %% Standard arrow
    A --- B        %% Line without arrow
    A -.-> B       %% Dotted arrow (for dependencies)
    A ==> B        %% Thick arrow (for emphasis)
    A --text--> B  %% Arrow with label
    A -->|text| B  %% Arrow with label (alternative)
```

### For Photon Workflows

| Arrow Type | Meaning |
|------------|---------|
| `-->` | Normal flow |
| `-.->` | Dependency reference |
| `-->│Yes│` | Conditional true branch |
| `-->│No│` | Conditional false branch |

---

## Subgraphs

### Grouping Related Nodes

```mermaid
flowchart TD
    subgraph workflow["📦 Main Workflow"]
        A --> B --> C
    end

    subgraph deps["Dependencies"]
        D[📦 other-photon]
        E[🔌 mcp-name]
    end

    B -.-> D
    C -.-> E
```

### Styling Subgraphs

```mermaid
flowchart TD
    subgraph sg1["Title with quotes"]
        direction LR  %% Override direction inside subgraph
        A --> B
    end
```

---

## Node IDs and Labels

### Naming Convention for Photon Workflows

```mermaid
flowchart TD
    START([▶ Start])           %% Entry point
    STATUS1[📢 Connecting...]   %% Status emit
    PROGRESS1[⏳ 50%]           %% Progress emit
    CONFIRM1{🙋 Continue?}      %% Confirm ask
    SELECT1{📋 Choose format}   %% Select ask
    TEXT1{✏️ Enter name}        %% Text ask
    MCP_GMAIL[📧 gmail.send]    %% MCP call
    PHOTON_RSS[📦 rss-agg]      %% Photon call
    SUCCESS([✅ Success])       %% Success endpoint
    CANCELLED([❌ Cancelled])   %% Failure endpoint
```

---

## Emoji Conventions for Photon

### Emit Types

| Emoji | Emit Type | Example |
|-------|-----------|---------|
| 📢 | status | `[📢 Processing...]` |
| ⏳ | progress | `[⏳ 75% Almost done]` |
| 📝 | log | `[📝 Debug info]` |
| 🎉 | toast (success) | `[🎉 Completed!]` |
| ⚠️ | toast (warning) | `[⚠️ Rate limited]` |

### Ask Types

| Emoji | Ask Type | Example |
|-------|----------|---------|
| 🙋 | confirm | `{🙋 Proceed?}` |
| 📋 | select | `{📋 Choose option}` |
| ✏️ | text | `{✏️ Enter value}` |
| 🔢 | number | `{🔢 Enter count}` |
| 📅 | date | `{📅 Select date}` |
| 🔒 | password | `{🔒 Enter API key}` |

### External Calls

| Emoji | Type | Example |
|-------|------|---------|
| 📦 | Photon | `[📦 rss-aggregator]` |
| 🔌 | MCP | `[🔌 gmail]` |
| 📧 | Email MCP | `[📧 gmail.send]` |
| 💬 | Chat MCP | `[💬 slack.post]` |
| 🌐 | HTTP | `[🌐 fetch]` |
| 💾 | Storage | `[💾 filesystem.write]` |

### Endpoints

| Emoji | Meaning | Example |
|-------|---------|---------|
| ▶ | Start | `([▶ Start])` |
| ✅ | Success | `([✅ Success])` |
| ❌ | Cancelled/Failed | `([❌ Cancelled])` |
| ⏹ | End (neutral) | `([⏹ End])` |

---

## Complete Workflow Template

```mermaid
flowchart TD
    subgraph workflow-name["📦 Workflow Name"]
        %% Entry
        START([▶ Start])

        %% Main flow
        START --> STATUS1[📢 Initializing...]
        STATUS1 --> PROGRESS1[⏳ 25%]
        PROGRESS1 --> FETCH[🌐 Fetch data]

        %% Decision point
        FETCH --> CONFIRM{🙋 Data looks good?}
        CONFIRM -->|No| CANCELLED([❌ Cancelled])
        CONFIRM -->|Yes| PROCESS

        %% Processing
        PROCESS[🔄 Process data] --> PROGRESS2[⏳ 75%]
        PROGRESS2 --> SELECT{📋 Output format?}

        %% Multiple branches
        SELECT -->|JSON| SAVE_JSON[💾 Save JSON]
        SELECT -->|CSV| SAVE_CSV[💾 Save CSV]

        %% Merge branches
        SAVE_JSON --> NOTIFY
        SAVE_CSV --> NOTIFY

        %% Final steps
        NOTIFY[💬 slack.notify] --> SUCCESS([✅ Success])
    end

    %% Dependencies subgraph
    subgraph deps["Dependencies"]
        DEP1[🔌 slack]
        DEP2[📦 data-processor]
    end

    %% Dependency connections
    NOTIFY -.-> DEP1
    PROCESS -.-> DEP2
```

---

## Styling (Optional)

### Custom Styles

```mermaid
flowchart TD
    A[Success] --> B[Failure]

    style A fill:#90EE90,stroke:#228B22
    style B fill:#FFB6C1,stroke:#DC143C
```

### Class Definitions

```mermaid
flowchart TD
    A[Step 1]:::success --> B[Step 2]:::warning

    classDef success fill:#90EE90,stroke:#228B22
    classDef warning fill:#FFD700,stroke:#FFA500
    classDef error fill:#FFB6C1,stroke:#DC143C
```

---

## Common Patterns

### Linear Flow

```mermaid
flowchart TD
    A --> B --> C --> D
```

### Branching

```mermaid
flowchart TD
    A --> B{Decision}
    B -->|Yes| C
    B -->|No| D
```

### Merging

```mermaid
flowchart TD
    A --> C
    B --> C
    C --> D
```

### Loop (Conceptual)

```mermaid
flowchart TD
    A --> B{More items?}
    B -->|Yes| C[Process item]
    C --> A
    B -->|No| D[Done]
```

---

## Rendering

Mermaid diagrams render automatically in:
- **GitHub** - README.md, PRs, Issues
- **VSCode** - With Mermaid extension
- **Notion** - Code blocks with mermaid language
- **Obsidian** - Native support
- **GitLab** - Native support
- **Confluence** - With plugin

For standalone rendering:
- [Mermaid Live Editor](https://mermaid.live/)
- `npx @mermaid-js/mermaid-cli` for CLI rendering
