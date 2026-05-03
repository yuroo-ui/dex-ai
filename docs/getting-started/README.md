# Getting Started

## Installation

### For AI Agents (Claude Code)

```bash
# Add marketplace
/plugin marketplace add your-org/dex-ai

# Install a plugin
/plugin install dex-trading

# List installed
/plugin list
```

### For AI Agents (Generic CLI)

```bash
# Install from GitHub
npx skills add your-org/dex-ai

# Or direct install
agent-self skill install github:your-org/dex-ai/packages/plugins/dex-trading/SKILL.md
```

### For Developers

```bash
git clone https://github.com/your-org/dex-ai.git
cd dex-ai
npm install
```

## Quick Example

After installing `dex-trading`, any AI agent can:

1. **Swap tokens** — "Swap 1000 USDC for WETH"
2. **Get quotes** — "What's the best rate for 1 ETH to USDC?"
3. **Protect against MEV** — Automatically uses private RPC when available

## Plugin Details

### dex-trading
Swap integration via Router, SDK, or direct API.

### dex-hooks
Build custom hooks for DEX pools (Solidity).

### dex-analytics
On-chain analytics, price feeds, TWAP, indexing.

### dex-defi
Liquidity management, yield optimization, strategies.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Plugin not found | Check marketplace: `/plugin marketplace list` |
| Skill not triggering | Check trigger phrases in SKILL.md frontmatter |
| RPC errors | Set `RPC_URL` env variable |
