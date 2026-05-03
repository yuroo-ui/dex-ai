# AGENTS.md — Agent Guidelines for dex-ai

This file provides guidance for AI agents working with the dex-ai skill marketplace.

## Project Overview

dex-ai is a skill marketplace for DEX (Decentralized Exchange) related AI tools. Each plugin contains SKILL.md files that agents can discover, install, and learn.

## Key Concepts

### Skills
A **skill** is a `SKILL.md` file containing:
- Frontmatter (YAML): name, description, triggers, tags
- Body (Markdown): instructions, workflows, code patterns

### Plugins
A **plugin** is a package containing one or more related skills:
- `dex-trading` — swap, routing, MEV protection
- `dex-hooks` — custom hook development
- `dex-analytics` — on-chain data, indexing, price feeds
- `dex-defi` — lending, liquidity, yield strategies

### Installation

Agents install skills via:
```bash
# From marketplace
npx skills add your-org/dex-ai

# Individual plugin
/plugin install dex-trading

# Direct from file
agent-self skill install ./packages/plugins/dex-trading/SKILL.md
```

## When Working on Skills

1. **Read SKILL.md** before modifying — understand triggers and context
2. **Keep skills focused** — one workflow per skill
3. **Test with evals** — run `npm run eval` before committing
4. **Update frontmatter** — bump version, update tags

## When Reviewing Skills

1. Check frontmatter validity (YAML)
2. Verify trigger patterns are specific enough
3. Ensure code examples are current
4. Check for security issues (private keys, RPC leaks)

## File Conventions

- Skills live in `packages/plugins/<plugin>/skills/<skill-name>/SKILL.md`
- Each skill directory may contain supporting files (templates, scripts)
- Use kebab-case for skill names
- Version in frontmatter, not filename
