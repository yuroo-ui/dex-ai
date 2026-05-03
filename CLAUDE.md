# CLAUDE.md — Claude Code Integration

## Marketplace Setup

```bash
/plugin marketplace add your-org/dex-ai
```

## Available Plugins

| Plugin | Description | Install |
|--------|-------------|---------|
| dex-trading | Swap & routing integration | `/plugin install dex-trading` |
| dex-hooks | Custom hook development | `/plugin install dex-hooks` |
| dex-analytics | On-chain analytics | `/plugin install dex-analytics` |
| dex-defi | DeFi composability | `/plugin install dex-defi` |

## Quick Commands

```bash
# List installed skills
/plugin list

# Search available skills
/plugin search "swap"

# Remove a plugin
/plugin uninstall dex-trading
```

## Skill Structure

Each plugin contains a `SKILL.md` with:
- **triggers**: phrases that activate this skill
- **tags**: categorization (trading, hooks, analytics, defi)
- **context**: when to use this skill
- **instructions**: step-by-step guide

## Development

```bash
# Install dependencies
npm install

# Lint skills
npm run lint

# Run evals
npm run eval

# Build docs
npm run docs
```
