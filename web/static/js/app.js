// ═══ Arc DEX App — with Smart Contract Integration ═══

// ─── State ───
let currentPage = 'swap';
let routerContract = null;

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
          params: [{ chainId: '0x4CF7E2' }], // 5042002 hex
        });
      } catch (e) {
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
      
      // Init contracts
      routerContract = new ethers.Contract(CONTRACTS.router, ROUTER_ABI, this.signer);
      
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
    routerContract = null;
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
    if ($('#walletDrawer').querySelector('.drawer-content')) {
      $('#walletDrawer').querySelector('.drawer-content').style.display = 'none';
      $('#walletDrawer').querySelector('.drawer-empty').style.display = 'block';
    }
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
    
    // If router contract is available, get real quote
    if (routerContract && Swap.fromToken && Swap.toToken) {
      try {
        const amountIn = ethers.parseUnits(val, Swap.fromToken.decimals);
        const path = [Swap.fromToken.address, Swap.toToken.address];
        const amounts = await routerContract.getAmountsOut(amountIn, path);
        const outAmount = formatUnits(amounts[1], Swap.toToken.decimals);
        $('#toAmount').value = outAmount;
        $('#swapBtn').textContent = `Swap ${Swap.fromToken.symbol} → ${Swap.toToken.symbol}`;
        $('#swapBtn').disabled = !Wallet.address;
        return;
      } catch (err) {
        console.log('Quote error (no pair?):', err.message);
        // Fallback to 1:1 for same-token
      }
    }
    
    // Fallback: 1:1 for same token
    $('#toAmount').value = val;
    $('#swapBtn').textContent = `Swap ${Swap.fromToken.symbol} → ${Swap.toToken.symbol}`;
    $('#swapBtn').disabled = !Wallet.address;
  }, 300));

  $('#swapDirection').addEventListener('click', () => {
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
    if (!routerContract) {
      showToast('Contract not loaded. Reconnect wallet.', 'error');
      return;
    }
    
    const amount = $('#fromAmount').value;
    if (!amount) return;
    
    try {
      $('#swapBtn').textContent = 'Approving...';
      $('#swapBtn').disabled = true;
      
      const amountIn = ethers.parseUnits(amount, Swap.fromToken.decimals);
      const path = [Swap.fromToken.address, Swap.toToken.address];
      const deadline = Math.floor(Date.now() / 1000) + 300; // 5 min
      
      // For native USDC swap
      if (Swap.fromToken.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        $('#swapBtn').textContent = 'Swapping...';
        const tx = await routerContract.swapExactETHForTokens(
          0, // amountOutMin (no slippage protection for demo)
          path,
          Wallet.address,
          deadline,
          { value: amountIn }
        );
        $('#swapBtn').textContent = 'Confirming...';
        await tx.wait();
        showToast(`Swapped! Tx: ${tx.hash.slice(0, 10)}...`, 'success');
      } else {
        // ERC20 token swap
        const tokenContract = new ethers.Contract(Swap.fromToken.address, ERC20_ABI, Wallet.signer);
        const allowance = await tokenContract.allowance(Wallet.address, CONTRACTS.router);
        
        if (allowance < amountIn) {
          $('#swapBtn').textContent = 'Approving...';
          const approveTx = await tokenContract.approve(CONTRACTS.router, ethers.MaxUint256);
          await approveTx.wait();
        }
        
        $('#swapBtn').textContent = 'Swapping...';
        const tx = await routerContract.swapExactTokensForTokens(
          amountIn,
          0, // amountOutMin
          path,
          Wallet.address,
          deadline
        );
        $('#swapBtn').textContent = 'Confirming...';
        await tx.wait();
        showToast(`Swapped! Tx: ${tx.hash.slice(0, 10)}...`, 'success');
      }
      
      getBalances();
      $('#swapBtn').textContent = `Swap ${Swap.fromToken.symbol} → ${Swap.toToken.symbol}`;
      $('#swapBtn').disabled = false;
    } catch (err) {
      console.error('Swap error:', err);
      $('#swapBtn').textContent = 'Swap Failed';
      showToast(err.reason || err.message, 'error');
      $('#swapBtn').disabled = false;
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
    
    const fee = parseFloat(val) * 0.001;
    const toAmount = (parseFloat(val) - fee).toFixed(6);
    $('#bridgeToAmount').value = toAmount;
    $('#bridgeQuoteInfo').style.display = 'block';
    $('#bridgeQuoteInfo').innerHTML = `Fee: ${fee.toFixed(6)} USDC · ~2-5 min · Arc Native Bridge`;
  }, 300));

  $('#bridgeSwapDirection').addEventListener('click', () => {
    // Toggle bridge direction
  });

  $('#bridgeBtn').addEventListener('click', () => {
    const amount = $('#bridgeFromAmount').value;
    if (!amount) {
      showToast('Enter amount first', 'error');
      return;
    }
    // Redirect to Arc Bridge
    window.open(`https://bridge.arc.network`, '_blank');
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
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ─── Util ───
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
