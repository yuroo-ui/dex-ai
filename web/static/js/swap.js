// ═══ SWAP LOGIC — Arc Network ═══
const ARC_CHAIN_ID = 5042002;
const ARC_RPC = 'https://rpc.testnet.arc.network';

const Swap = {
  fromToken: null,
  toToken: null,
  quote: null,

  async getQuote(amount) {
    if (!this.fromToken || !this.toToken || !amount) return null;
    try {
      // Arc uses native USDC as gas — swap is direct via DEX router
      const fromAmount = parseUnits(amount, this.fromToken.decimals);
      // For now, return mock quote since Arc DEX routes are being finalized
      const rate = 1; // USDC to USDC = 1:1, will expand with more Arc tokens
      this.quote = {
        toAmount: (parseFloat(amount) * rate).toFixed(6),
        gasEstimate: '~150,000',
        priceImpact: '0.01%',
        route: 'Arc DEX Router',
      };
      return this.quote;
    } catch (err) {
      console.error('Quote error:', err);
      return null;
    }
  },

  async execute(amount) {
    if (!Wallet.provider || !this.fromToken) throw new Error('Not connected');
    try {
      const amountWei = parseUnits(amount, this.fromToken.decimals);
      if (this.fromToken.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        // Native USDC transfer (gas token on Arc)
        const tx = await Wallet.signer.sendTransaction({
          to: '0x0000000000000000000000000000000000000000', // placeholder — actual DEX router
          value: amountWei,
        });
        return tx.hash;
      }
      return '0x...pending';
    } catch (err) {
      throw err;
    }
  },
};

function parseUnits(value, decimals) {
  const [integer, fraction = ''] = String(value).split('.');
  const frac = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integer || '0') * BigInt(10 ** decimals) + BigInt(frac || '0');
}

function formatEther(wei) {
  const s = wei.toString();
  const d = 18;
  if (s.length <= d) return '0.' + s.padStart(d, '0');
  return s.slice(0, s.length - d) + '.' + s.slice(s.length - d);
}
