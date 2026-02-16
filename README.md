# Portel Skills

Official agent skills for [Photon](https://github.com/portel-dev/photon) and NCP.

## Available Skills

| Skill | Description |
|-------|-------------|
| **[photon](skills/photon)** | Build Photon MCPs — single-file TypeScript servers with JSDoc metadata, custom UIs, visualization, and more |

## Installation

### npx skills (works with Claude Code, Cursor, Codex, and 35+ agents)

```bash
# Install the photon skill
npx skills add portel-dev/skills --skill photon

# Or install all skills
npx skills add portel-dev/skills
```

### Claude Code Plugin

```bash
# Add as marketplace
/plugin marketplace add portel-dev/skills

# Or install directly
/plugin install development-skills@portel-skills
```

## License

Apache 2.0 — See [LICENSE](LICENSE) for details.
