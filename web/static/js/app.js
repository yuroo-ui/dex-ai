// ═══ Arc DEX App ═══

// ─── State ───
let currentPage = 'swap';

// ─── Helpers ───
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  loadArcTokens();
  initSwap();
  initBridge();
  initWallet();
});

// ─── Nav ───
function initNav() {
  $$('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (!page) return;
      currentPage = page;
      $$('.nav-link').forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      $$('.page').forEach((p) => p.classList.remove('active'));
      $(`#page-${page}`).classList.add('active');
    });
  });
}

// ─── Load Arc Tokens ───
function loadArcTokens() {
  const tokens = getTokensForArc();
  Swap.fromToken = tokens[0]; // USDC
  Swap.toToken = tokens[0];   // USDC (will expand with more tokens)
  updateSwapUI();
  
  Bridge.fromToken = { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' };
  Bridge.toToken = tokens[0];
  updateBridgeUI();
}

// ─── Wallet ───
const Wallet = {
  provider: null,
  signer: null,
  address: null,
  balance: null,

  async connect() {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    try {
      // Request Arc network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4CF7E2' }], // 5042002 in hex
        });
      } catch (e) {
        // Add Arc network if not exists
        if (e.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x4CF7E2',
              chainName: 'Arc Testnet',
              nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
              rpcUrls: ['https://rpc.testnet.arc.network'],
              blockExplorerUrls: ['https://testnet.arcscan.app'],
            }],
          });
        }
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];
      
      // Get balance
      const balance = await this.provider.getBalance(this.address);
      this.balance = formatUnits(balance, 18);
      
      updateWalletUI();
      getBalances();
    } catch (err) {
      console.error('Connect error:', err);
    }
  },

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.balance = null;
    updateWalletUI();
  },
};

function initWallet() {
  $('#connectBtn').addEventListener('click', () => {
    if (Wallet.address) {
      $('#walletDrawer').classList.add('open');
    } else {
      Wallet.connect();
    }
  });
  $('#walletDrawerClose').addEventListener('click', () => {
    $('#walletDrawer').classList.remove('open');
  });
  $('#disconnectBtn').addEventListener('click', () => {
    Wallet.disconnect();
    $('#walletDrawer').classList.remove('open');
  });
  
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => Wallet.connect());
    window.ethereum.on('chainChanged', () => window.location.reload());
  }
}

function updateWalletUI() {
  const btn = $('#connectBtn');
  if (Wallet.address) {
    const short = Wallet.address.slice(0, 6) + '...' + Wallet.address.slice(-4);
    btn.textContent = short;
    $('#walletAddr').textContent = Wallet.address;
    $('#walletShort').textContent = short;
    $('#walletBalance').textContent = Wallet.balance ? parseFloat(Wallet.balance).toFixed(4) + ' USDC' : '—';
    $('#walletDrawer').querySelector('.drawer-content').style.display = 'block';
    $('#walletDrawer').querySelector('.drawer-empty').style.display = 'none';
  } else {
    btn.textContent = 'Connect Wallet';
    $('#walletDrawer').querySelector('.drawer-content').style.display = 'none';
    $('#walletDrawer').querySelector('.drawer-empty').style.display = 'block';
  }
}

async function getBalances() {
  if (!Wallet.address || !Wallet.provider) return;
  try {
    const bal = await Wallet.provider.getBalance(Wallet.address);
    Wallet.balance = formatUnits(bal, 18);
    $('#walletBalance').textContent = parseFloat(Wallet.balance).toFixed(4) + ' USDC';
    $('#arcBalance').textContent = parseFloat(Wallet.balance).toFixed(4);
  } catch (err) {
    console.error('Balance error:', err);
  }
}

function formatUnits(wei, decimals) {
  const s = wei.toString();
  if (s.length <= decimals) return '0.' + s.padStart(decimals, '0');
  return s.slice(0, s.length - decimals) + '.' + s.slice(s.length - decimals);
}

// ─── Swap ───
function initSwap() {
  $('#fromAmount').addEventListener('input', debounce(async () => {
    const val = $('#fromAmount').value;
    if (!val || val === '0') {
      $('#toAmount').value = '';
      $('#swapBtn').textContent = 'Enter Amount';
      $('#swapBtn').disabled = true;
      return;
    }
    
    const quote = await Swap.getQuote(val);
    if (quote) {
      $('#toAmount').value = quote.toAmount;
      $('#swapBtn').textContent = `Swap USDC → USDC`;
      $('#swapBtn').disabled = !Wallet.address;
    }
  }, 300));

  $('#swapDirection').addEventListener('click', () => {
    // For single-token chain, just flip amount display
    const fromVal = $('#fromAmount').value;
    const toVal = $('#toAmount').value;
    $('#fromAmount').value = toVal;
    $('#toAmount').value = fromVal;
  });

  $('#swapBtn').addEventListener('click', async () => {
    if (!Wallet.address) {
      Wallet.connect();
      return;
    }
    const amount = $('#fromAmount').value;
    if (!amount) return;
    
    try {
      $('#swapBtn').textContent = 'Swapping...';
      $('#swapBtn').disabled = true;
      const txHash = await Swap.execute(amount);
      $('#swapBtn').textContent = 'Success!';
      showToast(`Transaction: ${txHash.slice(0, 10)}...`, 'success');
      getBalances();
    } catch (err) {
      $('#swapBtn').textContent = 'Swap Failed';
      showToast(err.message, 'error');
    }
  });
}

function updateSwapUI() {
  if (Swap.fromToken) {
    $('#fromSymbol').textContent = Swap.fromToken.symbol;
    $('#fromIcon').innerHTML = getTokenIcon(Swap.fromToken.symbol);
  }
  if (Swap.toToken) {
    $('#toSymbol').textContent = Swap.toToken.symbol;
    $('#toIcon').innerHTML = getTokenIcon(Swap.toToken.symbol);
  }
}

// ─── Bridge ───
function initBridge() {
  $('#bridgeFromAmount').addEventListener('input', debounce(async () => {
    const val = $('#bridgeFromAmount').value;
    if (!val || val === '0') {
      $('#bridgeToAmount').value = '';
      $('#bridgeQuoteInfo').style.display = 'none';
      return;
    }
    
    const quote = await Bridge.getQuote(val);
    if (quote) {
      $('#bridgeToAmount').value = quote.toAmount;
      $('#bridgeQuoteInfo').style.display = 'block';
      $('#bridgeQuoteInfo').innerHTML = `Fee: ${quote.fee} USDC · ~${quote.estimatedTime}`;
    }
  }, 300));

  $('#bridgeSwapDirection').addEventListener('click', () => {
    // Swap bridge direction — toggle between Arc and external chain
  });

  $('#bridgeBtn').addEventListener('click', async () => {
    const amount = $('#bridgeFromAmount').value;
    if (!amount) return;
    Bridge.execute(amount);
  });
}

function updateBridgeUI() {
  if (Bridge.fromToken) {
    $('#bridgeFromSymbol').textContent = Bridge.fromToken.symbol;
    $('#bridgeFromIcon').innerHTML = getTokenIcon(Bridge.fromToken.symbol);
  }
  if (Bridge.toToken) {
    $('#bridgeToSymbol').textContent = Bridge.toToken.symbol;
    $('#bridgeToIcon').innerHTML = getTokenIcon(Bridge.toToken.symbol);
  }
}

// ─── Toast ───
function showToast(msg, type = 'info') {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Util ───
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
