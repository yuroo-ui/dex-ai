// ═══ Arc DEX Contract Addresses ═══
// Deployed contracts on Arc Testnet
const CONTRACTS = {
  router: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  factory: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  wusdc: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
};

// Router ABI (minimal for swap)
const ROUTER_ABI = [
  'function factory() view returns (address)',
  'function WUSDC() view returns (address)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)',
];

// Factory ABI (minimal)
const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address pair)',
  'function allPairsLength() view returns (uint256)',
];

// Pair ABI (minimal)
const PAIR_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
];

// ERC20 ABI (minimal)
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

// Test token addresses (for testing swap - deploy these on Arc)
const TEST_TOKENS = {
  // Will be populated after test token deployment
};
