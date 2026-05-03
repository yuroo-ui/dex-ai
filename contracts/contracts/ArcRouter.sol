// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IArcFactory.sol";
import "./IArcPair.sol";
import "./IArcRouter.sol";

/**
 * @title ArcRouter
 * @dev Router for Arc DEX. Handles token swaps and liquidity operations.
 *      On Arc, native USDC is used as gas. WUSDC is the wrapped ERC20 version.
 */
contract ArcRouter is IArcRouter, ReentrancyGuard {
    address public immutable override factory;
    address public immutable override WUSDC;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "Arc: EXPIRED");
        _;
    }

    constructor(address _factory, address _WUSDC) {
        factory = _factory;
        WUSDC = _WUSDC;
    }

    receive() external payable {
        assert(msg.sender == WUSDC); // only accept WUSDC via fallback
    }

    // ─── Add Liquidity ───
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external override ensure(deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        
        address pair = IArcFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "Arc: PAIR_NOT_FOUND");
        
        _safeTransferFrom(tokenA, msg.sender, pair, amountA);
        _safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IArcPair(pair).mint(to);
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal returns (uint256 amountA, uint256 amountB) {
        // Create pair if it doesn't exist
        if (IArcFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            IArcFactory(factory).createPair(tokenA, tokenB);
        }
        
        (uint256 reserveA, uint256 reserveB) = _getReserves(tokenA, tokenB);
        
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = _quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Arc: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = _quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "Arc: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    // ─── Remove Liquidity ───
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) public override ensure(deadline) returns (uint256 amountA, uint256 amountB) {
        address pair = IArcFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "Arc: PAIR_NOT_FOUND");
        
        // Send LP tokens to pair
        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        
        (uint256 amount0, uint256 amount1) = IArcPair(pair).burn(to);
        
        (address token0, ) = _sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        
        require(amountA >= amountAMin && amountB >= amountBMin, "Arc: INSUFFICIENT_LIQUIDITY_BURNED");
    }

    // ─── Swap Exact Tokens for Tokens ───
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override ensure(deadline) returns (uint256[] memory amounts) {
        amounts = _getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Arc: INSUFFICIENT_OUTPUT_AMOUNT");
        
        _safeTransferFrom(path[0], msg.sender, IArcFactory(factory).getPair(path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    // ─── Swap Native USDC for Tokens ───
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[0] == WUSDC, "Arc: INVALID_PATH");
        
        // Wrap native USDC to WUSDC
        IWUSDC(WUSDC).deposit{value: msg.value}();
        
        amounts = _getAmountsOut(msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Arc: INSUFFICIENT_OUTPUT_AMOUNT");
        
        _safeTransferFrom(path[0], msg.sender, IArcFactory(factory).getPair(path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    // ─── Swap Tokens for Native USDC ───
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WUSDC, "Arc: INVALID_PATH");
        
        amounts = _getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Arc: INSUFFICIENT_OUTPUT_AMOUNT");
        
        _safeTransferFrom(path[0], msg.sender, IArcFactory(factory).getPair(path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        
        // Unwrap WUSDC to native USDC
        IWUSDC(WUSDC).withdraw(amounts[amounts.length - 1]);
        payable(to).transfer(amounts[amounts.length - 1]);
    }

    // ─── Internal Swap ───
    function _swap(uint256[] memory amounts, address[] memory path, address _to) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = _sortTokens(input, output);
            
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            
            address to = i < path.length - 2 ? IArcFactory(factory).getPair(output, path[i + 2]) : _to;
            
            address pair = IArcFactory(factory).getPair(input, output);
            IArcPair(pair).swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    // ─── Get Reserves ───
    function _getReserves(address tokenA, address tokenB) internal view returns (uint256 reserveA, uint256 reserveB) {
        (address token0, address token1) = _sortTokens(tokenA, tokenB);
        address pair = IArcFactory(factory).getPair(token0, token1);
        
        if (pair != address(0)) {
            (uint112 reserve0, uint112 reserve1, ) = IArcPair(pair).getReserves();
            (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
        }
    }

    // ─── Quote ───
    function getAmountsOut(uint256 amountIn, address[] calldata path) public view override returns (uint256[] memory amounts) {
        return _getAmountsOut(amountIn, path);
    }

    function _getAmountsOut(uint256 amountIn, address[] memory path) internal view returns (uint256[] memory amounts) {
        require(path.length >= 2, "Arc: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i; i < path.length - 1; i++) {
            (uint256 reserveIn, uint256 reserveOut) = _getReserves(path[i], path[i + 1]);
            require(reserveIn > 0 && reserveOut > 0, "Arc: INSUFFICIENT_LIQUIDITY");
            amounts[i + 1] = _getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256 amountOut) {
        require(amountIn > 0, "Arc: INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "Arc: INSUFFICIENT_LIQUIDITY");
        
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        
        amountOut = numerator / denominator;
    }

    function getAmountsIn(uint256 amountOut, address[] calldata path) public view override returns (uint256[] memory amounts) {
        return _getAmountsIn(amountOut, path);
    }

    function _getAmountsIn(uint256 amountOut, address[] memory path) internal view returns (uint256[] memory amounts) {
        require(path.length >= 2, "Arc: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[amounts.length - 1] = amountOut;
        
        for (uint256 i = path.length - 1; i > 0; i--) {
            (uint256 reserveIn, uint256 reserveOut) = _getReserves(path[i - 1], path[i]);
            require(reserveIn > 0 && reserveOut > 0, "Arc: INSUFFICIENT_LIQUIDITY");
            amounts[i - 1] = _getAmountIn(amountOut, reserveIn, reserveOut);
            amountOut = amounts[i - 1];
        }
    }

    function _getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256 amountIn) {
        require(amountOut > 0, "Arc: INSUFFICIENT_OUTPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "Arc: INSUFFICIENT_LIQUIDITY");
        
        uint256 numerator = reserveIn * amountOut * 1000;
        uint256 denominator = (reserveOut - amountOut) * 997;
        amountIn = (numerator / denominator) + 1;
    }

    // ─── Helpers ───
    function _quote(uint256 amountA, uint256 reserveA, uint256 reserveB) internal pure returns (uint256 amountB) {
        require(amountA > 0, "Arc: INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "Arc: INSUFFICIENT_LIQUIDITY");
        amountB = amountA * reserveB / reserveA;
    }

    function _sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "Arc: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "Arc: ZERO_ADDRESS");
    }

    function _safeTransferFrom(address token, address from, address to, uint256 value) private {
        IERC20(token).transferFrom(from, to, value);
    }
}

interface IWUSDC {
    function deposit() external payable;
    function withdraw(uint256) external;
}
