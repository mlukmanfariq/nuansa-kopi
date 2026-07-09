function renderLogin() {
  return `
    <div class="login-page">
      <div class="login-card">
        <div id="login-icon-wrap">${renderLogo('login-icon', 'Nuansa Kopi')}</div>
        <h1 class="login-brand">${t('app.name')}</h1>
        <p class="login-welcome">${t('login.welcome')} Nuansa Kopi</p>
        <form id="login-form" onsubmit="return false">
          <div class="form-group">
            <label for="login-username">${t('login.username')}</label>
            <input type="text" id="login-username" placeholder="admin" autocomplete="username" autofocus>
          </div>
          <div class="form-group">
            <label for="login-password">${t('login.password')}</label>
            <input type="password" id="login-password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <div id="login-error" class="login-error" style="display:none"></div>
          <button type="submit" class="btn btn-primary w-full" id="login-btn">${t('login.btn')}</button>
        </form>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:center">
          <button class="btn ${getLang() === 'id' ? 'btn-primary' : 'btn-secondary'} btn-sm"
            onclick="loginSetLang('id')" style="font-size:0.8rem">🇮🇩 Indonesia</button>
          <button class="btn ${getLang() === 'en' ? 'btn-primary' : 'btn-secondary'} btn-sm"
            onclick="loginSetLang('en')" style="font-size:0.8rem">🇬🇧 English</button>
        </div>
      </div>
    </div>
  `;
}

function loginSetLang(lang) {
  setLang(lang);
  document.getElementById('app-content').innerHTML = renderLogin();
  initLogin();
}

function initLogin() {
  const form = document.getElementById('login-form');
  const username = document.getElementById('login-username');
  const password = document.getElementById('login-password');
  const error = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  username?.focus();

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = username?.value.trim();
    const p = password?.value;
    if (!u || !p) {
      error.textContent = t('login.invalid');
      error.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = '...';

    try {
      const user = await authenticateUser(u, p);
      if (user) {
        sessionStorage.setItem('nuansa_auth', JSON.stringify({ username: u }));
        showApp();
      } else {
        error.textContent = t('login.invalid');
        error.style.display = 'block';
        btn.disabled = false;
        btn.textContent = t('login.btn');
        password.value = '';
        password.focus();
      }
    } catch (e) {
      error.textContent = t('login.invalid');
      error.style.display = 'block';
      btn.disabled = false;
      btn.textContent = t('login.btn');
    }
  });
}
