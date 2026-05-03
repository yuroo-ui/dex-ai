// ═══ NETWORKS CONFIG — Arc Only ═══
const NETWORKS = {
  5042002: {
    id: 5042002,
    name: 'Arc Testnet',
    short: 'ARC',
    rpc: 'https://rpc.testnet.arc.network',
    explorer: 'https://testnet.arcscan.app',
    native: { symbol: 'USDC', decimals: 18 },
  },
};

// Arc Token Registry
const ARC_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin (Native Gas)', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
];

function getTokensForArc() {
  return ARC_TOKENS;
}
