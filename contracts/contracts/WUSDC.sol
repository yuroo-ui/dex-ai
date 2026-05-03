// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title WUSDC (Wrapped USDC on Arc)
 * @dev Wraps native USDC into ERC20 for DEX compatibility.
 *      On Arc, USDC is the native gas token (like ETH on Ethereum).
 *      WUSDC allows USDC to be used in ERC20 pools.
 */
contract WUSDC is ERC20 {
    constructor() ERC20("Wrapped USDC", "WUSDC") {}

    function deposit() external payable {
        _mint(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    // Override to allow direct ETH send
    receive() external payable {
        _mint(msg.sender, msg.value);
    }
}
