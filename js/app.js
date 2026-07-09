const pages = {
  dashboard: { title: 'Beranda', icon: '📈', render: renderDashboard, init: initDashboard },
  sales: { title: 'Penjualan', icon: '💰', render: renderSales, init: initSales },
  rnd: { title: 'Riset', icon: '🧪', render: renderRND, init: initRND },
  cost: { title: 'Biaya', icon: '📊', render: renderCost, init: initCost },
};

let currentPage = null;
let chartsInstances = [];

function registerChart(chart) {
  chartsInstances.push(chart);
}

function destroyCharts() {
  chartsInstances.forEach(c => { try { c.destroy(); } catch(e) {} });
  chartsInstances = [];
}

function isAuthenticated() {
  try {
    return !!sessionStorage.getItem('nuansa_auth');
  } catch (e) { return false; }
}

function showApp() {
  document.body.classList.remove('login-mode');

  const content = document.getElementById('app-content');
  content.innerHTML = '';

  document.querySelectorAll('.app-header h1').forEach(el => el.textContent = t('app.name'));
  try { updateHeaderLogo(); } catch(e) { console.warn('Logo error:', e); }

  document.querySelectorAll('.bottom-nav a').forEach(a => {
    const page = a.dataset.page;
    const labels = {
      dashboard: t('nav.dashboard'),
      sales: t('nav.sales'),
      rnd: t('nav.rnd'),
      cost: t('nav.cost'),
    };
    const labelSpan = a.querySelector('.nav-label');
    if (labelSpan) labelSpan.textContent = labels[page] || page;
  });

  handleRoute();

  if (!document.querySelector('#settings-btn')) {
    const headerText = document.querySelector('.app-header .header-text');
    if (headerText) {
      headerText.style.flex = '1';
      const btn = document.createElement('button');
      btn.className = 'header-settings-btn';
      btn.id = 'settings-btn';
      btn.title = 'Settings';
      btn.textContent = '⚙️';
      btn.onclick = openSettings;
      document.querySelector('.app-header')?.appendChild(btn);
    }
  }
}

function showLoginScreen() {
  document.body.classList.add('login-mode');
  const content = document.getElementById('app-content');
  content.innerHTML = renderLogin();
  initLogin();
}

function navigate(pageName) {
  if (currentPage === pageName) return;
  currentPage = pageName;

  destroyCharts();

  const content = document.getElementById('app-content');
  const page = pages[pageName];
  if (!page) { navigate('dashboard'); return; }

  try {
    content.innerHTML = page.render();
  } catch(e) {
    console.warn('Render error:', e);
    content.innerHTML = '<p style="padding:2rem;text-align:center;color:var(--text-secondary)">Error loading page</p>';
  }
  page.init();

  document.querySelectorAll('.bottom-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageName);
  });
}

function handleRoute() {
  const hash = location.hash.replace('#/', '') || 'dashboard';
  navigate(hash);
}

window.addEventListener('hashchange', handleRoute);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await seedMasterData();
  } catch (e) {
    console.warn('Seed error:', e);
  }

  if (isAuthenticated()) {
    showApp();
  } else {
    showLoginScreen();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
