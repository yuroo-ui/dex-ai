# dex-ai

AI tools for building on DEXes — skills, plugins, and agents for any coding agent.

## Quick Start

```bash
# Skills CLI (any agent)
npx skills add your-org/dex-ai

# Claude Code Marketplace
/plugin marketplace add your-org/dex-ai

# Install individual plugins
/plugin install dex-trading     # Swap & routing integration
/plugin install dex-hooks       # Custom DEX hooks development
/plugin install dex-analytics   # On-chain analytics & indexing
/plugin install dex-defi        # Lending, liquidity, yield
/plugin install dex-bridge      # Cross-chain bridge via Li.Fi, Relay, etc.
```

## Featured Skills

| Skill               | Plugin        | Description                                          |
| ------------------- | ------------- | ---------------------------------------------------- |
| `swap-integration`  | dex-trading   | Integrate DEX swaps via Router, SDK, or API          |
| `liquidity-manager` | dex-defi      | Add/remove liquidity, manage positions               |
| `price-feed`        | dex-analytics | Real-time price feeds, TWAP, oracle integration      |
| `hook-developer`    | dex-hooks     | Build custom DEX hooks for advanced order types      |
| `yield-optimizer`   | dex-defi      | Auto-compound, find best yield opportunities         |
| `mev-protect`       | dex-trading   | MEV-resistant transaction submission                 |
| `bridge-lifi`       | dex-bridge    | Bridge & swap across 30+ chains via Li.Fi            |
| `bridge-relay`      | dex-bridge    | Instant cross-chain transfers via Relay solver       |
| `bridge-any`        | dex-bridge    | Universal bridge patterns & provider comparison      |

## Project Structure

```
dex-ai/
├── packages/
│   ├── plugins/           # Skill packages
│   │   ├── dex-trading/   # Swap & routing skills
│   │   ├── dex-hooks/     # Hook development skills
│   │   ├── dex-analytics/ # Analytics & indexing skills
│   │   └── dex-defi/      # DeFi composability skills
│   └── core/              # Shared utilities & types
├── docs/                  # Documentation
├── evals/                 # Skill evaluation tests
└── scripts/               # Build & release scripts
```

## Documentation

| Document                                   | Description                            |
| ------------------------------------------ | -------------------------------------- |
| [Project Overview](./docs/OVERVIEW.md)     | Plugins, architecture, development setup |
| [Getting Started](./docs/getting-started/) | Installation and quick start guide     |

## Contributing

See [Project Overview](./docs/OVERVIEW.md) for development setup and contribution guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.
