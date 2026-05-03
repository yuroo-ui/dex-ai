---
name: hook-developer
description: Build custom DEX hooks for advanced order types and pool logic
version: 1.0.0
triggers:
  - custom hook
  - hook development
  - pool hook
  - before swap hook
  - after swap hook
tags: [hooks, development, pool, advanced]
author: dex-ai
---

# Hook Developer

Build custom hooks for DEX pools to add advanced functionality.

## Hook Lifecycle

```
beforeInitialize  → Pool setup
afterInitialize   → Pool ready
beforeSwap       → Before swap executes
afterSwap        → After swap executes
beforeDonate     → Before liquidity added
afterDonate      → After liquidity added
```

## Basic Hook Template

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPoolManager} from "@dex/v4-interfaces/IPoolManager.sol";
import {BaseHook} from "@dex/v4-utils/BaseHook.sol";

contract MyHook is BaseHook {
    constructor(IPoolManager _manager) BaseHook(_manager) {}

    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: true,
            beforeSwap: true,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterDonateReturnDelta: false
        });
    }

    function afterInitialize(
        address,
        PoolKey calldata key,
        uint160 sqrtPriceX96,
        int24 tick
    ) internal override returns (int24) {
        // Hook logic after pool initialization
        emit PoolInitialized(key.toId(), sqrtPriceX96, tick);
        return tick;
    }

    function beforeSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata
    ) internal override returns (int256 delta, BeforeSwapDelta undefined, uint24 hookData) {
        // Modify swap parameters or add fees
        // Can return custom hook data for afterSwap
        return (0, BeforeSwapDelta.wrap(0), 0);
    }
}
```

## Hook Data Pattern

Pass data between beforeSwap and afterSwap:

```solidity
// beforeSwap returns hookData
function beforeSwap(...) returns (..., uint24 hookData) {
    uint24 fee = calculateDynamicFee(key, params);
    return (0, BeforeSwapDelta.wrap(0), fee);
}

// afterSwap receives hookData
function afterSwap(..., uint24 hookData) internal {
    uint24 fee = hookData;
    // Distribute fee
}
```

## Testing

```bash
# Run hook tests
npx hardhat test test/hooks/

# Deploy to testnet
npx hardhat run scripts/deploy-hook.ts --network sepolia
```
