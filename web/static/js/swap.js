// ═══ SWAP LOGIC (via Li.Fi API) ═══

const Swap = {
  fromChain: 1,
  toChain: 1,
  fromToken: null,
  toToken: null,
  slippage: 0.5,
  quote: null,

  async getQuote(fromAmount) {
    if (!this.fromToken || !this.toToken || !fromAmount || fromAmount === '0') return null;

    const amountWei = parseAmount(fromAmount, this.fromToken.decimals);

    // Use Li.Fi quote API
    const params = new URLSearchParams({
      fromChain: this.fromChain,
      toChain: this.toChain,
      fromToken: this.fromToken.address,
      toToken: this.toToken.address,
      fromAmount: amountWei,
      fromAddress: Wallet.address || '0x0000000000000000000000000000000000000000',
      slippage: this.slippage / 100,
    });

    try {
      const resp = await fetch(`https://li.quest/v1/quote?${params}`);
      if (!resp.ok) throw new Error('No route found');
      const data = await resp.json();

      if (!data || !data.estimate) return null;

      this.quote = data;
      return {
        toAmount: data.estimate.toAmount,
        toAmountMin: data.estimate.toAmountMin,
        gasCost: data.estimate.gasCosts?.[0]?.amount || '0',
        gasCostUSD: data.estimate.gasCosts?.[0]?.amountUSD || '$0',
        fee: data.estimate.feeCosts?.[0]?.amountUSD || '$0',
        route: data.tool || 'Li.Fi',
        fromAmount: data.action.fromAmount,
        toAmount: data.estimate.toAmount,
      };
    } catch (err) {
      console.error('Quote error:', err);
      return null;
    }
  },

  async execute() {
    if (!this.quote || !Wallet.signer) return;

    const tx = this.quote.transactionRequest;
    if (!tx) {
      showToast('No transaction data', 'error');
      return;
    }

    try {
      showToast('Confirm in wallet...');
      const response = await Wallet.signer.sendTransaction({
        to: tx.to,
        data: tx.data,
        value: tx.value ? BigInt(tx.value) : 0n,
        gasLimit: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
      });

      showToast('Transaction submitted!');

      // Wait for confirmation
      const receipt = await response.wait();
      if (receipt.status === 1) {
        showToast('Swap successful! ✅', 'success');
        await Wallet.updateBalance();
      } else {
        showToast('Transaction failed', 'error');
      }
    } catch (err) {
      if (err.code === 'ACTION_REJECTED') {
        showToast('Transaction rejected');
      } else {
        showToast(err.message || 'Swap failed', 'error');
      }
    }
  },
};

// Helper: parse amount to wei
function parseAmount(amount, decimals) {
  try {
    return ethers.parseUnits(String(amount), decimals).toString();
  } catch {
    return '0';
  }
}

// Helper: format amount from wei
function formatAmount(wei, decimals) {
  try {
    return ethers.formatUnits(BigInt(wei), decimals);
  } catch {
    return '0';
  }
}
