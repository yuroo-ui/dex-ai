/* ═══ dex-ai App JS ═══ */

const PLUGINS_META = {
  'dex-trading':  { icon: '🔄', desc: 'Swap & routing integration — Router, SDK, MEV protection', cat: 'trading' },
  'dex-hooks':    { icon: '🪝', desc: 'Custom DEX hook development for advanced pool logic', cat: 'trading' },
  'dex-analytics':{ icon: '📊', desc: 'On-chain analytics, price feeds, oracle integration', cat: 'analytics' },
  'dex-defi':     { icon: '🏦', desc: 'Lending, liquidity, yield optimization, composability', cat: 'defi' },
  'dex-bridge':   { icon: '🌉', desc: 'Cross-chain bridge & swap via Li.Fi, Relay, and more', cat: 'bridge' },
};

let allPlugins = [];
let allSkills = [];
let activeFilter = 'all';

// ─── Fetch Data ───
async function loadData() {
  const [pRes, sRes] = await Promise.all([fetch('/api/plugins'), fetch('/api/skills')]);
  const pData = await pRes.json();
  const sData = await sRes.json();
  allPlugins = pData.plugins || [];
  allSkills = sData.skills || [];
  renderStats();
  renderPlugins();
  renderSkills();
  updateSwapSelects();
}

// ─── Stats ───
function renderStats() {
  document.getElementById('statsBar').innerHTML = `
    <div class="stat-item"><div class="stat-val">${allPlugins.length}</div><div class="stat-label">Plugins</div></div>
    <div class="stat-item"><div class="stat-val">${allSkills.length}</div><div class="stat-label">Skills</div></div>
    <div class="stat-item"><div class="stat-val">30+</div><div class="stat-label">Chains</div></div>
    <div class="stat-item"><div class="stat-val">4</div><div class="stat-label">Bridges</div></div>
  `;
}

// ─── Plugins ───
function renderPlugins(filter = 'all', search = '') {
  const grid = document.getElementById('pluginsGrid');
  let plugins = allPlugins;

  if (filter !== 'all') {
    plugins = plugins.filter(p => PLUGINS_META[p.name]?.cat === filter);
  }
  if (search) {
    const q = search.toLowerCase();
    plugins = plugins.filter(p =>
      p.name.includes(q) || p.skills.some(s => s.toLowerCase().includes(q))
    );
  }

  grid.innerHTML = plugins.map(p => {
    const meta = PLUGINS_META[p.name] || { icon: '📦', desc: '' };
    return `
      <div class="plugin-card">
        <div class="plugin-card-top">
          <div class="plugin-name">
            <span class="plugin-icon">${meta.icon}</span>
            ${p.name}
          </div>
          <span class="plugin-badge">${p.skill_count} skills</span>
        </div>
        <div class="plugin-desc">${meta.desc}</div>
        <div class="plugin-skills">
          ${p.skills.map(s => `<span class="skill-tag" data-skill="${s}">${s}</span>`).join('')}
        </div>
        <div class="plugin-footer">
          <span class="plugin-install" data-cmd="/plugin install ${p.name}">/plugin install ${p.name}</span>
        </div>
      </div>
    `;
  }).join('');

  // Click handlers for skill tags
  grid.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.getElementById('toSkill').value = tag.dataset.skill;
      updateCommand();
      document.getElementById('swapInstallBtn').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Click handlers for install commands
  grid.querySelectorAll('.plugin-install').forEach(el => {
    el.addEventListener('click', () => copyToClipboard(el.dataset.cmd, 'Copied!'));
  });
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

  document.getElementById('skillCount').textContent = skills.length;

  tbody.innerHTML = skills.map(s => `
    <tr>
      <td><span class="skill-name">${s.name}</span></td>
      <td><span class="plugin-tag">${s.plugin}</span></td>
      <td><span class="desc">${s.description || '—'}</span></td>
      <td><span class="install-cmd" data-path="${s.path}">/install ${s.name}</span></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.install-cmd').forEach(el => {
    el.addEventListener('click', () => {
      const cmd = `agent-self skill install github:yuroo-ui/dex-ai/${el.dataset.path}`;
      copyToClipboard(cmd, 'Copied!');
    });
  });
}

// ─── Swap Card Logic ───
const PLUGIN_SKILLS = {};
function updateSwapSelects() {
  const fromEl = document.getElementById('fromPlugin');
  const toEl = document.getElementById('toSkill');

  allPlugins.forEach(p => {
    PLUGIN_SKILLS[p.name] = p.skills;
  });

  fromEl.addEventListener('change', () => {
    const plugin = fromEl.value;
    const skills = PLUGIN_SKILLS[plugin] || [];
    toEl.innerHTML = skills.map(s => `<option value="${s}">${s}</option>`).join('');
    updateCommand();
  });

  toEl.addEventListener('change', updateCommand);
  updateCommand();
}

function updateCommand() {
  const plugin = document.getElementById('fromPlugin')?.value || 'dex-trading';
  const skill = document.getElementById('toSkill')?.value || '';
  const cmd = skill
    ? `agent-self skill install github:yuroo-ui/dex-ai/packages/plugins/${plugin}/skills/${skill}/SKILL.md`
    : `npx skills add yuroo-ui/dex-ai`;
  document.getElementById('commandText').textContent = cmd;
}

// Swap Install Button
document.getElementById('swapInstallBtn')?.addEventListener('click', () => {
  const cmd = document.getElementById('commandText').textContent;
  copyToClipboard(cmd, 'Command copied!');
});

// ─── Copy ───
function copyToClipboard(text, msg = 'Copied!') {
  navigator.clipboard.writeText(text).then(() => showToast(msg));
}

document.getElementById('copyBtn')?.addEventListener('click', () => {
  copyToClipboard(document.getElementById('commandText').textContent);
});

// ─── Toast ───
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ─── Tabs ───
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    renderPlugins(activeFilter, document.getElementById('skillSearch')?.value || '');
  });
});

// ─── Search ───
document.getElementById('skillSearch')?.addEventListener('input', (e) => {
  renderSkills(e.target.value);
});

// ─── Install Modal ───
const installModal = document.getElementById('installModal');
document.getElementById('installBtn')?.addEventListener('click', () => {
  installModal.style.display = 'flex';
});
document.getElementById('modalClose')?.addEventListener('click', () => {
  installModal.style.display = 'none';
});
installModal?.addEventListener('click', (e) => {
  if (e.target === installModal) installModal.style.display = 'none';
});

// ─── Init ───
loadData();
