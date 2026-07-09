function renderCost() {
  return `
    <div class="page-header">
      <h2>📊 ${t('cost.title')}</h2>
      <select id="cost-filter" onchange="loadCostAnalysis()">
        <option value="all">${t('cost.all')}</option>
      </select>
    </div>
    <div id="cost-content">
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>${t('cost.loading')}</p>
      </div>
    </div>
  `;
}

async function initCost() {
  await populateCostFilter();
  await loadOtherCostOptions();
  await loadCostAnalysis();
}

async function populateCostFilter() {
  const select = document.getElementById('cost-filter');
  if (!select) return;

  try {
    const recipes = await getAllRecipes();
    const currentVal = select.value;
    select.innerHTML = '<option value="all">Semua Resep</option>' +
      recipes.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    select.value = currentVal;
  } catch (e) {}
}

function getIngredientEffectiveCost(ing) {
  if (ing.pkgQty > 0 && ing.pkgPrice > 0) {
    return (ing.qty / ing.pkgQty) * ing.pkgPrice;
  }
  if (ing.price > 0) {
    return ing.qty * ing.price;
  }
  return 0;
}

function getIngredientPkgQty(ing) {
  return (ing.pkgQty > 0) ? ing.pkgQty : '';
}

function getIngredientPkgPrice(ing) {
  return (ing.pkgPrice > 0) ? ing.pkgPrice : '';
}

async function loadOtherCostOptions() {
  try {
    const items = await getMasterData('othercost');
    window._otherCostOptions = items.map(i => i.name);
  } catch(e) {
    window._otherCostOptions = [];
  }
}

async function loadCostAnalysis() {
  const content = document.getElementById('cost-content');
  if (!content) return;

  const filterVal = document.getElementById('cost-filter')?.value || 'all';

  try {
    let recipes = await getAllRecipes();

    if (filterVal !== 'all') {
      recipes = recipes.filter(r => r.id === filterVal);
    }

    if (!recipes.length) {
      content.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>' + t('cost.empty') + '</p></div>';
      return;
    }

    content.innerHTML = recipes.map(r => renderRecipeCost(r)).join('<div style="height:16px"></div>');

    recipes.forEach(r => {
      const spInput = document.getElementById(`sp-${r.id}`);
      if (spInput) {
        spInput.addEventListener('input', () => calculateMargin(r.id));
      }
      loadProductData(r.id);
      setupPriceInputs(r.id);
      try { setupOtherCosts(r.id); } catch(e) { console.warn('othercost setup:', e); }
      updatePerCupBreakdown(r.id);
    });

  } catch (e) {
    content.innerHTML = '<div class="empty-state"><p>' + t('cost.failedLoad') + '</p></div>';
    console.error(e);
  }
}

function setupPriceInputs(recipeId) {
  const ings = document.querySelectorAll(`#cost-card-${recipeId} .cost-ing-price`);
  ings.forEach(input => {
    input.addEventListener('input', () => recalcIngredientCosts(recipeId));
  });
  const pkgQtyInputs = document.querySelectorAll(`#cost-card-${recipeId} .cost-ing-pkgqty`);
  pkgQtyInputs.forEach(input => {
    input.addEventListener('input', () => recalcIngredientCosts(recipeId));
  });
}

function recalcIngredientCosts(recipeId) {
  const rows = document.querySelectorAll(`#cost-card-${recipeId} .cost-ing-row`);
  const costs = [];

  rows.forEach(row => {
    const qty = parseFloat(row.dataset.qty) || 0;
    const pkgQty = parseFloat(row.querySelector('.cost-ing-pkgqty')?.value) || 0;
    const pkgPrice = parseFloat(row.querySelector('.cost-ing-price')?.value) || 0;
    const effectiveCost = (pkgQty > 0 && pkgPrice > 0) ? (qty / pkgQty) * pkgPrice : 0;
    costs.push({ row, effectiveCost });
  });

  const grandTotal = costs.reduce((s, c) => s + c.effectiveCost, 0);

  costs.forEach((c, idx) => {
    c.row.querySelector('.cost-ing-effective').textContent = formatCurrency(c.effectiveCost);
    const pctBar = c.row.querySelector('.pct-bar');
    const pctLabel = c.row.querySelector('td:last-child span:last-child');
    const pctVal = grandTotal > 0 ? (c.effectiveCost / grandTotal * 100) : 0;
    if (pctBar) pctBar.style.width = Math.min(pctVal, 100) + '%';
    if (pctLabel) pctLabel.textContent = pctVal.toFixed(1) + '%';
  });

  const otherCostRows = document.querySelectorAll(`#cost-card-${recipeId} .othercost-row`);
  let otherCostsTotal = 0;
  otherCostRows.forEach(row => {
    const amount = parseFloat(row.querySelector('.othercost-amount')?.value) || 0;
    otherCostsTotal += amount;
  });

  const grandTotalWithOther = grandTotal + otherCostsTotal;

  const targetVolume = parseFloat(document.getElementById(`tv-${recipeId}`)?.textContent) || 1000;
  const servingSize = parseFloat(document.getElementById(`ss-${recipeId}`)?.textContent) || 200;

  document.getElementById(`cost-total-${recipeId}`).textContent = formatCurrency(grandTotalWithOther);
  document.getElementById(`cost-per-liter-${recipeId}`).textContent = formatCurrency(grandTotalWithOther / (targetVolume / 1000));
  const costPerServing = grandTotalWithOther / (targetVolume / servingSize);
  document.getElementById(`cost-per-cup-${recipeId}`).textContent = formatCurrency(costPerServing);

  const otEl = document.getElementById(`othercosts-total-${recipeId}`);
  if (otEl) otEl.textContent = t('cost.otherCostsTotal') + ': ' + formatCurrency(otherCostsTotal);

  calculateMargin(recipeId);
  updatePerCupBreakdown(recipeId);
}

function renderRecipeCost(recipe) {
  const ings = recipe.ingredients || [];
  const otherCosts = recipe.otherCosts || [];
  const targetVolume = recipe.targetVolume || 1000;
  const servingSize = recipe.servingSize || 200;
  const otherCostsTotal = otherCosts.reduce((s, oc) => s + (oc.amount || 0), 0);

  const grandTotal = ings.reduce((s, ing) => s + getIngredientEffectiveCost(ing), 0);
  const grandTotalWithOther = grandTotal + otherCostsTotal;
  let totalCost = 0;
  const rows = ings.map((ing, idx) => {
    const effectiveCost = getIngredientEffectiveCost(ing);
    totalCost += effectiveCost;
    const pct = grandTotal > 0 ? (effectiveCost / grandTotal * 100) : 0;

    return `
      <tr class="cost-ing-row" data-qty="${ing.qty || 0}" data-idx="${idx}">
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(ing.item)}</strong>
          ${ing.merk ? `<br><span style="font-size:0.65rem;color:var(--text-muted)">${escapeHtml(ing.merk)}</span>` : ''}
        </td>
        <td>${escapeHtml(ing.uom)}</td>
        <td style="text-align:right">${Number(ing.qty || 0).toFixed(1)}</td>
        <td>
          <input type="number" class="cost-ing-pkgqty show-spinner" min="0" step="any"
            placeholder="100" value="${getIngredientPkgQty(ing)}">
        </td>
        <td>
          <input type="number" class="cost-ing-price show-spinner" min="0" step="any"
            placeholder="50000" value="${getIngredientPkgPrice(ing)}">
        </td>
        <td style="text-align:right;font-weight:600" class="cost-ing-effective">${formatCurrency(effectiveCost)}</td>
        <td>
          <div class="pct-bar-wrap">
            <div class="pct-bar" style="width:${Math.min(pct, 100)}%"></div>
          </div>
          <span style="font-size:0.65rem">${pct.toFixed(1)}%</span>
        </td>
      </tr>`;
  }).join('');

  const costPerLiter = grandTotalWithOther / (targetVolume / 1000);
  const costPerServing = grandTotalWithOther / (targetVolume / servingSize);

  return `
    <div class="card" id="cost-card-${recipe.id}">
      <h3>☕ ${escapeHtml(recipe.name)}</h3>

      <div class="cost-summary-cards">
        <div class="cost-summary-card">
          <span class="csc-label">${t('cost.targetVolume')}</span>
          <span class="csc-value" id="tv-${recipe.id}">${targetVolume} ml</span>
        </div>
        <div class="cost-summary-card">
          <span class="csc-label">${t('cost.servingSize')}</span>
          <span class="csc-value" id="ss-${recipe.id}">${servingSize} ml</span>
        </div>
      </div>

      <p style="font-size:0.7rem;color:var(--text-muted);margin:-4px 0 8px">
        Masukkan isi wadah & harga per wadah. Biaya dihitung otomatis: (qty resep / isi wadah) × harga wadah.
      </p>

      <div style="overflow-x:auto">
        <table class="cost-breakdown-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${t('cost.ingredient')}</th>
              <th>${t('rnd.uom')}</th>
              <th style="text-align:right">${t('rnd.qty')}</th>
              <th style="text-align:right">${t('cost.pkgQty')}</th>
              <th style="text-align:right">${t('cost.pkgPrice')}</th>
              <th style="text-align:right">${t('cost.effectiveCost')}</th>
              <th>${t('cost.pct')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td colspan="6" style="text-align:right"><strong>${t('cost.total')}</strong></td>
              <td style="text-align:right;font-weight:700" id="cost-total-${recipe.id}">${formatCurrency(grandTotalWithOther)}</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="form-actions" style="margin-top:8px">
        <button class="btn btn-accent btn-sm" onclick="saveIngredientPrices('${recipe.id}')">💾 ${t('cost.savePrices')}</button>
      </div>

      <div class="othercosts-section" style="margin-top:14px">
        <h4 style="font-size:0.85rem;color:var(--secondary);margin-bottom:6px">📦 ${t('cost.otherCosts')}</h4>
        <p style="font-size:0.7rem;color:var(--text-muted);margin:-4px 0 8px">${t('cost.otherCostHint')}</p>
        <div id="othercosts-${recipe.id}">
          ${otherCosts.map((oc, idx) => renderOtherCostRow(recipe.id, idx, oc)).join('')}
        </div>
        <button class="btn btn-secondary btn-sm mt-8" onclick="addOtherCostRow('${recipe.id}')">${t('cost.addOtherCost')}</button>
        <div class="othercosts-total" id="othercosts-total-${recipe.id}">${t('cost.otherCostsTotal')}: ${formatCurrency(otherCostsTotal)}</div>
      </div>

      <div class="cost-summary-cards">
        <div class="cost-summary-card">
          <span class="csc-label">${t('cost.costPerLiter')}</span>
          <span class="csc-value" id="cost-per-liter-${recipe.id}">${formatCurrency(costPerLiter)}</span>
        </div>
        <div class="cost-summary-card">
          <span class="csc-label">${t('cost.costPerCup', { size: servingSize })}</span>
          <span class="csc-value" id="cost-per-cup-${recipe.id}">${formatCurrency(costPerServing)}</span>
        </div>
      </div>

      <div class="selling-price-section">
        <div class="form-row">
          <div class="form-group">
            <label>💰 ${t('cost.sellingPrice', { size: servingSize })}</label>
            <input type="number" class="show-spinner" id="sp-${recipe.id}"
              placeholder="${t('cost.sellingPricePlaceholder')}" min="0" step="500">
          </div>
        </div>
        <div class="margin-result" id="margin-result-${recipe.id}">
          <div class="margin-item">
            <span class="m-label">${t('cost.marginRp')}</span>
            <span class="m-value" id="margin-rp-${recipe.id}">-</span>
          </div>
          <div class="margin-item">
            <span class="m-label">${t('cost.marginPct')}</span>
            <span class="m-value" id="margin-pct-${recipe.id}">-</span>
          </div>
        </div>
        <div class="form-actions mt-8">
          <button class="btn btn-accent btn-sm" onclick="saveAsProduct('${recipe.id}')">💾 ${t('cost.saveProduct')}</button>
        </div>
      </div>

      <div style="margin-top:12px">
        <h4 style="font-size:0.8rem;color:var(--text-secondary)">🧮 ${t('cost.perCupLabel', { size: servingSize })}</h4>
        <div style="overflow-x:auto">
          <table class="cost-breakdown-table">
            <thead><tr>
              <th>${t('cost.ingredient')}</th><th>${t('rnd.qty')}</th><th>${t('cost.cost')}</th>
            </tr></thead>
            <tbody id="per-cup-tbody-${recipe.id}"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadProductData(recipeId) {
  try {
    const product = await getProduct(recipeId);
    if (product && product.sellingPrice) {
      const spInput = document.getElementById(`sp-${recipeId}`);
      if (spInput) {
        spInput.value = product.sellingPrice;
        calculateMargin(recipeId);
      }
    }
  } catch (e) {}
}

function calculateMargin(recipeId) {
  const spInput = document.getElementById(`sp-${recipeId}`);
  const costEl = document.getElementById(`cost-per-cup-${recipeId}`);
  const marginRp = document.getElementById(`margin-rp-${recipeId}`);
  const marginPct = document.getElementById(`margin-pct-${recipeId}`);

  if (!spInput || !costEl) return;

  const sellingPrice = parseFloat(spInput.value) || 0;
  const costText = costEl.textContent.replace(/[^0-9]/g, '');
  const costPerServing = parseInt(costText) || 0;

  const marginAmount = sellingPrice - costPerServing;

  if (marginRp) {
    marginRp.textContent = formatCurrency(marginAmount);
    marginRp.className = 'm-value ' + (marginAmount >= 0 ? 'margin-positive' : 'margin-negative');
  }

  if (marginPct) {
    const pct = sellingPrice > 0 ? (marginAmount / sellingPrice * 100) : 0;
    marginPct.textContent = pct.toFixed(1) + '%';
    marginPct.className = 'm-value ' + (pct >= 0 ? 'margin-positive' : 'margin-negative');
  }
}

async function saveIngredientPrices(recipeId) {
  try {
    const recipe = await getRecipe(recipeId);
    if (!recipe) {
      showToast(t('cost.recipeNotFound'));
      return;
    }

    const rows = document.querySelectorAll(`#cost-card-${recipeId} .cost-ing-row`);
    const ingredients = (recipe.ingredients || []).map((ing, idx) => {
      const row = rows[idx];
      if (!row) return ing;
      const pkgQty = parseFloat(row.querySelector('.cost-ing-pkgqty')?.value) || 0;
      const pkgPrice = parseFloat(row.querySelector('.cost-ing-price')?.value) || 0;
      return {
        ...ing,
        pkgQty,
        pkgPrice,
      };
    });

    const otherCostRows = document.querySelectorAll(`#cost-card-${recipeId} .othercost-row`);
    const otherCosts = [];
    otherCostRows.forEach(row => {
      const name = row.querySelector('.othercost-name')?.value.trim();
      const amount = parseFloat(row.querySelector('.othercost-amount')?.value) || 0;
      if (name && amount > 0) {
        otherCosts.push({ name, amount });
      }
    });

    const ingTotal = ingredients.reduce((s, ing) => s + getIngredientEffectiveCost(ing), 0);
    const otherTotal = otherCosts.reduce((s, oc) => s + oc.amount, 0);
    const totalCost = ingTotal + otherTotal;
    const targetVolume = recipe.targetVolume || 1000;
    const servingSize = recipe.servingSize || 200;
    const costPerLiter = totalCost / (targetVolume / 1000);
    const costPerServing = totalCost / (targetVolume / servingSize);

    await updateRecipe(recipeId, {
      ...recipe,
      ingredients,
      otherCosts,
      costPerLiter,
      costPerServing,
    });

    showToast(t('cost.pricesSaved'));
  } catch (e) {
    showToast(t('cost.failedSavePrices'));
    console.error(e);
  }
}

async function saveAsProduct(recipeId) {
  const spInput = document.getElementById(`sp-${recipeId}`);
  const sellingPrice = parseFloat(spInput?.value) || 0;

  if (sellingPrice <= 0) {
    showToast('Masukkan harga jual terlebih dahulu');
    spInput?.focus();
    return;
  }

  try {
    const recipe = await getRecipe(recipeId);
    if (!recipe) {
      showToast(t('cost.recipeNotFound'));
      return;
    }

    const totalIngCost = (recipe.ingredients || []).reduce((s, ing) => s + getIngredientEffectiveCost(ing), 0);
    const totalOtherCost = (recipe.otherCosts || []).reduce((s, oc) => s + (oc.amount || 0), 0);
    const totalCost = totalIngCost + totalOtherCost;
    const targetVolume = recipe.targetVolume || 1000;
    const servingSize = recipe.servingSize || 200;
    const costPerServing = totalCost / (targetVolume / servingSize);
    const margin = sellingPrice - costPerServing;
    const marginPct = sellingPrice > 0 ? (margin / sellingPrice * 100) : 0;

    const product = {
      recipeId,
      name: recipe.productName || recipe.name,
      costPerLiter: totalCost / (targetVolume / 1000),
      costPerServing,
      sellingPrice,
      margin,
      marginPct,
    };

    await saveProduct(product);
    showToast(t('cost.saved') + ': ' + product.name + ' (' + marginPct.toFixed(1) + '%)');
  } catch (e) {
    showToast(t('cost.failedSave'));
    console.error(e);
  }
}

function updatePerCupBreakdown(recipeId) {
  const tbody = document.getElementById(`per-cup-tbody-${recipeId}`);
  if (!tbody) return;
  const rows = document.querySelectorAll(`#cost-card-${recipeId} .cost-ing-row`);
  const targetVolume = parseFloat(document.getElementById(`tv-${recipeId}`)?.textContent) || 1000;
  const servingSize = parseFloat(document.getElementById(`ss-${recipeId}`)?.textContent) || 200;
  const factor = targetVolume > 0 ? servingSize / targetVolume : 0;
  let html = '';
  rows.forEach(row => {
    const item = row.querySelector('td:nth-child(2) strong')?.textContent || '';
    const uom = row.querySelector('td:nth-child(3)')?.textContent?.trim() || 'ml';
    const qty = parseFloat(row.dataset.qty) || 0;
    const pkgQty = parseFloat(row.querySelector('.cost-ing-pkgqty')?.value) || 0;
    const pkgPrice = parseFloat(row.querySelector('.cost-ing-price')?.value) || 0;
    const effectiveCost = (pkgQty > 0 && pkgPrice > 0) ? (qty / pkgQty) * pkgPrice : 0;
    const perCupQty = qty * factor;
    const perCupCost = effectiveCost * factor;
    html += `<tr>
      <td>${escapeHtml(item)}</td>
      <td>${perCupQty.toFixed(1)} ${escapeHtml(uom)}</td>
      <td style="font-weight:600">${formatCurrency(perCupCost)}</td>
    </tr>`;
  });
  tbody.innerHTML = html;
}

function renderOtherCostRow(recipeId, idx, oc) {
  return `
    <div class="othercost-row" data-oc-idx="${idx}">
      <input type="text" class="othercost-name" placeholder="${t('cost.otherCostName')}" value="${escapeHtml(oc?.name || '')}">
      <input type="number" class="othercost-amount show-spinner" placeholder="0" value="${oc?.amount || ''}" min="0" step="500">
      <button class="ingredient-delete" onclick="removeOtherCostRow(this, '${recipeId}')">✕</button>
    </div>
  `;
}

function addOtherCostRow(recipeId) {
  const container = document.getElementById(`othercosts-${recipeId}`);
  if (!container) return;
  const idx = container.children.length;
  const div = document.createElement('div');
  div.innerHTML = renderOtherCostRow(recipeId, idx, {});
  container.appendChild(div.firstElementChild);
  setupSingleOtherCost(container.lastElementChild, recipeId);
  recalcIngredientCosts(recipeId);
}

function removeOtherCostRow(btn, recipeId) {
  const row = btn.closest('.othercost-row');
  if (row) {
    row.remove();
    recalcIngredientCosts(recipeId);
  }
}

function setupOtherCosts(recipeId) {
  const container = document.getElementById(`othercosts-${recipeId}`);
  if (!container) return;
  container.querySelectorAll('.othercost-row').forEach(row => {
    setupSingleOtherCost(row, recipeId);
  });
}

function setupSingleOtherCost(row, recipeId) {
  const input = row.querySelector('.othercost-name');
  if (!input) return;
  try { input._dd = initSearchableDropdown(input, window._otherCostOptions || []); } catch(e) { console.warn('sd:', e); }
  let timer;
  input.addEventListener('blur', () => {
    timer = setTimeout(() => saveOtherCost(input), 300);
  });
  input.addEventListener('focus', () => clearTimeout(timer));
  row.querySelector('.othercost-amount')?.addEventListener('input', () => recalcIngredientCosts(recipeId));
}

async function saveOtherCost(input) {
  if (!input.value.trim()) return;
  const val = input.value.trim();
  if ((window._otherCostOptions || []).includes(val)) return;
  try {
    const item = await addMasterItem('othercost', val);
    if (item && !window._otherCostOptions.includes(item.name)) {
      window._otherCostOptions.push(item.name);
      if (input._dd) input._dd.update(window._otherCostOptions);
    }
  } catch(e) {}
}