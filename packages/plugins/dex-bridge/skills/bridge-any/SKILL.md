---
name: bridge-any
description: Universal cross-chain bridge patterns — aggregator, providers, best practices
version: 1.0.0
triggers:
  - bridge
  - cross chain
  - multichain
  - omnichain
  - transfer between chains
  - send to another chain
tags: [bridge, cross-chain, aggregator, multichain]
author: dex-ai
---

# Universal Bridge Patterns

Cross-chain bridge strategies using multiple providers.

## Bridge Providers Comparison

| Provider | Speed | Chains | Type | Best For |
|----------|-------|--------|------|----------|
| Li.Fi | ~2-30 min | 30+ | Aggregator | Best routes, most options |
| Relay | ~10-30 sec | 15+ | Solver | Instant transfers |
| LayerZero | ~15 min | 50+ | Messaging | OMNICHAIN tokens |
| Wormhole | ~15 min | 25+ | Messaging | Solana ↔ EVM |
| Axelar | ~10 min | 60+ | Messaging | General purpose |
| CCTP | ~20 min | 8+ | Circle | USDC native mint |
| Hop | ~10 min | 8+ | Liquidity | L2 ↔ L1 |
| Stargate | ~5 min | 15+ | Liquidity | Stablecoins |
| Across | ~5 min | 10+ | Liquidity | Fast L2 transfers |

## Decision Tree

```
Is it USDC?
├── Yes → Use CCTP (native burn/mint, no bridge wrapping)
└── No
    ├── Need instant (< 1 min)?
    │   ├── Yes → Use Relay
    │   └── No → Use Li.Fi (best rate)
    └── Solana involved?
        ├── Yes → Use Wormhole or Li.Fi
        └── No → Use Li.Fi or Stargate
```

## Universal Bridge Function

```typescript
type BridgeParams = {
  fromChain: number;
  toChain: number;
  token: string;
  amount: string;
  recipient: string;
  speed: 'fast' | 'cheap' | 'best';
};

async function bridge(params: BridgeParams) {
  // 1. Try Relay for instant
  if (params.speed === 'fast') {
    try {
      return await relayBridge(params);
    } catch { /* fallback */ }
  }

  // 2. Use Li.Fi for best route
  const routes = await lifi.getRoutes({
    fromChainId: params.fromChain,
    toChainId: params.toChain,
    fromTokenAddress: params.token,
    toTokenAddress: params.token, // same token on dest
    fromAmount: params.amount,
    fromAddress: userAddress,
  });

  if (routes.routes.length === 0) {
    throw new Error('No bridge routes available');
  }

  // Return best route (sorted by value)
  return routes.routes[0];
}
```

## USDC Bridge (CCTP)

Circle's Cross-Chain Transfer Protocol — no wrapped USDC:

```typescript
import { CCTP } from '@circle/cctp-sdk';

// Step 1: Approve USDC to CCTP contract
await usdc.approve(CCTP_CONTRACT, amount);

// Step 2: Deposit for burn (source chain)
const tx = await cctp.depositForBurn({
  amount,
  destinationDomain: 3, // Arbitrum
  mintRecipient: recipientAddress,
});

// Step 3: Wait for attestation (~5-15 min)
const attestation = await cctp.getAttestation(tx.transactionHash);

// Step 4: Receive on destination
await cctp.receiveMessage(attestation);
```

## Bridge Safety Checklist

- [ ] Verify recipient address (bridges can't reverse)
- [ ] Check minimum amount (some bridges have minimums)
- [ ] Confirm chain IDs (source and destination)
- [ ] Account for slippage on volatile assets
- [ ] Don't bridge to/from contracts that can't receive
- [ ] Test with small amount first

## Common Pitfalls

| Issue | Solution |
|-------|----------|
| Tokens stuck on wrong chain | Bridge back or use multichain router |
| Wrapped token on dest | Swap to native via DEX |
| Bridge contract can't receive | Use EOA or bridge-compatible contract |
| Timeout | Most bridges timeout after 24h, funds return |
| Slippage | Set appropriate slippage for volatile assets |

## Gas on Destination

When bridging, also bridge gas tokens:

```typescript
// Li.Fi supports this natively
const route = await lifi.getRoutes({
  fromChainId: 1,
  toChainId: 42161,
  fromTokenAddress: '0xEeeeeEeee...',
  toTokenAddress: '0xEeeeeEeee...',
  toAddress: userAddress,
  // Li.Fi will split: bridge main token + gas
});
```

## Cross-Chain Messaging (LayerZero / Axelar)

For non-token transfers (messages, commands):

```typescript
// LayerZero OFT transfer
const tx = await oft.send(
  { dstEid: 30101, to: recipient, amount, minAmount },
  { executor: executorAddress, extraOptions: [] }
);

// Axelar general message
const tx = await axelarGateway.callContract(
  destChain,
  destAddress,
  payload // ABI-encoded message
);
```
