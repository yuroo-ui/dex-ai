// ═══ Inline Token Icons (SVG fallback) ═══

const TOKEN_ICONS = {
  ETH: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16 4v9.4l8 4.7-8 4.7V28l8-12.9-8-11.1z" fill="#fff" fill-opacity=".6"/><path d="M16 4v11.5L8 16 16 4z" fill="#fff"/></svg>`,
  WETH: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16 4v9.4l8 4.7-8 4.7V28l8-12.9-8-11.1z" fill="#fff" fill-opacity=".6"/><path d="M16 4v11.5L8 16 16 4z" fill="#fff"/></svg>`,
  USDC: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#2775CA"/><text x="16" y="21" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="Inter,sans-serif">$</text></svg>`,
  USDT: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#26A17B"/><text x="16" y="21" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="Inter,sans-serif">$</text></svg>`,
  DAI: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#F5AC37"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="Inter,sans-serif">DAI</text></svg>`,
  WBTC: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#F09242"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="Inter,sans-serif">₿</text></svg>`,
  BTC: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#F09242"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="Inter,sans-serif">₿</text></svg>`,
  BNB: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path d="M16 6l-6 6 3 3 3-3 3 3 3-3 3 3 3-3-6-6-3 3-3-3-3 3-3-3-3 3-3-3z" fill="#fff"/></svg>`,
  POL: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#8247E5"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="Inter,sans-serif">POL</text></svg>`,
  AVAX: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#E84142"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="Inter,sans-serif">AVAX</text></svg>`,
  cbBTC: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#0052FF"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="Inter,sans-serif">cbBTC</text></svg>`,
  ARC_USDC: `<svg viewBox="0 0 32 32" width="100%" height="100%"><defs><linearGradient id="arcTG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#arcTG)"/><text x="16" y="21" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="Inter,sans-serif">$</text></svg>`,
};

function getTokenIcon(symbol, chainId) {
  // Arc Network USDC gets special gradient icon
  if (symbol === 'USDC' && chainId === 5042002) return TOKEN_ICONS.ARC_USDC;
  return TOKEN_ICONS[symbol] || `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#333"/><text x="16" y="20" text-anchor="middle" fill="#888" font-size="10" font-weight="700">${(symbol||'?').slice(0,3)}</text></svg>`;
}

// Network icons
const NETWORK_ICONS = {
  'Ethereum': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#627EEA"/><path d="M16 4v9.4l8 4.7-8 4.7V28l8-12.9-8-11.1z" fill="#fff" fill-opacity=".6"/><path d="M16 4v11.5L8 16 16 4z" fill="#fff"/></svg>`,
  'Arbitrum': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#28A0F0"/><path d="M16 6l-4 8 4 2 4-2-4-8z" fill="#fff"/><path d="M12 16l4 2 4-2v6l-4 2-4-2v-6z" fill="#fff"/></svg>`,
  'Optimism': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#FF0420"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">OP</text></svg>`,
  'Base': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#0052FF"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>`,
  'Polygon': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#8247E5"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">POL</text></svg>`,
  'BSC': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#F3BA2F"/><path d="M16 6l-6 6 3 3 3-3 3 3 3-3 3 3 3-3-6-6-3 3-3-3-3 3-3-3-3 3-3-3z" fill="#fff"/></svg>`,
  'Avalanche': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#E84142"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">AVAX</text></svg>`,
  'zkSync Era': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#8C8DFC"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">ZK</text></svg>`,
  'Linea': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#121212"/><path d="M8 16h16M16 8v16" stroke="#fff" stroke-width="2"/></svg>`,
  'Scroll': `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#FFEDE0"/><text x="16" y="20" text-anchor="middle" fill="#F60" font-size="8" font-weight="700">SCR</text></svg>`,
  'Arc Testnet': `<svg viewBox="0 0 32 32" width="100%" height="100%"><defs><linearGradient id="arcG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#arcG)"/><path d="M10 22V10h4l4 6 4-6h4v12h-3v-8l-3.5 5h-3L13 14v8z" fill="#fff"/></svg>`,
};

function getNetworkIcon(name) {
  return NETWORK_ICONS[name] || `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#555"/><text x="16" y="20" text-anchor="middle" fill="#aaa" font-size="7">${(name||'?').slice(0,3)}</text></svg>`;
}

// Override token image rendering to use inline SVG (bypasses CORS/loading issues)
function renderTokenIcon(container, token) {
  if (!token) return;
  const svg = getTokenIcon(token.symbol);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  container.innerHTML = `<img src="${url}" alt="${token.symbol}" style="width:24px;height:24px;border-radius:50%">`;
}
