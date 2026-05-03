---
name: bridge-relay
description: Fast cross-chain bridge & messaging via Relay Protocol
version: 1.0.0
triggers:
  - relay bridge
  - relay protocol
  - fast bridge
  - cross chain message
  - cross chain transfer
  - relaychian
tags: [bridge, cross-chain, relay, fast-transfer]
author: dex-ai
---

# Bridge via Relay Protocol

Fast cross-chain bridging with instant execution via [Relay](https://relay.link).

## How Relay Works

Relay uses a **solver network** — solvers front liquidity on the destination chain, so transfers complete in seconds instead of waiting for bridge confirmations.

```
User → approves on source → signs permit → solver delivers on destination → relayed!
```

## Base URL

```
https://api.relay.link
```

## Quick Start: Bridge USDC Arbitrum → Base

### 1. Get Quote

```bash
curl -X POST "https://api.relay.link/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "originChainId": 42161,
    "destinationChainId": 8453,
    "user": "0xYourAddress",
    "originCurrency": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "destinationCurrency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "tradeType": "EXACT_INPUT",
    "amount": "1000000",
    "slippage": { "type": "percent", "value": 0.5 }
  }'
```

### 2. Execute

```typescript
import { ethers } from 'ethers';

const signer = new ethers.BrowserProvider(window.ethereum).getSigner();

// Relay returns calldata to send
const tx = await signer.sendTransaction({
  to: quote.step.txRequest.to,
  data: quote.step.txRequest.data,
  value: quote.step.txRequest.value || 0n,
});

await tx.wait();
// Funds arrive on destination in ~10-30 seconds!
```

## TypeScript SDK

```typescript
import { getQuote, getRoutes } from '@relayprotocol/relay-sdk';

// Get quote
const quote = await getQuote({
  originChainId: 42161,         // Arbitrum
  destinationChainId: 8453,     // Base
  user: userAddress,
  originCurrency: ARBITRUM_USDC,
  destinationCurrency: BASE_USDC,
  tradeType: 'EXACT_INPUT',
  amount: '1000000',            // 1 USDC
  slippage: { type: 'percent', value: 0.5 },
});

// Execute
const tx = await signer.sendTransaction(quote.step.txRequest);
```

## API Endpoints

### POST /quote
Get a single-step quote.

```json
{
  "originChainId": 42161,
  "destinationChainId": 8453,
  "user": "0x...",
  "originCurrency": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  "destinationCurrency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "tradeType": "EXACT_INPUT",
  "amount": "1000000",
  "slippage": { "type": "percent", "value": 0.5 }
}
```

### POST /routes
Get multiple route options with different bridges.

### GET /currencies/{chainId}
List supported currencies on a chain.

### GET /chains
List supported chains.

### POST /Execute
Execute a cross-chain transfer with step-by-step guidance.

### GET /transfer/{txHash}
Track transfer status across chains.

## Supported Chains

| Chain | ID |
|-------|-----|
| Ethereum | 1 |
| Arbitrum | 42161 |
| Optimism | 10 |
| Base | 8453 |
| Polygon | 137 |
| BSC | 56 |
| Avalanche | 43114 |
| zkSync Era | 324 |
| Linea | 59144 |
| Scroll | 534352 |
| Mantle | 5000 |
| Blast | 81457 |

## Transfer Status Flow

```
1. PENDING       — Quote created, waiting for execution
2. VALIDATING    — Signature verified
3. RELAYING      — Solver processing
4. COMPLETED     — Funds delivered on destination
5. FAILED        — Error occurred (funds returned)
```

## Key Features

- **Instant transfers**: ~10-30 seconds via solver network
- **No bridging wait**: No need to wait for L1 confirmations
- **Gas on destination**: Can include gas token on destination
- **Permit2 support**: Gasless approvals via EIP-2612

## Tips

- **Native transfers**: Set `originCurrency` and `destinationCurrency` to `0xEeeeeEeee...`
- **Gas**: Relay can deliver gas tokens on destination (set `recipient` with gas amount)
- **Slippage**: Default 0.5%, increase for volatile assets
- **Bridges**: Relay auto-selects best bridge/solver for speed & cost
