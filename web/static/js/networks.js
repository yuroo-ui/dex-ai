// ═══ NETWORKS CONFIG ═══
const NETWORKS = {
  1: {
    id: 1, name: 'Ethereum', short: 'ETH',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/ethereum.svg',
    rpc: 'https://cloudflare-eth.com',
    explorer: 'https://etherscan.io',
    native: { symbol: 'ETH', decimals: 18 },
    lifiId: 1, relayId: 1,
  },
  42161: {
    id: 42161, name: 'Arbitrum', short: 'ARB',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/arbitrum.svg',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    native: { symbol: 'ETH', decimals: 18 },
    lifiId: 42161, relayId: 42161,
  },
  10: {
    id: 10, name: 'Optimism', short: 'OP',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/optimism.svg',
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    native: { symbol: 'ETH', decimals: 18 },
    lifiId: 10, relayId: 10,
  },
  8453: {
    id: 8453, name: 'Base', short: 'BASE',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/base.svg',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    native: { symbol: 'ETH', decimals: 18 },
    lifiId: 8453, relayId: 8453,
  },
  137: {
    id: 137, name: 'Polygon', short: 'POL',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/polygon.svg',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    native: { symbol: 'POL', decimals: 18 },
    lifiId: 137, relayId: 137,
  },
  56: {
    id: 56, name: 'BSC', short: 'BSC',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bsc.svg',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    native: { symbol: 'BNB', decimals: 18 },
    lifiId: 56, relayId: 56,
  },
  43114: {
    id: 43114, name: 'Avalanche', short: 'AVAX',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/avalanche.svg',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    native: { symbol: 'AVAX', decimals: 18 },
    lifiId: 43114, relayId: 43114,
  },
  324: {
    id: 324, name: 'zkSync Era', short: 'ZK',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/zksync.svg',
    rpc: 'https://mainnet.era.zksync.io',
    explorer: 'https://explorer.zksync.io',
    native: { symbol: 'ETH', decimals: 18 },
    lifiId: 324,
  },
  59144: {
    id: 59144, name: 'Linea', short: 'LINEA',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/linea.svg',
    rpc: 'https://rpc.linea.build',
    explorer: 'https://lineascan.build',
    native: { symbol: 'ETH', decimals: 18 },
    lifiId: 59144,
  },
  534352: {
    id: 534352, name: 'Scroll', short: 'SCR',
    icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/scroll.svg',
    rpc: 'https://rpc.scroll.io',
    explorer: 'https://scrollscan.com',
    native: { symbol: 'ETH', decimals: 18 },
    lifiId: 534352,
  },
  5042002: {
    id: 5042002, name: 'Arc Testnet', short: 'USDC',
    icon: 'arc',
    rpc: 'https://rpc.testnet.arc.network',
    explorer: 'https://testnet.arcscan.app',
    native: { symbol: 'USDC', decimals: 18 },
    lifiId: 5042002,
  },
};

// Popular tokens per chain
const CHAIN_TOKENS = {
  1: [
    { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/ethereum.svg' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdc.svg' },
    { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdt.svg' },
    { symbol: 'WETH', name: 'Wrapped ETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/ethereum.svg' },
    { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/dai.svg' },
    { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/btc.svg' },
  ],
  42161: [
    { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/ethereum.svg' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdc.svg' },
    { symbol: 'USDT', name: 'Tether', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdt.svg' },
    { symbol: 'WETH', name: 'Wrapped ETH', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/ethereum.svg' },
  ],
  10: [
    { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/ethereum.svg' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdc.svg' },
    { symbol: 'USDT', name: 'Tether', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdt.svg' },
  ],
  8453: [
    { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/ethereum.svg' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdc.svg' },
    { symbol: 'cbBTC', name: 'Coinbase BTC', address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eE332Ef', decimals: 8, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/btc.svg' },
  ],
  137: [
    { symbol: 'POL', name: 'Polygon', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/polygon.svg' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdc.svg' },
    { symbol: 'USDT', name: 'Tether', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdt.svg' },
  ],
  56: [
    { symbol: 'BNB', name: 'BNB', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bsc.svg' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdc.svg' },
    { symbol: 'USDT', name: 'Tether', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, icon: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/usdt.svg' },
  ],
  // Arc Network — USDC is the native gas token (18 decimals)
  5042002: [
    { symbol: 'USDC', name: 'USD Coin (Native)', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, icon: 'arc' },
  ],
};

function getTokensForChain(chainId) {
  return CHAIN_TOKENS[chainId] || CHAIN_TOKENS[1] || [];
}
