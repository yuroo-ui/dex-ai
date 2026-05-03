# Overview

dex-ai is a skill marketplace for DEX integration — providing AI agents with reusable patterns for trading, analytics, hooks, and DeFi composability.

## Architecture

```
dex-ai/
├── packages/
│   ├── plugins/           # Skill packages (each is a plugin)
│   │   ├── dex-trading/   # Swap & routing
│   │   ├── dex-hooks/     # Hook development
│   │   ├── dex-analytics/ # On-chain analytics
│   │   └── dex-defi/      # DeFi composability
│   └── core/              # Shared types & utilities
├── docs/                  # Documentation
├── evals/                 # Skill evaluation tests
└── scripts/               # Build & CI scripts
```

## Plugins

| Plugin | Skills | Description |
|--------|--------|-------------|
| dex-trading | swap-integration, mev-protect | Token swaps & routing |
| dex-hooks | hook-developer | Custom pool hooks |
| dex-analytics | price-feed, indexer | On-chain data |
| dex-defi | liquidity-manager, yield-optimizer | DeFi strategies |

## Skill Format

Each skill is a `SKILL.md` file:

```markdown
---
name: skill-name
description: What this skill does
version: 1.0.0
triggers:
  - trigger phrase 1
  - trigger phrase 2
tags: [tag1, tag2]
author: dex-ai
---

# Skill Name

Instructions for the AI agent...
```

## Development Setup

```bash
# Clone
git clone https://github.com/your-org/dex-ai.git
cd dex-ai

# Install
npm install

# Lint skills
npm run lint

# Run evals
npm run eval
```

## Contributing

1. Fork the repo
2. Create a skill branch: `git checkout -b skill/my-skill`
3. Add your SKILL.md in the appropriate plugin
4. Run `npm run lint` and `npm run eval`
5. Submit PR

## Design Principles

- **Composable**: Skills should work together
- **Specific**: One workflow per skill
- **Tested**: Every skill needs eval coverage
- **Secure**: No private keys, no RPC leaks
