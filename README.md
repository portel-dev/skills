# NCP Skills

**Official skills repository for NCP (Natural Context Provider)**

JavaScript/TypeScript skills for AI agents. These skills teach Claude, GPT, and other AI agents how to perform specific tasks using executable code patterns.

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

### Using Skills in NCP

```bash
# 1. Install NCP
npm install -g ncp

# 2. Search for a skill
ncp skills search pdf

# 3. Install a skill
ncp skills add pdf

# 4. Use in code mode
# AI reads the skill and applies the patterns
```

### Using Skills in Claude Desktop

```json
// ~/.claude/config.json
{
  "skillsMarketplaces": [
    {
      "name": "ncp-skills",
      "enabled": true,
      "source": "portel-dev/skills",
      "sourceType": "github"
    }
  ]
}
```

### Using Skills in Code

```javascript
// AI can read skills dynamically
const skillContent = await skills.read({ 
  skill_name: 'pdf',
  depth: 2  // 0=names, 1=descriptions, 2=full content
});

// Then apply patterns from the skill
const { PDFDocument, rgb } = require('pdf-lib');
const pdfDoc = await PDFDocument.create();
// ... use patterns from skill
```

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

## 🌟 Why JavaScript Skills?

### vs Python Skills (Anthropic)

| Feature | Python Skills | JavaScript Skills (NCP) |
|---------|--------------|-------------------------|
| Execution | Requires Python | Native JavaScript |
| Installation | pip + system deps | npm only |
| Performance | Interpreter overhead | Native V8 |
| Compatibility | Platform-specific | Cross-platform |
| Integration | External process | Direct execution |
| Dependencies | Complex | Simple |

### Benefits

- ✅ **Zero setup** - Works immediately
- ✅ **Fast** - Native JavaScript performance
- ✅ **Portable** - One ecosystem (npm)
- ✅ **Type-safe** - TypeScript support
- ✅ **Modern** - ES6+, async/await
- ✅ **Compatible** - Works with Anthropic's format

## 📦 Installation

### As User

```bash
# Clone skills to NCP directory
git clone https://github.com/portel-dev/skills.git ~/.ncp/skills-repo

# Or install specific skill
curl -o ~/.ncp/skills/pdf/SKILL.md \
  https://raw.githubusercontent.com/portel-dev/skills/main/skills/pdf/SKILL.md
```

### As Developer

```bash
git clone https://github.com/portel-dev/skills.git
cd skills
npm install  # Install test dependencies
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

## ⭐ Star History

If you find these skills useful, please star the repository!

---

**Built with ❤️ by the NCP community**

