// ═══ BRIDGE LOGIC — Arc Network ═══
// Arc has native bridge: https://bridge.arc.network
// Supports: Ethereum, Arbitrum, Optimism, Base → Arc

const ARC_BRIDGE_URL = 'https://bridge.arc.network';
const ARC_SUPPORTED_SOURCES = [1, 42161, 10, 8453, 137, 56];

const Bridge = {
  fromChain: 1,
  toChain: ARC_CHAIN_ID,
  fromToken: null,
  toToken: null,
  quote: null,

  async getQuote(amount) {
    if (!this.fromToken || !this.toToken || !amount) return null;
    try {
      // Arc Bridge — USDC in/out
      const fee = parseFloat(amount) * 0.001; // 0.1% bridge fee estimate
      this.quote = {
        toAmount: (parseFloat(amount) - fee).toFixed(6),
        fee: fee.toFixed(6),
        estimatedTime: '~2-5 min',
        route: 'Arc Native Bridge',
      };
      return this.quote;
    } catch (err) {
      console.error('Bridge quote error:', err);
      return null;
    }
  },

  async execute(amount) {
    if (!Wallet.provider) throw new Error('Not connected');
    // Redirect to Arc Bridge
    window.open(`${ARC_BRIDGE_URL}?from=${this.fromChain}&to=arc&amount=${amount}`, '_blank');
    return 'redirected';
  },
};
