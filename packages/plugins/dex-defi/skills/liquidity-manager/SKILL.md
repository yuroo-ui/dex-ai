---
name: liquidity-manager
description: Add/remove liquidity, manage positions, rebalance pools
version: 1.0.0
triggers:
  - add liquidity
  - remove liquidity
  - liquidity position
  - provide liquidity
  - manage pool
tags: [defi, liquidity, pools, positions]
author: dex-ai
---

# Liquidity Manager

Manage liquidity positions across DEX pools.

## Adding Liquidity

### Single-sided (Concentrated)
```typescript
import { NonfungiblePositionManager } from '@dex/v3-sdk';

const { calldata, value } = NonfungiblePositionManager.addCallParameters({
  token0: USDC,
  token1: WETH,
  fee: 500, // 0.05%
  tickLower: tickLower,
  tickUpper: tickUpper,
  liquidity: liquidityAmount,
  recipient: owner,
  deadline: Date.now() + 120000,
});
```

### Formula for Concentrated Liquidity
```
L = √(x * y) where:
  x = amount of token0
  y = amount of token1
  liquidity scales with √product
```

## Position Management

### Check Active Positions
```typescript
const positions = await positionManager.positionsOf(owner);
for (const pos of positions) {
  console.log(`Position ${pos.tokenId}:`);
  console.log(`  Pool: ${pos.token0.symbol}/${pos.token1.symbol}`);
  console.log(`  Liquidity: ${pos.liquidity}`);
  console.log(`  Range: ${pos.tickLower} - ${pos.tickUpper}`);
  console.log(`  In range: ${currentTick >= pos.tickLower && currentTick <= pos.tickUpper}`);
}
```

### Rebalancing
1. Calculate current price vs position range
2. If out of range: remove + re-add at new range
3. Consider gas costs vs impermanent loss

## Common Pitfalls

- ⚠️ Narrow ranges = higher fees but more frequent rebalancing
- ⚠️ Wide ranges = lower fees but capital inefficient
- ⚠️ Always account for swap fees when calculating IL
