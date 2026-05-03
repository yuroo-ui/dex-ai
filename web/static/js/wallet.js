// ═══ WALLET CONNECTION ═══

const Wallet = {
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  balance: '0',

  async connect() {
    if (typeof window.ethereum === 'undefined') {
      showToast('Please install MetaMask!', 'error');
      return false;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);
      await this.updateBalance();
      this.onConnected();
      return true;
    } catch (err) {
      showToast('Connection rejected', 'error');
      return false;
    }
  },

  async updateBalance() {
    if (!this.provider || !this.address) return;
    try {
      const bal = await this.provider.getBalance(this.address);
      this.balance = ethers.formatEther(bal);
    } catch { this.balance = '0'; }
  },

  async switchChain(chainId) {
    if (!window.ethereum) return;
    const hex = '0x' + chainId.toString(16);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hex }],
      });
    } catch (err) {
      // Chain not added
      if (err.code === 4902) {
        const net = NETWORKS[chainId];
        if (!net) return;
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: hex,
            chainName: net.name,
            nativeCurrency: net.native,
            rpcUrls: [net.rpc],
            blockExplorerUrls: [net.explorer],
          }],
        });
      }
    }
  },

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.balance = '0';
    this.onDisconnected();
  },

  shortAddress() {
    if (!this.address) return '';
    return this.address.slice(0, 6) + '...' + this.address.slice(-4);
  },

  onConnected() {
    const btn = document.getElementById('connectBtn');
    const text = document.getElementById('connectText');
    btn.classList.add('connected');
    text.textContent = this.shortAddress();
    showToast(`Connected: ${this.shortAddress()}`, 'success');
    // Update UI
    if (typeof updateBalances === 'function') updateBalances();
    if (typeof updateNetworkUI === 'function') updateNetworkUI();
  },

  onDisconnected() {
    const btn = document.getElementById('connectBtn');
    const text = document.getElementById('connectText');
    btn.classList.remove('connected');
    text.textContent = 'Connect';
    showToast('Wallet disconnected');
  },

  // Listen for account/chain changes
  initListeners() {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) { this.disconnect(); return; }
      this.address = accounts[0];
      this.signer = null;
      this.provider.getSigner().then(s => this.signer = s);
      this.updateBalance();
      this.onConnected();
    });
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  },
};
