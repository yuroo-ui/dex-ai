---
name: price-feed
description: Real-time price feeds, TWAP, and oracle integration
version: 1.0.0
triggers:
  - price feed
  - token price
  - price oracle
  - twap
  - price data
tags: [analytics, price, oracle, twap]
author: dex-ai
---

# Price Feed

Get real-time and historical price data from DEX pools.

## On-Chain Price (Slot0)

```solidity
// Get current price from pool
(uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
uint256 price = (uint256(sqrtPriceX96) ** 2) >> (96 * 2);
// price = token1 / token0 (adjusted for decimals)
```

## TypeScript Price Query

```typescript
import { Pool, Route, Trade } from '@dex/v3-sdk';
import { ethers } from 'ethers';

async function getTokenPrice(
  provider: ethers.Provider,
  poolAddress: string,
  tokenDecimals: number
): Promise<number> {
  const pool = PoolAddress.getAddress(token0, token1, fee);
  const contract = new ethers.Contract(poolAddress, POOL_ABI, provider);
  
  const sqrtPriceX96 = await contract.sqrtPriceX96();
  const sqrtPrice = Number(sqrtPriceX96) / 2 ** 96;
  const price = sqrtPrice ** 2;
  
  // Adjust for decimals
  return price * (10 ** (18 - tokenDecimals));
}
```

## TWAP (Time-Weighted Average Price)

```typescript
// Get TWAP over 30 minutes
async function getTWAP(poolAddress: string, secondsAgo: number) {
  const observations = await pool.observations([secondsAgo, 0]);
  
  const twap = calculateTWAP(
    observations[0].tick,
    observations[1].tick,
    observations[0].blockTimestamp,
    observations[1].blockTimestamp
  );
  
  return tickToPrice(twap);
}
```

## Multi-Source Aggregation

```typescript
async function getAggregatedPrice(token: string): Promise<PriceResult> {
  const [poolPrice, oraclePrice, cexPrice] = await Promise.all([
    getPoolPrice(token),
    getChainlinkPrice(token),
    getCEXPrice(token),
  ]);
  
  // Weighted average (pool: 40%, oracle: 40%, cex: 20%)
  return poolPrice * 0.4 + oraclePrice * 0.4 + cexPrice * 0.2;
}
```

## Price Alerts

```typescript
// Monitor price and alert on threshold
priceFeed.onPriceUpdate('WETH/USDC', (price) => {
  if (price < 2500) sendAlert('WETH below $2500');
  if (price > 3000) sendAlert('WETH above $3000');
});
```
