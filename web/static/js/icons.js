// ═══ Arc Network Icons (Inline SVG) ═══

const TOKEN_ICONS = {
  USDC: `<svg viewBox="0 0 32 32" width="100%" height="100%"><defs><linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#arcGrad)"/><text x="16" y="21" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="system-ui,sans-serif">U</text></svg>`,
};

function getTokenIcon(symbol) {
  return TOKEN_ICONS[symbol] || `<svg viewBox="0 0 32 32" width="100%" height="100%"><defs><linearGradient id="arcGradF" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#arcGradF)"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">${(symbol||'?').slice(0,3)}</text></svg>`;
}

function getNetworkIcon(name) {
  return `<svg viewBox="0 0 32 32" width="100%" height="100%"><defs><linearGradient id="arcNG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#arcNG)"/><path d="M11 22V10h3.5l4.5 6.5L23.5 10H27v12h-3V15l-4 6h-3l-4-6v7z" fill="#fff"/></svg>`;
}
