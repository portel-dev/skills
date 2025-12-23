---
name: skill-creator
description: Guide for creating NCP skills - markdown-based instruction sets that teach AI agents new capabilities. Use when you want to create reusable knowledge modules for specific tasks or domains.
license: Apache 2.0
---

# Skill Creation Guide

## Overview

Skills are markdown-based instruction sets that teach AI agents how to perform specific tasks. They're the knowledge layer of NCP - reusable, shareable, and immediately applicable.

## What is a Skill?

A skill is a `SKILL.md` file containing:
- **Instructions** - How to perform a task
- **Code examples** - JavaScript/TypeScript patterns
- **Best practices** - Dos and don'ts
- **Common patterns** - Real-world use cases
- **Reference materials** - Additional resources

## Skill Structure

### Required Format

```markdown
---
name: skill-name
description: Brief description of what this skill teaches
license: Apache 2.0
---

# Skill Title

## Overview

Brief introduction to the skill domain.

## Quick Start

Minimal working example to get started quickly.

## Core Concepts

Fundamental knowledge needed to use this skill.

## Common Patterns

Real-world examples and use cases.

## Best Practices

Tips, warnings, and recommendations.

## See Also

Related skills and resources.

## License

License information.
```

### Metadata Fields

```yaml
---
name: unique-identifier         # Lowercase, hyphenated
description: One-line summary   # What the skill teaches
version: 1.0.0                 # Optional: Semantic version
author: Your Name              # Optional: Author
tags: [tag1, tag2]            # Optional: Categorization
license: Apache 2.0            # License type
---
```

## Creating Different Types of Skills

### 1. Library/API Skill

Teaches how to use a JavaScript library or API.

**Template:**
```markdown
---
name: library-name
description: How to use LibraryName for specific purpose
---

# Library Name

## Overview
What the library does and when to use it.

## Installation
```bash
npm install library-name
```

## Quick Start
```javascript
const lib = require('library-name');
const result = await lib.doSomething();
```

## API Reference

### Method 1
```javascript
lib.method1(params)
```
Description, parameters, returns.

### Method 2
```javascript
lib.method2(params)
```
Description, parameters, returns.

## Common Patterns

### Pattern 1: Use Case Name
```javascript
// Real-world example
```

### Pattern 2: Another Use Case
```javascript
// Another real-world example
```

## Best Practices
- Do this
- Don't do that
- Consider this
```

**Example:** See `pdf`, `docx`, `pptx`, `xlsx` skills

### 2. Domain Knowledge Skill

Teaches concepts, methodologies, or best practices.

**Template:**
```markdown
---
name: domain-name
description: Best practices for specific domain
---

# Domain Name

## Overview
Introduction to the domain.

## Key Concepts

### Concept 1
Explanation and examples.

### Concept 2
Explanation and examples.

## Methodology

### Step 1: Preparation
What to do first.

### Step 2: Execution
How to execute.

### Step 3: Validation
How to verify results.

## Common Scenarios

### Scenario A
How to handle this situation.

### Scenario B
How to handle that situation.

## Pitfalls to Avoid
- Common mistake 1
- Common mistake 2

## Checklist
- [ ] Verify X
- [ ] Check Y
- [ ] Confirm Z
```

**Example:** See `mcp-builder` skill

### 3. Tool/Utility Skill

Teaches how to use a specific tool or utility.

**Template:**
```markdown
---
name: tool-name
description: How to use ToolName effectively
---

# Tool Name

## Overview
What the tool does.

## Basic Usage

### Command 1
```bash
tool command1 --option value
```
What it does.

### Command 2
```bash
tool command2 --option value
```
What it does.

## Advanced Usage

### Combining Commands
```bash
tool command1 | tool command2
```

### With Scripts
```javascript
// Using tool programmatically
```

## Common Workflows

### Workflow 1: Task Name
Step-by-step instructions.

### Workflow 2: Another Task
Step-by-step instructions.

## Tips & Tricks
- Shortcut 1
- Tip 2
- Hidden feature 3
```

**Example:** See `photon-builder` skill

## Writing Effective Skills

### 1. Start with Quick Start

Always provide a minimal working example first:

```javascript
// Minimal example that runs immediately
const result = await simpleOperation();
```

Then expand with explanations.

### 2. Use Progressive Disclosure

Structure from simple to complex:

```markdown
## Basic Usage
Simple examples.

## Intermediate Usage
More complex examples.

## Advanced Usage
Expert-level patterns.
```

### 3. Include Real Code

Don't use pseudocode - provide copy-paste ready examples:

```javascript
// ✅ GOOD: Actual runnable code
const { PDFDocument } = require('pdf-lib');
const doc = await PDFDocument.create();

// ❌ BAD: Pseudocode
// Create document
// Add content
// Save
```

### 4. Show Complete Examples

Include full context:

```javascript
// ✅ GOOD: Complete example
async function generateInvoice(data) {
  const pptx = require('pptxgenjs');
  const pres = new pptx();
  
  const slide = pres.addSlide();
  slide.addText('Invoice', { x: 1, y: 1 });
  
  return await pres.write({ outputType: 'arraybuffer' });
}

// ❌ BAD: Incomplete snippet
slide.addText('Invoice');
```

### 5. Explain Why, Not Just How

```markdown
## Why Use This Pattern

This pattern is preferred because:
- **Performance**: 50% faster than alternative
- **Memory**: Uses streaming instead of loading all
- **Compatibility**: Works across all platforms

## When NOT to Use

Avoid this when:
- Dataset is small (< 100 items)
- Real-time updates needed
- Working with legacy systems
```

### 6. Provide Context

```markdown
## Use Cases

### Use Case 1: E-commerce
When building an e-commerce platform, use this for...

### Use Case 2: Analytics
For analytics dashboards, this pattern helps...

### Use Case 3: Reports
In report generation, apply this to...
```

## Skill Organization

### Single Skill

```
skill-name/
└── SKILL.md
```

### Skill with Resources

```
skill-name/
├── SKILL.md              # Main skill file
├── reference/            # Additional documentation
│   ├── api.md
│   ├── examples.md
│   └── advanced.md
└── scripts/             # Helper scripts
    ├── setup.sh
    └── example.js
```

### Skill Reference Structure

```markdown
# Main SKILL.md

For detailed API documentation, see [API Reference](reference/api.md).

For advanced patterns, see [Advanced Guide](reference/advanced.md).

To run examples:
```bash
node scripts/example.js
```
```

## Testing Skills

### Manual Testing

1. **Read test:**
   ```javascript
   const content = await skills.read({ 
     skill_name: 'my-skill',
     depth: 2 
   });
   ```

2. **Application test:**
   ```javascript
   // Use patterns from skill
   const { Method } = require('library');
   // ... code from skill examples
   ```

3. **Validation:**
   - Does it teach the concept clearly?
   - Are examples copy-paste ready?
   - Can someone learn from it without prior knowledge?

### Automated Testing

```javascript
// test-skill.js
const fs = require('fs');
const path = require('path');

// 1. Validate structure
const skillPath = './skills/my-skill/SKILL.md';
const content = fs.readFileSync(skillPath, 'utf-8');

// 2. Check metadata
const hasMetadata = /^---\n/.test(content);
console.assert(hasMetadata, 'Missing frontmatter');

// 3. Check required sections
const hasSections = [
  '## Overview',
  '## Quick Start',
  '## Best Practices'
].every(section => content.includes(section));
console.assert(hasSections, 'Missing required sections');

// 4. Validate code blocks
const codeBlocks = content.match(/```javascript\n[\s\S]*?\n```/g);
console.assert(codeBlocks && codeBlocks.length > 0, 'No code examples');

// 5. Try executing examples
// ... extract and test code blocks
```

## Publishing Skills

### 1. To NCP Skills Repository

```bash
# 1. Add to skills repository
cd /path/to/skills
cp my-skill.md skills/my-skill/SKILL.md

# 2. Update marketplace.json
# Add to .claude-plugin/marketplace.json

# 3. Commit
git add .
git commit -m "Add my-skill"
git push
```

### 2. As Standalone Package

```bash
# Create package
mkdir ncp-skill-myskill
cd ncp-skill-myskill

# Create structure
mkdir -p skills/myskill
cp SKILL.md skills/myskill/

# Create package.json
cat > package.json << EOF
{
  "name": "ncp-skill-myskill",
  "version": "1.0.0",
  "description": "My skill for NCP",
  "main": "index.js",
  "scripts": {
    "postinstall": "mkdir -p ~/.ncp/skills/myskill && cp -r skills/myskill/* ~/.ncp/skills/myskill/"
  }
}
EOF

# Publish
npm publish
```

### 3. As Gist/URL

```markdown
# Installation via curl

curl -o ~/.ncp/skills/myskill/SKILL.md \
  https://gist.github.com/user/id/raw/SKILL.md
```

## Skill Quality Checklist

- [ ] Clear, descriptive name
- [ ] Complete frontmatter metadata
- [ ] Overview section explaining purpose
- [ ] Quick Start with minimal example
- [ ] At least 3 complete, runnable examples
- [ ] Common patterns section with real use cases
- [ ] Best practices and pitfalls
- [ ] Proper code formatting (```javascript blocks)
- [ ] No broken links or references
- [ ] License information
- [ ] Tested examples (actually run the code)

## Best Practices

### DO

✅ Use clear, descriptive names
✅ Provide complete, runnable examples
✅ Explain WHY, not just HOW
✅ Include error handling examples
✅ Show real-world use cases
✅ Keep it focused on one topic
✅ Update when libraries change
✅ Test all code examples

### DON'T

❌ Use pseudocode instead of real code
❌ Assume prior knowledge
❌ Skip error handling
❌ Mix multiple unrelated topics
❌ Leave incomplete examples
❌ Use deprecated APIs
❌ Forget to specify dependencies

## Examples of Good Skills

### Example 1: Library Skill

See `pdf` skill - comprehensive PDF library guide with:
- Clear quick start
- Progressive examples (simple → complex)
- Multiple real-world patterns
- Complete, copy-paste ready code

### Example 2: Tool Skill

See `photon-builder` skill - tool creation guide with:
- Clear methodology
- Template patterns
- Multiple complete examples
- Testing and deployment guide

### Example 3: Domain Skill

See `mcp-builder` skill - MCP development guide with:
- Conceptual explanation
- Step-by-step process
- Best practices
- Common pitfalls

## See Also

- For API integrations: Use `photon-builder` skill
- For MCP servers: Use `mcp-builder` skill
- For document processing: See `pdf`, `docx`, `pptx`, `xlsx` skills

## License

Apache 2.0
