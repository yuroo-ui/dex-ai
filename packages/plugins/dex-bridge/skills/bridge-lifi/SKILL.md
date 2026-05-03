---
name: bridge-lifi
description: Cross-chain bridge & swap using Li.Fi API — 30+ chains, 20+ bridges, 15+ DEXs
version: 1.0.0
triggers:
  - bridge tokens
  - cross chain
  - bridge ETH
  - swap cross chain
  - bridge to arbitrum
  - bridge to polygon
  - li.fi
  - lifi
  - transfer to another chain
tags: [bridge, cross-chain, li.fi, swap, multi-chain]
author: dex-ai
---

# Bridge via Li.Fi

Universal cross-chain routing — bridge & swap across 30+ chains via Li.Fi API.

## Base URL

```
https://li.quest
```

No API key required (optional for higher rate limits).

## Quick Start: Bridge ETH → Arbitrum

### 1. Get a Quote

```bash
curl "https://li.quest/v1/quote?\
fromChain=1&\
toChain=42161&\
fromToken=0x0000000000000000000000000000000000000000&\
toToken=0x0000000000000000000000000000000000000000&\
fromAddress=0xYourAddress&\
fromAmount=1000000000000000000"
```

### 2. Execute the Transaction

```typescript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Li.Fi returns transaction request
const tx = await signer.sendTransaction({
  to: quote.transactionRequest.to,
  data: quote.transactionRequest.data,
  value: quote.transactionRequest.value,
  gasLimit: quote.transactionRequest.gasLimit,
});

await tx.wait();
```

## TypeScript SDK

```typescript
import { LiFi } from '@lifi/sdk';

const lifi = new LiFi({
  integrator: 'your-app-name',
});

// Get route
const routes = await lifi.getRoutes({
  fromChainId: 1,           // Ethereum
  toChainId: 42161,          // Arbitrum
  fromTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  toTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  fromAmount: ethers.parseEther('1').toString(),
  fromAddress: userAddress,
});

// Execute route
const result = await lifi.executeRoute(routes.routes[0], {
  updateRouteHook: (updatedRoute) => {
    console.log('Route status:', updatedRoute.status);
  },
});
```

## API Endpoints

### Get Chains
```bash
curl https://li.quest/v1/chains
```

### Get Tokens
```bash
curl https://li.quest/v1/tokens?chains=1,42161,10
```

### Get Connections (which chains can bridge to which)
```bash
curl https://li.quest/v1/connections?fromChain=1
```

### Get Quote (single step)
```bash
GET https://li.quest/v1/quote?\
  fromChain=1&toChain=42161&\
  fromToken=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&\
  toToken=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&\
  fromAmount=1000000&\
  fromAddress=0x...
```

### Get Routes (multi-step, optimized)
```bash
GET https://li.quest/v1/routes?\
  fromChain=1&toChain=137&\
  fromToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&\
  toToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&\
  fromAmount=1000000000000000000&\
  fromAddress=0x...
```

### Transaction Status
```bash
GET https://li.quest/v1/status?\
  txHash=0x...&\
  bridge=lifi&\
  fromChain=1&\
  toChain=42161
```

## Common Chain IDs

| Chain | ID |
|-------|-----|
| Ethereum | 1 |
| Polygon | 137 |
| Arbitrum | 42161 |
| Optimism | 10 |
| Base | 8453 |
| BSC | 56 |
| Avalanche | 43114 |
| zkSync Era | 324 |
| Linea | 59144 |
| Scroll | 534352 |
| Solana | 1151111081099710 |
| Sui | 784 |

## Native Token Address

Use `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` for native tokens (ETH, MATIC, etc.)

## Key Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chains` | GET | List supported chains |
| `/v1/tokens` | GET | List tokens with prices |
| `/v1/connections` | GET | Bridge connections |
| `/v1/quote` | GET | Single-step quote |
| `/v1/routes` | GET | Multi-step optimized routes |
| `/v1/status` | GET | Transaction status |
| `/v1/gas-price` | GET | Gas prices on chain |

## Error Handling

```typescript
try {
  const route = await lifi.getRoutes(params);
  if (route.routes.length === 0) {
    console.log('No routes found — try different parameters');
  }
} catch (error) {
  if (error.code === 'UNSUPPORTED_CHAIN') {
    console.log('Chain not supported by Li.Fi');
  }
}
```

## Tips

- **Slippage**: Set `slippage` parameter (e.g., 0.03 = 3%)
- **允**: Use `allowBridges` / `denyBridges` to filter bridges
- **DEX**: Use `allowExchanges` / `denyExchanges` to filter DEXs
- **Contract calls**: Use `toAddress` for recipient, `contractCallData` for complex operations
