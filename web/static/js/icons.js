// ═══ Arc Network Icons (Inline SVG) ═══

const TOKEN_ICONS = {
  USDC: `<svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="16" fill="#2775CA"/><path d="M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.234-2.194-.703-2.194-1.526 0-.822.61-1.347 1.83-1.347 1.097 0 1.707.374 2.011 1.29a.424.424 0 00.397.28h.91a.39.39 0 00.394-.394v-.047a3.044 3.044 0 00-2.73-2.5V9.5a.42.42 0 00-.42-.42h-.86a.42.42 0 00-.42.42v.914c-1.656.234-2.707 1.3-2.707 2.71 0 2.03 1.234 2.8 3.796 3.104 1.69.257 2.237.655 2.237 1.572 0 .916-.81 1.546-1.92 1.546-1.5 0-2.01-.633-2.175-1.573-.07-.374-.304-.56-.608-.56h-.936a.39.39 0 00-.397.397v.047c.234 1.666 1.29 2.777 3.04 3.057v.935a.42.42 0 00.42.42h.86a.42.42 0 00.42-.42v-.914c1.657-.257 2.777-1.393 2.777-2.87z" fill="#fff"/></svg>`,
};

function getTokenIcon(symbol) {
  return TOKEN_ICONS[symbol] || `<svg viewBox="0 0 32 32" width="100%" height="100%"><defs><linearGradient id="arcGradF" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#arcGradF)"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">${(symbol||'?').slice(0,3)}</text></svg>`;
}

function getNetworkIcon(name) {
  return `<svg viewBox="0 0 40 40" width="100%" height="100%" fill="none"><rect width="40" height="40" rx="8" fill="#0B1628"/><path d="M20 8 L32 32 H26 L20 20 L14 32 H8 L20 8Z" fill="white"/><line x1="12.5" y1="27" x2="27.5" y2="27" stroke="#0B1628" stroke-width="3.5"/></svg>`;
}
