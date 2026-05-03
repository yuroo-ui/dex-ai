/* ═══ dex-ai App JS ═══ */

const PLUGINS_META = {
  'dex-trading': { icon: '🔄', desc: 'Swap & routing integration — Router, SDK, MEV protection' },
  'dex-hooks':   { icon: '🪝', desc: 'Custom DEX hook development for advanced pool logic' },
  'dex-analytics': { icon: '📊', desc: 'On-chain analytics, price feeds, oracle integration' },
  'dex-defi':    { icon: '🏦', desc: 'Lending, liquidity, yield optimization, composability' },
  'dex-bridge':  { icon: '🌉', desc: 'Cross-chain bridge & swap via Li.Fi, Relay, and more' },
};

const CATEGORY_MAP = {
  'dex-trading': 'trading',
  'dex-hooks': 'trading',
  'dex-defi': 'defi',
  'dex-analytics': 'analytics',
  'dex-bridge': 'bridge',
};

let allPlugins = [];
let allSkills = [];
let activeFilter = 'all';

// ─── Fetch Data ───
async function loadData() {
  const [pluginsRes, skillsRes] = await Promise.all([
    fetch('/api/plugins'), fetch('/api/skills')
  ]);
  const pluginsData = await pluginsRes.json();
  const skillsData = await skillsRes.json();
  allPlugins = pluginsData.plugins || [];
  allSkills = skillsData.skills || [];
  renderStats();
  renderPlugins();
  renderSkills();
}

// ─── Stats ───
function renderStats() {
  document.getElementById('heroStats').innerHTML = `
    <div><div class="stat-val">${allPlugins.length}</div>Plugins</div>
    <div><div class="stat-val">${allSkills.length}</div>Skills</div>
    <div><div class="stat-val">30+</div>Chains</div>
  `;
}

// ─── Plugins ───
function renderPlugins(filter = 'all', search = '') {
  const grid = document.getElementById('pluginsGrid');
  let plugins = allPlugins;

  if (filter !== 'all') {
    plugins = plugins.filter(p => CATEGORY_MAP[p.name] === filter);
  }
  if (search) {
    const q = search.toLowerCase();
    plugins = plugins.filter(p =>
      p.name.includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  grid.innerHTML = plugins.map(p => {
    const meta = PLUGINS_META[p.name] || { icon: '📦', desc: '' };
    return `
      <div class="plugin-card" data-plugin="${p.name}">
        <div class="plugin-card-top">
          <div class="plugin-name">
            <span class="plugin-icon">${meta.icon}</span>
            ${p.name}
          </div>
          <span class="plugin-badge">${p.skill_count} skills</span>
        </div>
        <div class="plugin-desc">${meta.desc}</div>
        <div class="plugin-skills">
          ${p.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
        <div class="plugin-footer">
          <span class="plugin-install">/plugin install ${p.name}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Skills Table ───
function renderSkills(search = '') {
  const tbody = document.getElementById('skillsTable');
  let skills = allSkills;

  if (search) {
    const q = search.toLowerCase();
    skills = skills.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.plugin.includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  }

  document.getElementById('skillCount').textContent = `${skills.length} skills`;

  tbody.innerHTML = skills.map(s => `
    <tr>
      <td><span class="skill-name">${s.name}</span></td>
      <td><span class="plugin-tag">${s.plugin}</span></td>
      <td><span class="desc">${s.description || '—'}</span></td>
      <td><span class="install-cmd" onclick="copyInstall('${s.path}')" title="Click to copy">/install ${s.name}</span></td>
    </tr>
  `).join('');
}

// ─── Copy Install ───
function copyInstall(path) {
  const cmd = `agent-self skill install github:yuroo-ui/dex-ai/${path}`;
  navigator.clipboard.writeText(cmd).then(() => {
    showToast('Copied to clipboard!');
  });
}

function showToast(msg) {
  let toast = document.createElement('div');
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
    background: '#6366f1', color: 'white', padding: '10px 24px',
    borderRadius: '999px', fontSize: '14px', fontWeight: '600', zIndex: '999',
    animation: 'fadeIn 0.2s',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ─── Tabs ───
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    renderPlugins(activeFilter, document.getElementById('searchInput').value);
  });
});

// ─── Search ───
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');

searchInput.addEventListener('input', (e) => {
  const q = e.target.value;
  searchClear.style.display = q ? 'block' : 'none';
  renderPlugins(activeFilter, q);
  renderSkills(q);
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.style.display = 'none';
  renderPlugins(activeFilter);
  renderSkills();
});

// ─── Install Modal ───
const installBtn = document.getElementById('installBtn');
const installModal = document.getElementById('installModal');
const modalClose = document.getElementById('modalClose');

installBtn.addEventListener('click', () => { installModal.style.display = 'flex'; });
modalClose.addEventListener('click', () => { installModal.style.display = 'none'; });
installModal.addEventListener('click', (e) => {
  if (e.target === installModal) installModal.style.display = 'none';
});

// ─── Init ───
loadData();
