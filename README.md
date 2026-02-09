# NCP Skillset

**Official skillset repository for NCP (Natural Context Provider)**

Skills for AI agents that teach them to perform specific tasks. Code examples use JavaScript/TypeScript for execution in NCP and Claude Code environments.

## 🎯 What are Skills?

Skills are markdown-based instruction sets that contain:
- **Code examples** - Copy-paste ready JavaScript/TypeScript
- **Best practices** - Proven patterns and techniques
- **Real-world use cases** - Practical applications
- **Progressive learning** - Simple to advanced examples

## 📚 Available Skills

### Document Processing

| Skill | Description | Library |
|-------|-------------|---------|
| **[pdf](skills/pdf)** | PDF creation and manipulation | pdf-lib |
| **[docx](skills/docx)** | Word document generation | docx |
| **[pptx](skills/pptx)** | PowerPoint presentations | pptxgenjs |
| **[xlsx](skills/xlsx)** | Excel spreadsheets | xlsx (SheetJS) |

### Development

| Skill | Description |
|-------|-------------|
| **[photon-builder](skills/photon-builder)** | Create lightweight Photon MCPs |
| **[photon-visualizer](skills/photon-visualizer)** | Generate Mermaid diagrams for Photons |
| **[mcp-builder](skills/mcp-builder)** | Build full MCP servers |
| **[skill-creator](skills/skill-creator)** | Meta-skill for creating skills |

### Media Production

| Skill | Description |
|-------|-------------|
| **[video](skills/video)** | Programmatic video creation with Remotion |
| **[audio](skills/audio)** | Audio processing — Whisper, waveform, post-processing |
| **[qwen3-tts](skills/qwen3-tts)** | Text-to-speech with Qwen3 TTS on Apple Silicon |

## 🚀 Quick Start

### Claude Code

You can register this repository as a Claude Code Plugin marketplace:
```
/plugin marketplace add portel-dev/skillset
```

Then, to install a specific set of skills:
1. Select `Browse and install plugins`
2. Select `ncp-skillset`
3. Select `document-skills`, `development-skills`, or `media-skills`
4. Select `Install now`

Alternatively, directly install a Plugin via:
```
/plugin install document-skills@ncp-skillset
/plugin install development-skills@ncp-skillset
/plugin install media-skills@ncp-skillset
```

### NCP (Natural Context Provider)

NCP uses the same marketplace format as Claude Code:
```bash
# Add the skillset marketplace
ncp skills marketplace add portel-dev/skillset

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
skillset/
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

## 🛠️ Development Setup

```bash
# Clone the repository
git clone https://github.com/portel-dev/skillset.git
cd skillset

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
- **Skillset Repository**: [github.com/portel-dev/skillset](https://github.com/portel-dev/skillset)
- **Contact**: [arul@luracast.com](mailto:arul@luracast.com)

---

**NCP Skillset** - Teaching AI agents through executable patterns
