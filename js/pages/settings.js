function renderSettingsModal() {
  const lang = getLang();
  return `
    <div class="modal-overlay active" id="settings-overlay">
      <div class="modal">
        <h3>⚙️ ${t('settings.title')}</h3>

        <div class="form-group">
          <label>${t('settings.language')}</label>
          <div style="display:flex;gap:8px">
            <button class="btn ${lang === 'id' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              style="flex:1" onclick="applyLang('id')">🇮🇩 Indonesia</button>
            <button class="btn ${lang === 'en' ? 'btn-primary' : 'btn-secondary'} btn-sm"
              style="flex:1" onclick="applyLang('en')">🇬🇧 English</button>
          </div>
        </div>

        <hr style="border:none;border-top:1px solid var(--border);margin:14px 0">

        <h4 style="font-size:0.85rem;color:var(--secondary);margin-bottom:10px">🔑 ${t('settings.changePassword')}</h4>
        <div class="form-group">
          <label for="settings-oldpass">${t('settings.oldPassword')}</label>
          <input type="password" id="settings-oldpass" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label for="settings-newpass">${t('settings.newPassword')}</label>
          <input type="password" id="settings-newpass" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label for="settings-confirmpass">${t('settings.confirmPassword')}</label>
          <input type="password" id="settings-confirmpass" placeholder="••••••••">
        </div>
        <button class="btn btn-accent btn-sm w-full" onclick="changePasswordAction()">${t('settings.savePassword')}</button>

        <hr style="border:none;border-top:1px solid var(--border);margin:14px 0">

        <button class="btn btn-danger w-full" onclick="resetMasterDataAction()">🔄 Reset Item, Merk & Satuan</button>
        <p style="font-size:0.6rem;color:var(--text-muted);margin-top:4px">Menghapus semua item, merk, dan satuan. Resep & penjualan tetap aman.</p>

        <hr style="border:none;border-top:1px solid var(--border);margin:14px 0">

        <button class="btn btn-danger w-full" onclick="logoutAction()">🚪 ${t('settings.logout')}</button>

        <div style="text-align:center;margin-top:14px">
          <button class="btn btn-secondary btn-sm" onclick="closeSettings()">✕ Tutup</button>
        </div>
      </div>
    </div>
  `;
}

function openSettings() {
  const existing = document.getElementById('settings-overlay');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'settings-wrapper';
  div.innerHTML = renderSettingsModal();
  document.body.appendChild(div);
}

function closeSettings() {
  const el = document.getElementById('settings-overlay');
  if (el) el.remove();
  const w = document.getElementById('settings-wrapper');
  if (w) w.remove();
}

function applyLang(lang) {
  setLang(lang);
  closeSettings();

  document.querySelectorAll('.app-header h1').forEach(el => el.textContent = t('app.name'));
  document.querySelectorAll('.bottom-nav a').forEach(a => {
    const page = a.dataset.page;
    const labels = { dashboard: t('nav.dashboard'), sales: t('nav.sales'), rnd: t('nav.rnd'), cost: t('nav.cost') };
    const labelSpan = a.querySelector('.nav-label');
    if (labelSpan) labelSpan.textContent = labels[page] || page;
  });

  currentPage = null;
  handleRoute();
}

async function changePasswordAction() {
  const auth = JSON.parse(sessionStorage.getItem('nuansa_auth') || '{}');
  const username = auth.username;
  if (!username) return;

  const oldPass = document.getElementById('settings-oldpass')?.value;
  const newPass = document.getElementById('settings-newpass')?.value;
  const confirmPass = document.getElementById('settings-confirmpass')?.value;

  if (!oldPass || !newPass || !confirmPass) {
    showToast(t('settings.fillAll'));
    return;
  }

  if (newPass !== confirmPass) {
    showToast(t('settings.passwordMismatch'));
    return;
  }

  try {
    const ok = await changePassword(username, oldPass, newPass);
    if (ok) {
      showToast(t('settings.passwordChanged'));
      document.getElementById('settings-oldpass').value = '';
      document.getElementById('settings-newpass').value = '';
      document.getElementById('settings-confirmpass').value = '';
    } else {
      showToast(t('settings.wrongPassword'));
    }
  } catch (e) {
    showToast(t('settings.error'));
  }
}

function updateFavicon() {
  var fav = document.querySelector('link[rel="icon"]');
  if (fav) fav.href = 'assets/icons/logo.png';
  var ati = document.querySelector('link[rel="apple-touch-icon"]');
  if (ati) ati.href = 'assets/icons/icon-192.png';
}

function updateHeaderLogo() {
  var el = document.getElementById('header-logo');
  if (!el || el.tagName === 'IMG') return;
  el.outerHTML = '<img class="header-icon" id="header-logo" src="assets/icons/logo.png" alt="Nuansa Kopi" style="object-fit:contain">';
}

async function resetMasterDataAction() {
  const ok = await confirmModal('Reset semua item, merk, dan satuan?\nData resep & penjualan aman.');
  if (!ok) return;
  try {
    await resetMasterData();
    closeSettings();
    location.reload();
  } catch (e) {
    showToast('Gagal reset data');
  }
}

function logoutAction() {
  sessionStorage.removeItem('nuansa_auth');
  closeSettings();
  document.getElementById('app-content').innerHTML = '';
  showLoginScreen();
}
