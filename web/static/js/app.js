// ═══ MAIN APP ═══

// ─── State ───
let currentPage = 'swap';
let currentModal = null; // 'fromToken' | 'toToken' | 'bridgeFromToken' | 'bridgeToToken' | 'network' | 'settings'
let modalNetworkTarget = null;

// ─── DOM Refs ───
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  Wallet.initListeners();
  initNav();
  initSwap();
  initBridge();
  initModals();
  initSettings();
  // Set default tokens
  loadDefaultTokens();
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

  // Connect button
  $('#connectBtn').addEventListener('click', async () => {
    if (Wallet.address) {
      openWalletDrawer();
    } else {
      await Wallet.connect();
    }
  });

  // Wallet drawer
  $('#walletDrawerClose').addEventListener('click', closeWalletDrawer);
  $('#walletDrawer').addEventListener('click', (e) => {
    if (e.target === $('#walletDrawer')) closeWalletDrawer();
  });
  $('#disconnectBtn').addEventListener('click', () => {
    Wallet.disconnect();
    closeWalletDrawer();
  });
}

function openWalletDrawer() {
  const d = $('#walletDrawer');
  d.style.display = 'flex';
  $('#walletAddress').textContent = Wallet.address;
  $('#walletBalance').textContent = parseFloat(Wallet.balance).toFixed(4) + ' ETH';
  const net = NETWORKS[Wallet.chainId];
  $('#walletNetwork').textContent = net ? net.name : `Chain ${Wallet.chainId}`;
}
function closeWalletDrawer() { $('#walletDrawer').style.display = 'none'; }

// ─── Swap ───
function initSwap() {
  // Amount input
  $('#fromAmount').addEventListener('input', debounce(async () => {
    const val = $('#fromAmount').value;
    if (!val || val === '0') {
      $('#toAmount').value = '';
      $('#quoteInfo').style.display = 'none';
      updateSwapBtn();
      return;
    }
    const quote = await Swap.getQuote(val);
    if (quote) {
      const formatted = formatAmount(quote.toAmount, Swap.toToken.decimals);
      const display = parseFloat(formatted).toFixed(6);
      $('#toAmount').value = display;
      $('#quoteInfo').style.display = 'block';
      $('#quoteRate').textContent = `1 ${Swap.fromToken.symbol} = ${(parseFloat(display) / parseFloat(val)).toFixed(6)} ${Swap.toToken.symbol}`;
      $('#quoteRoute').textContent = quote.route;
      $('#quoteSlippage').textContent = Swap.slippage + '%';
    } else {
      $('#toAmount').value = '—';
      $('#quoteInfo').style.display = 'none';
    }
    updateSwapBtn();
  }, 400));

  // Swap direction
  $('#swapDirectionBtn').addEventListener('click', () => {
    [Swap.fromToken, Swap.toToken] = [Swap.toToken, Swap.fromToken];
    [Swap.fromChain, Swap.toChain] = [Swap.toChain, Swap.fromChain];
    updateTokenUI('from');
    updateTokenUI('to');
    // Re-trigger quote
    $('#fromAmount').dispatchEvent(new Event('input'));
  });

  // Token select
  $('#fromTokenBtn').addEventListener('click', () => openTokenModal('fromToken'));
  $('#toTokenBtn').addEventListener('click', () => openTokenModal('toToken'));

  // Swap button
  $('#swapBtn').addEventListener('click', async () => {
    if (!Wallet.address) {
      await Wallet.connect();
      if (!Wallet.address) return;
    }
    if (!Swap.fromToken || !Swap.toToken || !$('#fromAmount').value) return;
    const btn = $('#swapBtn');
    btn.textContent = 'Confirming...';
    btn.classList.add('loading');
    await Swap.execute();
    btn.textContent = 'Swap';
    btn.classList.remove('loading');
  });

  // Network selector
  $('#networkBtn').addEventListener('click', () => openNetworkModal('swap'));
}

function loadDefaultTokens() {
  const tokens = getTokensForChain(1);
  Swap.fromToken = tokens[0]; // ETH
  Swap.toToken = tokens[1];  // USDC
  updateTokenUI('from');
  updateTokenUI('to');
  // Bridge defaults
  const arbTokens = getTokensForChain(42161);
  Bridge.fromToken = tokens[1]; // USDC on ETH
  Bridge.toToken = arbTokens[1]; // USDC on ARB
  updateBridgeTokenUI('from');
  updateBridgeTokenUI('to');
  // Set balance display
  updateBalances();
}

function updateTokenUI(side) {
  const token = side === 'from' ? Swap.fromToken : Swap.toToken;
  if (!token) return;
  $(side === 'from' ? '#fromTokenSymbol' : '#toTokenSymbol').textContent = token.symbol;
  const icon = $(side === 'from' ? '#fromTokenIcon' : '#toTokenIcon');
  if (token.icon) { icon.src = token.icon; icon.style.display = 'block'; }
}

function updateSwapBtn() {
  const btn = $('#swapBtn');
  if (!Wallet.address) { btn.textContent = 'Connect Wallet'; btn.disabled = false; return; }
  if (!Swap.fromToken || !Swap.toToken) { btn.textContent = 'Select Token'; btn.disabled = true; return; }
  if (!$('#fromAmount').value) { btn.textContent = 'Enter Amount'; btn.disabled = true; return; }
  btn.textContent = `Swap ${Swap.fromToken.symbol} → ${Swap.toToken.symbol}`;
  btn.disabled = false;
}

// ─── Bridge ───
function initBridge() {
  $('#bridgeFromAmount').addEventListener('input', debounce(async () => {
    const val = $('#bridgeFromAmount').value;
    if (!val || val === '0') {
      $('#bridgeToAmount').value = '';
      $('#bridgeQuoteInfo').style.display = 'none';
      updateBridgeBtn();
      return;
    }
    const quote = await Bridge.getQuote(val);
    if (quote) {
      const formatted = formatAmount(quote.toAmount, Bridge.toToken.decimals);
      $('#bridgeToAmount').value = parseFloat(formatted).toFixed(6);
      $('#bridgeQuoteInfo').style.display = 'block';
      $('#bridgeQuoteProvider').textContent = quote.provider;
      $('#bridgeQuoteTime').textContent = `~${Math.round(quote.estimateTime / 60)} min`;
      $('#bridgeQuoteFee').textContent = quote.fee;
    } else {
      $('#bridgeToAmount').value = '—';
      $('#bridgeQuoteInfo').style.display = 'none';
    }
    updateBridgeBtn();
  }, 400));

  // Provider toggle
  $$('.provider-badge').forEach((badge) => {
    badge.addEventListener('click', () => {
      $$('.provider-badge').forEach((b) => b.classList.remove('active'));
      badge.classList.add('active');
      Bridge.provider = badge.dataset.provider;
      $('#bridgeFromAmount').dispatchEvent(new Event('input'));
    });
  });

  // Swap direction
  $('#bridgeSwapDirBtn').addEventListener('click', () => {
    [Bridge.fromChain, Bridge.toChain] = [Bridge.toChain, Bridge.fromChain];
    [Bridge.fromToken, Bridge.toToken] = [Bridge.toToken, Bridge.fromToken];
    $('#bridgeFromName').textContent = NETWORKS[Bridge.fromChain]?.name || 'Unknown';
    $('#bridgeToName').textContent = NETWORKS[Bridge.toChain]?.name || 'Unknown';
    updateBridgeTokenUI('from');
    updateBridgeTokenUI('to');
    $('#bridgeFromAmount').dispatchEvent(new Event('input'));
  });

  // Token select
  $('#bridgeFromTokenBtn').addEventListener('click', () => openTokenModal('bridgeFromToken'));
  $('#bridgeToTokenBtn').addEventListener('click', () => openTokenModal('bridgeToToken'));

  // Network select
  $('#bridgeFromNetworkBtn').addEventListener('click', () => openNetworkModal('bridgeFrom'));
  $('#bridgeToNetworkBtn').addEventListener('click', () => openNetworkModal('bridgeTo'));

  // Bridge button
  $('#bridgeBtn').addEventListener('click', async () => {
    if (!Wallet.address) {
      await Wallet.connect();
      if (!Wallet.address) return;
    }
    if (!Bridge.fromToken || !Bridge.toToken || !$('#bridgeFromAmount').value) return;
    const btn = $('#bridgeBtn');
    btn.textContent = 'Bridging...';
    btn.classList.add('loading');
    await Bridge.execute();
    btn.textContent = 'Bridge';
    btn.classList.remove('loading');
  });
}

function updateBridgeTokenUI(side) {
  const token = side === 'from' ? Bridge.fromToken : Bridge.toToken;
  if (!token) return;
  const prefix = side === 'from' ? 'bridgeFrom' : 'bridgeTo';
  $(`#${prefix}TokenSymbol`).textContent = token.symbol;
  const icon = $(`#${prefix}TokenIcon`);
  if (token.icon) { icon.src = token.icon; icon.style.display = 'block'; }
}

function updateBridgeBtn() {
  const btn = $('#bridgeBtn');
  if (!Wallet.address) { btn.textContent = 'Connect Wallet'; btn.disabled = false; return; }
  if (!Bridge.fromToken || !Bridge.toToken) { btn.textContent = 'Select Token'; btn.disabled = true; return; }
  if (!$('#bridgeFromAmount').value) { btn.textContent = 'Enter Amount'; btn.disabled = true; return; }
  btn.textContent = `Bridge ${Bridge.fromToken.symbol} (${NETWORKS[Bridge.fromChain]?.short}) → ${Bridge.toToken.symbol} (${NETWORKS[Bridge.toChain]?.short})`;
  btn.disabled = false;
}

// ─── Token Modal ───
function initModals() {
  $('#tokenModalClose').addEventListener('click', closeTokenModal);
  $('#tokenModal').addEventListener('click', (e) => {
    if (e.target === $('#tokenModal')) closeTokenModal();
  });
  $('#networkModalClose').addEventListener('click', closeNetworkModal);
  $('#networkModal').addEventListener('click', (e) => {
    if (e.target === $('#networkModal')) closeNetworkModal();
  });
  $('#tokenSearch').addEventListener('input', filterTokens);
  $('#netSearch').addEventListener('input', filterNetworks);
}

function openTokenModal(target) {
  currentModal = target;
  const chainId = target === 'fromToken' ? Swap.fromChain : (target === 'toToken' ? Swap.toChain : (target === 'bridgeFromToken' ? Bridge.fromChain : Bridge.toChain));
  const tokens = getTokensForChain(chainId);
  renderTokenList(tokens);
  $('#tokenModal').style.display = 'flex';
  $('#tokenSearch').value = '';
  $('#tokenSearch').focus();
}

function closeTokenModal() { $('#tokenModal').style.display = 'none'; }

function renderTokenList(tokens) {
  const list = $('#tokenList');
  list.innerHTML = tokens.map((t) => `
    <div class="token-item" data-address="${t.address}">
      <img src="${t.icon}" alt="${t.symbol}" onerror="this.style.display='none'">
      <div class="token-item-info">
        <div class="token-item-name">${t.symbol}</div>
        <div class="token-item-chain">${t.name}</div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.token-item').forEach((item) => {
    item.addEventListener('click', () => {
      const addr = item.dataset.address;
      const token = tokens.find((t) => t.address === addr);
      if (!token) return;

      if (currentModal === 'fromToken') { Swap.fromToken = token; updateTokenUI('from'); }
      else if (currentModal === 'toToken') { Swap.toToken = token; updateTokenUI('to'); }
      else if (currentModal === 'bridgeFromToken') { Bridge.fromToken = token; updateBridgeTokenUI('from'); }
      else if (currentModal === 'bridgeToToken') { Bridge.toToken = token; updateBridgeTokenUI('to'); }

      closeTokenModal();
      // Re-trigger quote
      const amountInput = (currentModal.includes('bridge')) ? $('#bridgeFromAmount') : $('#fromAmount');
      amountInput.dispatchEvent(new Event('input'));
    });
  });
}

function filterTokens() {
  const q = $('#tokenSearch').value.toLowerCase();
  const items = $('#tokenList').querySelectorAll('.token-item');
  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

// ─── Network Modal ───
function openNetworkModal(target) {
  modalNetworkTarget = target;
  const nets = Object.values(NETWORKS);
  renderNetworkGrid(nets);
  $('#networkModal').style.display = 'flex';
  $('#netSearch').value = '';
}

function closeNetworkModal() { $('#networkModal').style.display = 'none'; }

function renderNetworkGrid(nets) {
  const grid = $('#networkGrid');
  grid.innerHTML = nets.map((n) => `
    <div class="network-item" data-id="${n.id}">
      <img src="${n.icon}" alt="${n.name}" onerror="this.style.display='none'">
      <span>${n.name}</span>
    </div>
  `).join('');

  grid.querySelectorAll('.network-item').forEach((item) => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const net = NETWORKS[id];
      if (!net) return;

      if (modalNetworkTarget === 'swap') {
        Swap.fromChain = id;
        Swap.toChain = id;
        $('#networkName').textContent = net.name;
        $('#networkIcon').src = net.icon;
        // Reset tokens for new chain
        const tokens = getTokensForChain(id);
        Swap.fromToken = tokens[0];
        Swap.toToken = tokens[1];
        updateTokenUI('from');
        updateTokenUI('to');
      } else if (modalNetworkTarget === 'bridgeFrom') {
        Bridge.fromChain = id;
        $('#bridgeFromName').textContent = net.name;
        $('#bridgeFromIcon').src = net.icon;
        const tokens = getTokensForChain(id);
        Bridge.fromToken = tokens[0];
        updateBridgeTokenUI('from');
      } else if (modalNetworkTarget === 'bridgeTo') {
        Bridge.toChain = id;
        $('#bridgeToName').textContent = net.name;
        $('#bridgeToIcon').src = net.icon;
        const tokens = getTokensForChain(id);
        Bridge.toToken = tokens[0];
        updateBridgeTokenUI('to');
      }

      closeNetworkModal();
      // Re-trigger quote
      const amountInput = modalNetworkTarget === 'swap' ? $('#fromAmount') : $('#bridgeFromAmount');
      amountInput.dispatchEvent(new Event('input'));
    });
  });
}

function filterNetworks() {
  const q = $('#netSearch').value.toLowerCase();
  const items = $('#networkGrid').querySelectorAll('.network-item');
  items.forEach((item) => {
    item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ─── Settings ───
function initSettings() {
  $('#swapSettingsBtn').addEventListener('click', () => {
    $('#settingsModal').style.display = 'flex';
  });
  $('#settingsModalClose').addEventListener('click', () => {
    $('#settingsModal').style.display = 'none';
  });
  $('#settingsModal').addEventListener('click', (e) => {
    if (e.target === $('#settingsModal')) $('#settingsModal').style.display = 'none';
  });
  $$('.slippage-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.slippage-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      Swap.slippage = parseFloat(btn.dataset.val);
      $('#customSlippage').value = '';
    });
  });
  $('#customSlippage').addEventListener('input', () => {
    const val = parseFloat($('#customSlippage').value);
    if (val > 0 && val <= 50) {
      $$('.slippage-btn').forEach((b) => b.classList.remove('active'));
      Swap.slippage = val;
    }
  });
}

// ─── Balance Updates ───
async function updateBalances() {
  if (!Wallet.address) return;
  await Wallet.updateBalance();

  // For swap from token
  if (Swap.fromToken) {
    if (Swap.fromToken.symbol === NETWORKS[Swap.fromChain]?.native.symbol) {
      $('#fromBalance').textContent = parseFloat(Wallet.balance).toFixed(4);
    } else {
      // ERC20 balance via contract call
      try {
        const erc20 = new ethers.Contract(Swap.fromToken.address, ['function balanceOf(address) view returns (uint256)'], Wallet.provider);
        const bal = await erc20.balanceOf(Wallet.address);
        $('#fromBalance').textContent = formatAmount(bal, Swap.fromToken.decimals);
      } catch { $('#fromBalance').textContent = '—'; }
    }
  }

  // For bridge from token
  if (Bridge.fromToken) {
    if (Bridge.fromToken.symbol === NETWORKS[Bridge.fromChain]?.native.symbol) {
      $('#bridgeFromBalance').textContent = parseFloat(Wallet.balance).toFixed(4);
    } else {
      try {
        const erc20 = new ethers.Contract(Bridge.fromToken.address, ['function balanceOf(address) view returns (uint256)'], Wallet.provider);
        const bal = await erc20.balanceOf(Wallet.address);
        $('#bridgeFromBalance').textContent = formatAmount(bal, Bridge.fromToken.decimals);
      } catch { $('#bridgeFromBalance').textContent = '—'; }
    }
  }
}

function updateNetworkUI() {
  if (Wallet.chainId) {
    const net = NETWORKS[Wallet.chainId];
    if (net) {
      $('#networkName').textContent = net.name;
      $('#networkIcon').src = net.icon;
    }
  }
}

// ─── Toast ───
function showToast(msg, type = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── Utilities ───
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
