let salesViewMode = 'daily';
let salesItems = [];
let _currentSalesData = [];

function renderSales() {
  return `
    <div class="page-header">
      <h2>💰 ${t('sales.title')}</h2>
    </div>

    <div class="card">
      <h3>📝 ${t('sales.newTransaction')}</h3>
      <div class="form-group">
        <label>${t('sales.date')}</label>
        <input type="date" id="sale-date" value="${getTodayISO()}">
      </div>

      <h4 style="margin-top:12px">${t('sales.itemsSold')}</h4>
      <div id="sale-items-container"></div>
      <button class="btn btn-secondary btn-sm mt-8" onclick="addSaleItemRow()">${t('sales.addItem')}</button>

      <div class="sale-total-display" id="sale-total-display">Rp 0</div>

      <div class="form-actions">
        <button class="btn btn-primary w-full" onclick="saveSale()">💾 ${t('sales.save')}</button>
      </div>
    </div>

      <div class="card">
        <h3>📋 ${t('sales.history')}</h3>

        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
          <div class="sales-view-toggle" style="flex:1;margin-bottom:0">
            <button class="${salesViewMode === 'daily' ? 'active' : ''}" data-view="daily" onclick="setSalesView('daily')">${t('sales.daily')}</button>
            <button class="${salesViewMode === 'weekly' ? 'active' : ''}" data-view="weekly" onclick="setSalesView('weekly')">${t('sales.weekly')}</button>
            <button class="${salesViewMode === 'monthly' ? 'active' : ''}" data-view="monthly" onclick="setSalesView('monthly')">${t('sales.monthly')}</button>
          </div>
          <button class="btn btn-accent btn-sm" onclick="exportSalesExcel()" title="${t('sales.export')}">📥 ${t('sales.export')}</button>
        </div>

      <div id="sales-history">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>${t('cost.loading')}</p>
        </div>
      </div>
    </div>
  `;
}

async function initSales() {
  salesItems = [];
  await populateSaleProducts();
  addSaleItemRow();
  await loadSalesHistory();
}

async function populateSaleProducts() {
  try {
    const products = await getAllProducts();
    window._saleProducts = products;
  } catch (e) {
    window._saleProducts = [];
  }
}

function addSaleItemRow(productId, qty, price) {
  const container = document.getElementById('sale-items-container');
  if (!container) return;

  const products = window._saleProducts || [];
  const idx = salesItems.length;

  const item = { productId: productId || '', qty: qty || 1, price: price || 0 };
  salesItems.push(item);

  const row = document.createElement('div');
  row.className = 'sale-item-row';
  row.dataset.idx = idx;
  row.innerHTML = `
    <select class="sale-product" onchange="onSaleProductChange(${idx})">
      <option value="">${t('sales.selectProduct')}</option>
      ${products.map(p => `<option value="${p.id}" ${p.id === (productId || '') ? 'selected' : ''}>
        ${escapeHtml(p.name)} (${formatCurrency(p.sellingPrice)})
      </option>`).join('')}
    </select>
    <input type="number" class="sale-qty show-spinner" value="${qty || 1}" min="1" step="1"
      onchange="onSaleQtyChange(${idx})">
    <input type="number" class="sale-price show-spinner" value="${price || 0}" min="0" step="500"
      oninput="onSalePriceInput(${idx})">
    <button class="btn btn-danger btn-xs" onclick="removeSaleItemRow(${idx})" style="padding:4px 8px">✕</button>
  `;

  container.appendChild(row);

  if (productId && !price) {
    const product = products.find(p => p.id === productId);
    if (product) {
      row.querySelector('.sale-price').value = product.sellingPrice;
      item.price = product.sellingPrice;
    }
  }

  updateSaleTotal();
}

function onSaleProductChange(idx) {
  const rows = document.querySelectorAll('#sale-items-container .sale-item-row');
  if (idx >= rows.length) return;

  const row = rows[idx];
  const select = row.querySelector('.sale-product');
  const priceInput = row.querySelector('.sale-price');

  const productId = select?.value || '';
  const qty = parseInt(row.querySelector('.sale-qty')?.value) || 1;
  let price = parseFloat(priceInput?.value) || 0;

  const products = window._saleProducts || [];
  const product = products.find(p => p.id === productId);
  if (product && product.sellingPrice) {
    price = product.sellingPrice;
    priceInput.value = price;
  }
  priceInput.removeAttribute('data-manual');

  if (idx < salesItems.length) {
    salesItems[idx] = { productId, qty, price };
  }

  updateSaleTotal();
}

function onSaleQtyChange(idx) {
  const rows = document.querySelectorAll('#sale-items-container .sale-item-row');
  if (idx >= rows.length) return;

  const row = rows[idx];
  const productId = row.querySelector('.sale-product')?.value || '';
  const qty = parseInt(row.querySelector('.sale-qty')?.value) || 1;
  const price = parseFloat(row.querySelector('.sale-price')?.value) || 0;

  if (idx < salesItems.length) {
    salesItems[idx] = { productId, qty, price };
  }

  updateSaleTotal();
}

function onSalePriceInput(idx) {
  const rows = document.querySelectorAll('#sale-items-container .sale-item-row');
  if (idx >= rows.length) return;

  const row = rows[idx];
  row.querySelector('.sale-price').dataset.manual = '1';

  const productId = row.querySelector('.sale-product')?.value || '';
  const qty = parseInt(row.querySelector('.sale-qty')?.value) || 1;
  const price = parseFloat(row.querySelector('.sale-price')?.value) || 0;

  if (idx < salesItems.length) {
    salesItems[idx] = { productId, qty, price };
  }

  updateSaleTotal();
}

function removeSaleItemRow(idx) {
  const rows = document.querySelectorAll('#sale-items-container .sale-item-row');
  if (rows.length <= 1) {
    showToast(t('sales.minOneItem'));
    return;
  }

  if (idx < rows.length) {
    rows[idx].remove();
  }

  salesItems.splice(idx, 1);

  const remainingRows = document.querySelectorAll('#sale-items-container .sale-item-row');
  remainingRows.forEach((row, i) => {
    row.dataset.idx = i;
    const sel = row.querySelector('.sale-product');
    const qty = row.querySelector('.sale-qty');
    const price = row.querySelector('.sale-price');
    sel.onchange = () => onSaleProductChange(i);
    qty.onchange = () => onSaleQtyChange(i);
    price.oninput = () => onSalePriceInput(i);
    const btn = row.querySelector('.btn');
    if (btn) btn.onclick = () => removeSaleItemRow(i);
  });

  updateSaleTotal();
}

function updateSaleTotal() {
  let total = 0;
  const rows = document.querySelectorAll('#sale-items-container .sale-item-row');

  const items = [];
  rows.forEach(row => {
    const select = row.querySelector('.sale-product');
    const qty = parseInt(row.querySelector('.sale-qty')?.value) || 0;
    const price = parseFloat(row.querySelector('.sale-price')?.value) || 0;
    const productId = select?.value || null;
    if (productId) {
      items.push({ productId, qty, price });
      total += qty * price;
    }
  });

  salesItems = items;
  document.getElementById('sale-total-display').textContent = formatCurrency(total);
}

async function saveSale() {
  const date = document.getElementById('sale-date')?.value;
  if (!date) {
    showToast(t('sales.pickDate'));
    return;
  }

  const rows = document.querySelectorAll('#sale-items-container .sale-item-row');
  const items = [];
  const products = window._saleProducts || [];

  rows.forEach(row => {
    const select = row.querySelector('.sale-product');
    const qty = parseInt(row.querySelector('.sale-qty')?.value) || 0;
    const price = parseFloat(row.querySelector('.sale-price')?.value) || 0;
    const productId = select?.value || null;

    if (!productId) return;

    const product = products.find(p => p.id === productId);
    items.push({
      productId,
      productName: product?.name || 'Unknown',
      productCost: product?.costPerServing || 0,
      qty,
      price,
      subtotal: qty * price,
    });
  });

  if (!items.length) {
    showToast(t('sales.pickProduct'));
    return;
  }

  const total = items.reduce((s, i) => s + i.subtotal, 0);

  try {
    const sale = { date, items, total };
    await addSale(sale);
    showToast(t('sales.saved'));
    resetSaleForm();
    await loadSalesHistory();
  } catch (e) {
    showToast(t('sales.failedSave'));
    console.error(e);
  }
}

function resetSaleForm() {
  const container = document.getElementById('sale-items-container');
  if (container) container.innerHTML = '';
  salesItems = [];
  document.getElementById('sale-total-display').textContent = 'Rp 0';
  addSaleItemRow();
}

function setSalesView(mode) {
  salesViewMode = mode;
  document.querySelectorAll('.sales-view-toggle button').forEach(b => {
    const key = mode === 'daily' ? 'sales.daily' : mode === 'weekly' ? 'sales.weekly' : 'sales.monthly';
    b.classList.toggle('active', b.dataset.view === mode);
  });
  loadSalesHistory();
}

async function loadSalesHistory() {
  const el = document.getElementById('sales-history');
  if (!el) return;

  try {
    const today = getTodayISO();
    let sales = [];

    if (salesViewMode === 'daily') {
      sales = await getSalesByDateRange(today, today);
    } else if (salesViewMode === 'weekly') {
      const { start, end } = getWeekRange(today);
      sales = await getSalesByDateRange(start, end);
    } else {
      const { start, end } = getMonthRange(today);
      sales = await getSalesByDateRange(start, end);
    }

    _currentSalesData = sales;

    const grandTotal = sales.reduce((s, sale) => s + (sale.total || 0), 0);
    const totalItems = sales.reduce((s, sale) => s + (sale.items || []).reduce((a, i) => a + i.qty, 0), 0);

    if (!sales.length) {
      el.innerHTML = `
        <div class="cost-summary-cards">
          <div class="cost-summary-card">
            <span class="csc-label">${t('sales.totalTransactions')}</span>
            <span class="csc-value">0</span>
          </div>
          <div class="cost-summary-card">
            <span class="csc-label">${t('sales.totalSales')}</span>
            <span class="csc-value">Rp 0</span>
          </div>
        </div>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>${t('sales.noData')}</p>
        </div>`;
      return;
    }

    el.innerHTML = `
      <div class="cost-summary-cards">
        <div class="cost-summary-card">
          <span class="csc-label">${t('sales.totalTransactions')}</span>
          <span class="csc-value">${sales.length}</span>
        </div>
        <div class="cost-summary-card">
          <span class="csc-label">${t('sales.totalSales')}</span>
          <span class="csc-value">${formatCurrency(grandTotal)}</span>
        </div>
        <div class="cost-summary-card">
          <span class="csc-label">${t('sales.totalItems')}</span>
          <span class="csc-value">${totalItems}</span>
        </div>
        <div class="cost-summary-card">
          <span class="csc-label">${t('sales.avgTransaction')}</span>
          <span class="csc-value">${formatCurrency(grandTotal / sales.length)}</span>
        </div>
      </div>
      <div class="table-wrap">
        <table class="simple-table">
          <thead><tr>
            <th>${t('sales.date')}</th>
            <th>${t('rnd.item')}</th>
            <th style="text-align:right">${t('cost.total')}</th>
            <th></th>
          </tr></thead>
          <tbody>
            ${sales.map(s => `
              <tr>
                <td>${formatDate(s.date)}<br><span style="font-size:0.6rem;color:var(--text-muted)">${formatTime(s.date)}</span></td>
                <td>
                  ${(s.items || []).map(i => `${escapeHtml(i.productName)} <strong>x${i.qty}</strong>`).join('<br>')}
                </td>
                <td style="text-align:right;font-weight:700">${formatCurrency(s.total)}</td>
                <td>
                  <button class="btn btn-danger btn-xs" onclick="deleteSaleConfirm('${s.id}')">🗑️</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    el.innerHTML = '<div class="empty-state"><p>' + t('sales.failedLoad') + '</p></div>';
    console.error(e);
  }
}

async function deleteSaleConfirm(id) {
  const ok = await confirmModal(t('sales.deleteConfirm'));
  if (!ok) return;
  try {
    await deleteSale(id);
    showToast(t('sales.deleted'));
    await loadSalesHistory();
  } catch (e) {
    showToast(t('sales.deleteFailed'));
  }
}

function getViewLabel() {
  if (salesViewMode === 'daily') return 'Harian';
  if (salesViewMode === 'weekly') return 'Mingguan';
  return 'Bulanan';
}

function exportSalesExcel() {
  const sales = _currentSalesData;
  if (!sales || !sales.length) {
    showToast(t('sales.noExportData'));
    return;
  }

  const modeLabel = getViewLabel();
  const today = getTodayISO();

  let rows = [];
  rows.push(['No', 'Tanggal', 'Jam', 'Produk', 'Qty', 'Harga Satuan', 'Subtotal', 'Total Transaksi']);
  rows.push([]);

  let rowNum = 1;
  let grandTotal = 0;

  sales.forEach(sale => {
    const items = sale.items || [];
    const dateStr = sale.date ? sale.date.slice(0, 10) : '-';
    const timeStr = sale.date ? formatTime(sale.date) : '';
    const saleTotal = sale.total || 0;
    grandTotal += saleTotal;

    if (items.length === 0) {
      rows.push([rowNum++, dateStr, timeStr, '-', '', '', '', saleTotal]);
    } else {
      items.forEach((item, i) => {
        const subtotal = (item.qty || 0) * (item.price || 0);
        if (i === 0) {
          rows.push([rowNum++, dateStr, timeStr, item.productName || '-', item.qty || 0, item.price || 0, subtotal, saleTotal]);
        } else {
          rows.push(['', '', '', item.productName || '-', item.qty || 0, item.price || 0, subtotal, '']);
        }
      });
    }
  });

  rows.push([]);
  rows.push(['', '', '', '', '', t('cost.total'), '', grandTotal]);

  const BOM = '\uFEFF';
  const csvContent = rows.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',')
  ).join('\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NuansaKopi_${modeLabel}_${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(t('sales.exportOk', { mode: modeLabel, count: sales.length }));
}
