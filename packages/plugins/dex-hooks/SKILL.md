---
name: dex-hooks
description: Custom DEX hook development skills
version: 1.0.0
tags: [hooks, solidity, development, pool]
type: plugin
skills:
  - hook-developer
---

# Dex Hooks Plugin

Skills for building custom hooks for DEX pools.

## Included Skills

| Skill | Description |
|-------|-------------|
| hook-developer | Build custom hooks for advanced pool logic |

## Installation

```bash
/plugin install dex-hooks
```

## Hook Types

- **beforeSwap** — Modify swap params, add fees
- **afterSwap** — Post-swap logic, distributions
- **beforeInitialize** — Pre-pool setup
- **afterInitialize** — Post-pool setup
- **beforeDonate** — Pre-liquidity logic
- **afterDonate** — Post-liquidity logic
