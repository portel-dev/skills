# NCP Skills

**Official skills repository for NCP (Natural Context Provider)**

Skills for AI agents that teach them to perform specific tasks. Code examples use JavaScript/TypeScript for execution in NCP and Claude Code environments.

## 🎯 What are Skills?

Skills are markdown-based instruction sets that contain:
- **Code examples** - Copy-paste ready JavaScript/TypeScript
- **Best practices** - Proven patterns and techniques  
- **Real-world use cases** - Practical applications
- **Progressive learning** - Simple to advanced examples

## 📚 Available Skills

### Document Processing

| Skill | Description | Library | Lines |
|-------|-------------|---------|-------|
| **[pdf](skills/pdf)** | PDF creation and manipulation | pdf-lib | 542 |
| **[docx](skills/docx)** | Word document generation | docx | 735 |
| **[pptx](skills/pptx)** | PowerPoint presentations | pptxgenjs | 777 |
| **[xlsx](skills/xlsx)** | Excel spreadsheets | xlsx (SheetJS) | 659 |

### Development

| Skill | Description | Lines |
|-------|-------------|-------|
| **[photon-builder](skills/photon-builder)** | Create lightweight Photon MCPs | 685 |
| **[mcp-builder](skills/mcp-builder)** | Build full MCP servers | 236 |
| **[skill-creator](skills/skill-creator)** | Meta-skill for creating skills | 434 |

### Total: **4,068 lines** of production-ready skills

## 🚀 Quick Start

### Claude Code

You can register this repository as a Claude Code Plugin marketplace:
```
/plugin marketplace add portel-dev/skills
```

Then, to install a specific set of skills:
1. Select `Browse and install plugins`
2. Select `ncp-skills`
3. Select `document-skills` or `development-skills`
4. Select `Install now`

Alternatively, directly install either Plugin via:
```
/plugin install document-skills@ncp-skills
/plugin install development-skills@ncp-skills
```

### NCP (Natural Context Provider)

NCP uses the same marketplace format as Claude Code:
```bash
# Add the skills marketplace
ncp skills marketplace add portel-dev/skills

# Search for skills
ncp skills search pdf

# Install a skill
ncp skills add pdf
```

### Claude.ai

To use skills from this repository:
1. Download the skill folder as ZIP
2. Go to Claude.ai and navigate to Skills settings
3. Click "Upload skill" and select the ZIP file
4. The skill will be available for use

See [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude) for detailed instructions.

### Claude API

You can upload custom skills via the Claude API. See the [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill) for more.

## 📖 Skill Format

Each skill follows a consistent structure:

```markdown
---
name: skill-name
description: Brief description
license: Apache 2.0
---

# Skill Title

## Overview
Introduction to the topic

## Quick Start
Minimal working example

## Core Concepts
Fundamental knowledge

## Common Patterns
Real-world examples

## Best Practices
Tips and recommendations

## See Also
Related skills

## License
License information
```

## 🎨 Creating Your Own Skills

See the **[skill-creator](skills/skill-creator)** skill for a complete guide on creating skills.

Quick template:

```markdown
---
name: my-skill
description: What this skill teaches
license: Apache 2.0
---

# My Skill

## Quick Start
```javascript
const result = await doSomething();
```

## Common Patterns
Real-world examples...
```

## 🔧 Development

### Structure

```
skills/
├── .claude-plugin/
│   └── marketplace.json      # Skills registry
├── skills/
│   ├── pdf/
│   │   └── SKILL.md
│   ├── docx/
│   │   └── SKILL.md
│   └── ...
├── spec/                     # Specifications
└── template/                 # Skill templates
```

### Adding a Skill

1. Create `skills/your-skill/SKILL.md`
2. Follow the format guidelines
3. Add to `.claude-plugin/marketplace.json`
4. Test thoroughly
5. Submit PR

### Testing Skills

```bash
# Install dependencies
npm install pdf-lib docx pptxgenjs xlsx

# Test a skill
cd skills/pdf
node -e "const { PDFDocument } = require('pdf-lib'); console.log('✅ PDF skill works')"
```

## 🌟 Why JavaScript/TypeScript Implementation?

### vs Python Implementation (Anthropic)

| Feature | Python-based | JavaScript-based (NCP) |
|---------|--------------|-------------------------|
| Execution | Requires Python | Native JavaScript |
| Installation | pip + system deps | npm only |
| Performance | Interpreter overhead | Native V8 |
| Compatibility | Platform-specific | Cross-platform |
| Integration | External process | Direct execution |
| Dependencies | Complex | Simple |

### Benefits

- ✅ **Zero setup** - Works immediately in Node.js environments
- ✅ **Fast** - Native V8 performance
- ✅ **Portable** - Single ecosystem (npm)
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Modern** - ES6+, async/await, promises
- ✅ **Compatible** - Works with Anthropic's skill format

## 🛠️ Development Setup

```bash
# Clone the repository
git clone https://github.com/portel-dev/skills.git
cd skills

# Skills are pure markdown - no dependencies needed
# Each skill is self-contained in its SKILL.md file
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Contribution Ideas

- 📄 More document skills (Markdown, HTML, etc.)
- 🔧 Utility skills (crypto, networking, etc.)
- 🌐 API integration skills (weather, maps, etc.)
- 📊 Data processing skills (CSV, JSON, XML)
- 🎨 Creative skills (image processing, etc.)

## 📄 License

Apache 2.0 - See [LICENSE](LICENSE) for details.

Individual skills may have additional licenses specified in their frontmatter.

## 🔗 Links

- **NCP Repository**: [github.com/portel-dev/ncp](https://github.com/portel-dev/ncp)
- **npm Package**: [npmjs.com/package/ncp](https://www.npmjs.com/package/ncp)
- **Skills Repository**: [github.com/portel-dev/skills](https://github.com/portel-dev/skills)
- **Contact**: [arul@luracast.com](mailto:arul@luracast.com)

---

**NCP Skills** - Teaching AI agents through executable patterns

