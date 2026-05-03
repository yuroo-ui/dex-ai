// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArcPair
 * @dev Liquidity pool for two ERC20 tokens.
 *      Supports: mint (add liquidity), burn (remove liquidity), swap.
 */
contract ArcPair is ERC20, ReentrancyGuard {
    address public factory;
    address public token0;
    address public token1;

    uint112 private reserve0;
    uint112 private reserve1;
    uint32 private blockTimestampLast;

    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    uint256 public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

    uint256 private constant MINIMUM_LIQUIDITY = 1000;

    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    constructor() ERC20("Arc LP Token", "ARC-LP") {
        factory = msg.sender;
    }

    // Called once by factory at deployment
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, "Arc: FORBIDDEN");
        token0 = _token0;
        token1 = _token1;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    // Internal: update reserves and price cumulative
    function _update(uint256 balance0, uint256 balance1, uint112 _reserve0, uint112 _reserve1) private {
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "Arc: OVERFLOW");
        
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        unchecked {
            uint32 timeElapsed = blockTimestamp - blockTimestampLast;
            if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
                price0CumulativeLast += uint256(uint112(balance1)) * timeElapsed / uint112(balance0);
                price1CumulativeLast += uint256(uint112(balance0)) * timeElapsed / uint112(balance1);
            }
        }
        
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        
        emit Sync(reserve0, reserve1);
    }

    // Mint LP tokens (add liquidity)
    function mint(address to) external nonReentrant returns (uint256 liquidity) {
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        
        uint256 amount0 = balance0 - _reserve0;
        uint256 amount1 = balance1 - _reserve1;
        
        uint256 _totalSupply = totalSupply();
        
        if (_totalSupply == 0) {
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(1), MINIMUM_LIQUIDITY); // permanently lock MINIMUM_LIQUIDITY
        } else {
            liquidity = min(amount0 * _totalSupply / _reserve0, amount1 * _totalSupply / _reserve1);
        }
        
        require(liquidity > 0, "Arc: INSUFFICIENT_LIQUIDITY_MINTED");
        _mint(to, liquidity);
        
        _update(balance0, balance1, _reserve0, _reserve1);
        kLast = uint256(reserve0) * reserve1;
        
        emit Mint(msg.sender, amount0, amount1);
    }

    // Burn LP tokens (remove liquidity)
    function burn(address to) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 liquidity = balanceOf(address(this));
        
        uint256 _totalSupply = totalSupply();
        amount0 = liquidity * balance0 / _totalSupply;
        amount1 = liquidity * balance1 / _totalSupply;
        
        require(amount0 > 0 && amount1 > 0, "Arc: INSUFFICIENT_LIQUIDITY_BURNED");
        
        _burn(address(this), liquidity);
        
        _safeTransfer(token0, to, amount0);
        _safeTransfer(token1, to, amount1);
        
        balance0 = IERC20(token0).balanceOf(address(this));
        balance1 = IERC20(token1).balanceOf(address(this));
        
        _update(balance0, balance1, _reserve0, _reserve1);
        kLast = uint256(reserve0) * reserve1;
        
        emit Burn(msg.sender, amount0, amount1, to);
    }

    // Swap tokens
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external nonReentrant {
        require(amount0Out > 0 || amount1Out > 0, "Arc: INSUFFICIENT_OUTPUT_AMOUNT");
        
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, "Arc: INSUFFICIENT_LIQUIDITY");
        
        uint256 balance0;
        uint256 balance1;
        
        {
            require(to != token0 && to != token1, "Arc: INVALID_TO");
            
            if (amount0Out > 0) _safeTransfer(token0, to, amount0Out);
            if (amount1Out > 0) _safeTransfer(token1, to, amount1Out);
            
            // Callback for flash swaps (optional)
            if (data.length > 0) {
                // IArcPairCallee(to).token0Callback(...);
            }
            
            balance0 = IERC20(token0).balanceOf(address(this));
            balance1 = IERC20(token1).balanceOf(address(this));
        }
        
        uint256 amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        
        require(amount0In > 0 || amount1In > 0, "Arc: INSUFFICIENT_INPUT_AMOUNT");
        
        {
            // Fee: 0.3% (3/1000)
            uint256 balance0Adjusted = balance0 * 1000 - amount0In * 3;
            uint256 balance1Adjusted = balance1 * 1000 - amount1In * 3;
            
            require(balance0Adjusted * balance1Adjusted >= uint256(_reserve0) * _reserve1 * (1000**2), "Arc: K");
        }
        
        _update(balance0, balance1, _reserve0, _reserve1);
        
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    // Force sync reserves
    function sync() external nonReentrant {
        _update(
            IERC20(token0).balanceOf(address(this)),
            IERC20(token1).balanceOf(address(this)),
            reserve0,
            reserve1
        );
    }

    // ─── Internal Helpers ───
    function _safeTransfer(address token, address to, uint256 value) private {
        require(IERC20(token).transfer(to, value), "Arc: TRANSFER_FAILED");
    }

    function min(uint256 x, uint256 y) private pure returns (uint256) {
        return x < y ? x : y;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
