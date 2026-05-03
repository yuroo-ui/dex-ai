// ═══ BRIDGE LOGIC (Li.Fi + Relay) ═══

const Bridge = {
  provider: 'lifi', // 'lifi' or 'relay'
  fromChain: 1,
  toChain: 42161,
  fromToken: null,
  toToken: null,
  quote: null,

  async getQuote(fromAmount) {
    if (!this.fromToken || !this.toToken || !fromAmount || fromAmount === '0') return null;

    const amountWei = parseAmount(fromAmount, this.fromToken.decimals);

    try {
      if (this.provider === 'relay') {
        return await this.getRelayQuote(amountWei);
      } else {
        return await this.getLifiQuote(amountWei);
      }
    } catch (err) {
      console.error('Bridge quote error:', err);
      return null;
    }
  },

  async getLifiQuote(amountWei) {
    const params = new URLSearchParams({
      fromChain: this.fromChain,
      toChain: this.toChain,
      fromToken: this.fromToken.address,
      toToken: this.toToken.address,
      fromAmount: amountWei,
      fromAddress: Wallet.address || '0x0000000000000000000000000000000000000000',
      slippage: '0.005',
    });

    const resp = await fetch(`https://li.quest/v1/quote?${params}`);
    if (!resp.ok) throw new Error('No bridge route');
    const data = await resp.json();

    if (!data || !data.estimate) return null;

    this.quote = data;
    return {
      provider: data.tool || 'Li.Fi',
      toAmount: data.estimate.toAmount,
      toAmountMin: data.estimate.toAmountMin,
      gasCostUSD: data.estimate.gasCosts?.[0]?.amountUSD || '$0',
      fee: data.estimate.feeCosts?.[0]?.amountUSD || '$0',
      estimateTime: data.estimate.executionDuration || 120,
    };
  },

  async getRelayQuote(amountWei) {
    // Relay Protocol API
    const body = {
      originChainId: this.fromChain,
      destinationChainId: this.toChain,
      user: Wallet.address || '0x0000000000000000000000000000000000000000',
      currency: this.fromToken.address,
      recipient: Wallet.address || '0x0000000000000000000000000000000000000000',
      recipientCurrency: this.toToken.address,
      tradeType: 'EXACT_INPUT',
      amount: amountWei,
    };

    const resp = await fetch('https://api.relay.link/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error('No Relay route');
    const data = await resp.json();

    if (!data || !data.quotes || data.quotes.length === 0) return null;

    const best = data.quotes[0];
    this.quote = best;
    return {
      provider: 'Relay',
      toAmount: best.details.currencyOut.amountFormatted || '0',
      toAmountMin: best.details.currencyOut.minAmount || '0',
      gasCostUSD: '$0',
      fee: '$0',
      estimateTime: best.details.timeEstimated || 30,
    };
  },

  async execute() {
    if (!this.quote || !Wallet.signer) return;

    if (this.provider === 'relay') {
      showToast('Relay bridge: open relay.link in wallet browser', 'error');
      return;
    }

    const tx = this.quote.transactionRequest;
    if (!tx) {
      showToast('No transaction data', 'error');
      return;
    }

    try {
      showToast('Confirm bridge in wallet...');
      const response = await Wallet.signer.sendTransaction({
        to: tx.to,
        data: tx.data,
        value: tx.value ? BigInt(tx.value) : 0n,
        gasLimit: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
      });

      showToast('Bridge transaction submitted!');
      const receipt = await response.wait();
      if (receipt.status === 1) {
        showToast('Bridge successful! Tokens will arrive shortly ✅', 'success');
        await Wallet.updateBalance();
      } else {
        showToast('Bridge transaction failed', 'error');
      }
    } catch (err) {
      if (err.code === 'ACTION_REJECTED') {
        showToast('Transaction rejected');
      } else {
        showToast(err.message || 'Bridge failed', 'error');
      }
    }
  },
};
