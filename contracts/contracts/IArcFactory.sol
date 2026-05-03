// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IArcFactory
 * @dev Interface for the Arc DEX Factory
 */
interface IArcFactory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairIndex);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairsLength() external view returns (uint256);
    function createPair(address tokenA, address tokenB) external returns (address pair);
    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);
}
