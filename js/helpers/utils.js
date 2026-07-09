function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (num >= 1000000) {
    return 'Rp ' + (num / 1000000).toFixed(1) + 'jt';
  }
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

function formatCurrencyFull(amount) {
  return 'Rp ' + Math.round(Number(amount || 0)).toLocaleString('id-ID');
}

function getTodayISO() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const parts = dateStr.split('T')[0].split('-');
  return parts[2] + '/' + parts[1];
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10)
  };
}

function getMonthRange(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function numberInput(e) {
  return parseFloat(e?.value) || 0;
}

function renderLogo(className, alt) {
  return `<img class="${className}" src="assets/icons/logo.png" alt="${escapeHtml(alt || 'Logo')}" style="object-fit:contain">`;
}

function initSearchableDropdown(input, options) {
  let panel = document.createElement('div');
  panel.className = 'sd-panel';

  let wrapper = document.createElement('div');
  wrapper.className = 'sd-wrapper';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  wrapper.appendChild(panel);

  input.autocomplete = 'off';
  input.removeAttribute('list');

  function render(filter) {
    let filtered = filter
      ? options.filter(o => o.toLowerCase().includes(filter.toLowerCase()))
      : options;
    if (!filtered.length) { panel.style.display = 'none'; return; }
    panel.innerHTML = filtered.map(o =>
      `<div class="sd-item">${escapeHtml(o)}</div>`
    ).join('');
    panel.querySelectorAll('.sd-item').forEach(el => {
      el.onmousedown = e => { e.preventDefault(); input.value = el.textContent; hide(); input.dispatchEvent(new Event('input', { bubbles: true })); };
    });
    panel.style.display = 'block';
  }

  function hide() { panel.style.display = 'none'; }

  function show() { render(input.value); }

  function update(newOptions) { options = newOptions; }

  input.onfocus = show;
  input.oninput = () => render(input.value);
  input.onblur = () => setTimeout(hide, 200);
  input.onkeydown = e => { if (e.key === 'Escape') hide(); };

  return { update, show, hide, panel, wrapper };
}

function confirmModal(message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal">
        <h3>${escapeHtml(message)}</h3>
        <div class="form-actions">
          <button class="btn btn-secondary" id="confirm-cancel">Batal</button>
          <button class="btn btn-danger" id="confirm-ok">Ya, Hapus</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = (val) => { document.body.removeChild(overlay); resolve(val); };
    overlay.querySelector('#confirm-ok').onclick = () => close(true);
    overlay.querySelector('#confirm-cancel').onclick = () => close(false);
    overlay.onclick = (e) => { if (e.target === overlay) close(false); };
  });
}

function showToast(msg, duration) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, duration || 2500);
}

function promptModal(title, placeholder, value) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal">
        <h3>${title}</h3>
        <div class="form-group">
          <input type="text" id="modal-input" placeholder="${placeholder}" value="${value || ''}">
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" id="modal-cancel">Batal</button>
          <button class="btn btn-primary" id="modal-ok">OK</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#modal-input');
    input.focus();
    input.select();
    const close = (val) => {
      document.body.removeChild(overlay);
      resolve(val);
    };
    overlay.querySelector('#modal-ok').onclick = () => close(input.value);
    overlay.querySelector('#modal-cancel').onclick = () => close(null);
    overlay.onclick = (e) => { if (e.target === overlay) close(null); };
    input.onkeydown = (e) => { if (e.key === 'Enter') close(input.value); if (e.key === 'Escape') close(null); };
  });
}
