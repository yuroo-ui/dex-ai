---
name: swap-integration
description: Integrate DEX swaps via Router, SDK, or API
version: 1.0.0
triggers:
  - swap tokens
  - exchange tokens
  - trade tokens
  - swap integration
  - dex swap
tags: [trading, swap, router, sdk]
author: dex-ai
---

# Swap Integration

Integrate DEX token swaps into your application.

## Supported Methods

### 1. Direct Router Call
```typescript
import { Router } from '@dex/router';

const router = new Router({ chainId: 1 });
const quote = await router.getQuote({
  tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  amount: parseUnits('1000', 6),
  slippage: 0.5,
});
```

### 2. SDK Integration
```typescript
import { SwapRouter } from '@dex/sdk';
import { CurrencyAmount, TradeType } from '@dex/core';

const trade = await Trade.fromRoute(
  new Route([USDC, WETH], provider),
  CurrencyAmount.fromRawAmount(USDC, '1000000000'),
  TradeType.EXACT_INPUT
);

const { calldata, value } = SwapRouter.swapCallParameters(trade);
```

### 3. API Call
```bash
curl -X POST https://api.dex.ai/v1/swap/quote \
  -H "Content-Type: application/json" \
  -d '{
    "token_in": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "token_out": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "amount": "1000000000",
    "slippage_bps": 50
  }'
```

## MEV Protection

Always use private RPC or MEV-protection service:

```typescript
const tx = await wallet.sendTransaction({
  ...swapCalldata,
  maxPriorityFeePerGas: await mevProtect.getProtectedGasPrice(),
});
```

## Common Patterns

- **Exact Input**: User specifies input amount, get minimum output
- **Exact Output**: User specifies output amount, calculate max input
- **Multi-hop**: Route through intermediate tokens for better price
- **Split路由**: Split across multiple pools for less slippage
