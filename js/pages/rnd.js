let rndEditingId = null;
let rndRowCounter = 0;
let rndItems = [], rndMerks = [], rndUoms = [];

function renderRND() {
  return `
    <div class="page-header">
      <h2>🧪 ${t('rnd.title')}</h2>
    </div>

    <div class="card">
      <h3>${rndEditingId ? '✏️ ' + t('rnd.editRecipe') : '📝 ' + t('rnd.newRecipe')}</h3>
      <div class="form-row">
        <div class="form-group">
          <label>${t('rnd.recipeName')}</label>
          <input type="text" id="recipe-name" placeholder="${t('rnd.recipeNamePlaceholder')}" autocomplete="off">
        </div>
        <div class="form-group">
          <label>${t('rnd.targetVolume')}</label>
          <input type="number" id="target-volume" class="show-spinner" value="1000" min="1" step="100">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>${t('rnd.servingSize')}</label>
          <input type="number" id="serving-size" class="show-spinner" value="200" min="1" step="50">
        </div>
        <div class="form-group">
          <label>${t('rnd.productName')}</label>
          <input type="text" id="product-name" placeholder="${t('rnd.productNameHint')}" autocomplete="off">
        </div>
      </div>

      <div class="ingredients-section">
        <h4>🧂 ${t('rnd.ingredients')}</h4>
        <p style="font-size:0.7rem;color:var(--text-muted);margin:-6px 0 8px">${t('rnd.noPricesHint')}</p>
        <div class="ingredients-header">
          <span>${t('rnd.item')}</span>
          <span>${t('rnd.brand')}</span>
          <span>${t('rnd.uom')}</span>
          <span>${t('rnd.qty')}</span>
          <span id="per-serving-header">/cup</span>
          <span></span>
        </div>
        <div id="ingredient-rows"></div>
        <button class="btn btn-secondary btn-sm mt-8" onclick="addIngredientRow()">${t('rnd.addIngredient')}</button>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveRecipe()">💾 ${t('rnd.save')}</button>
        <button class="btn btn-secondary" onclick="resetRNDForm()">↺ ${t('rnd.reset')}</button>
        ${rndEditingId ? `<button class="btn btn-danger" onclick="cancelEditRecipe()">✕ ${t('rnd.cancelEdit')}</button>` : ''}
      </div>
    </div>

    <div class="card">
      <h3>📋 ${t('rnd.history')}</h3>
      <div id="recipe-list"></div>
    </div>
  `;
}

async function initRND() {
  rndEditingId = null;
  rndRowCounter = 0;
  await loadDropdownData();
  addIngredientRow();
  await loadRecipes();
  setupRNDEventListeners();
}

function setupRNDEventListeners() {
  document.getElementById('target-volume')?.addEventListener('input', calculateIngredients);
  document.getElementById('serving-size')?.addEventListener('input', calculateIngredients);
}

async function loadDropdownData() {
  try {
    const items = await getMasterData('item');
    const merks = await getMasterData('merk');
    const uoms = await getMasterData('uom');
    rndItems = items.map(i => i.name);
    rndMerks = merks.map(m => m.name);
    rndUoms = uoms.map(u => u.name);
  } catch (e) {
    console.error('Dropdown data error:', e);
  }
}

function addIngredientRow(item, merk, uom, qty) {
  const container = document.getElementById('ingredient-rows');
  if (!container) return;

  const idx = rndRowCounter++;

  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.dataset.idx = idx;
  row.innerHTML = `
    <input type="text" class="ingredient-item"
              placeholder="${t('rnd.item')}" value="${escapeHtml(item || '')}">
    <input type="text" class="ingredient-merk"
              placeholder="${t('rnd.brand')}" value="${escapeHtml(merk || '')}">
    <input type="text" class="ingredient-uom"
              placeholder="${t('rnd.uom')}" value="${escapeHtml(uom || 'gr')}">
    <input type="number" class="ingredient-qty show-spinner" placeholder="0"
      value="${qty || ''}" min="0" step="any">
    <span class="ingredient-perserving">—</span>
    <button class="ingredient-delete" onclick="removeIngredientRow(this)" title="${t('rnd.deleteBtn')}">✕</button>
  `;

  container.appendChild(row);

  let itemInput = row.querySelector('.ingredient-item');
  let merkInput = row.querySelector('.ingredient-merk');
  let uomInput = row.querySelector('.ingredient-uom');

  itemInput._dd = initSearchableDropdown(itemInput, rndItems);
  merkInput._dd = initSearchableDropdown(merkInput, rndMerks);
  uomInput._dd = initSearchableDropdown(uomInput, rndUoms);

  [itemInput, merkInput, uomInput].forEach(inp => {
    let timer;
    inp.addEventListener('blur', () => {
      timer = setTimeout(() => saveToDropdown(inp), 300);
    });
    inp.addEventListener('focus', () => clearTimeout(timer));
  });

  row.querySelector('.ingredient-qty')?.addEventListener('input', calculateIngredients);

  calculateIngredients();
}

function removeIngredientRow(btn) {
  const row = btn.closest('.ingredient-row');
  if (row) {
    row.remove();
    calculateIngredients();
  }
}

async function saveToDropdown(input) {
  if (!input.value.trim()) return;

  let type, arr;
  if (input.classList.contains('ingredient-item')) { type = 'item'; arr = rndItems; }
  else if (input.classList.contains('ingredient-merk')) { type = 'merk'; arr = rndMerks; }
  else if (input.classList.contains('ingredient-uom')) { type = 'uom'; arr = rndUoms; }
  else return;

  const val = input.value.trim();
  if (arr.includes(val)) return;

  try {
    const item = await addMasterItem(type, val);
    if (item && !arr.includes(item.name)) {
      arr.push(item.name);
      if (input._dd) input._dd.update(arr);
    }
  } catch (e) {}
}

function calculateIngredients() {
  const rows = document.querySelectorAll('#ingredient-rows .ingredient-row');
  const targetVolume = parseFloat(document.getElementById('target-volume')?.value) || 1000;
  const servingSize = parseFloat(document.getElementById('serving-size')?.value) || 200;
  const factor = targetVolume > 0 ? servingSize / targetVolume : 0;

  const header = document.getElementById('per-serving-header');
  if (header) header.textContent = servingSize + 'ml';

  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.ingredient-qty')?.value) || 0;
    const perServing = row.querySelector('.ingredient-perserving');
    if (perServing) {
      const val = qty * factor;
      perServing.textContent = val > 0 ? val.toFixed(1) : '—';
    }
  });
}

async function saveRecipe() {
  const name = document.getElementById('recipe-name')?.value.trim();
  if (!name) {
    showToast(t('rnd.nameRequired'));
    document.getElementById('recipe-name')?.focus();
    return;
  }

  const rows = document.querySelectorAll('#ingredient-rows .ingredient-row');
  const ingredients = [];
  rows.forEach(row => {
    const item = row.querySelector('.ingredient-item')?.value.trim();
    if (!item) return;
    ingredients.push({
      item,
      merk: row.querySelector('.ingredient-merk')?.value.trim() || '',
      uom: row.querySelector('.ingredient-uom')?.value.trim() || 'ml',
      qty: parseFloat(row.querySelector('.ingredient-qty')?.value) || 0,
    });
  });

  if (!ingredients.length) {
    showToast(t('rnd.minOneIngredient'));
    return;
  }

  const targetVolume = parseFloat(document.getElementById('target-volume')?.value) || 1000;
  const servingSize = parseFloat(document.getElementById('serving-size')?.value) || 200;
  const productName = document.getElementById('product-name')?.value.trim() || name;

  try {
    if (rndEditingId) {
      var existing = await getRecipe(rndEditingId);
      if (!existing) { showToast(t('rnd.recipeNotFound')); return; }
      var costs = recalcCost(ingredients, existing, targetVolume, servingSize);
      var recipe = {
        name: name,
        targetVolume: targetVolume,
        servingSize: servingSize,
        productName: productName,
        ingredients: ingredients.map(function(ing, idx) {
          var oldIng = (existing.ingredients || [])[idx];
          return {
            item: ing.item,
            merk: ing.merk,
            uom: ing.uom,
            qty: ing.qty,
            pkgQty: oldIng ? oldIng.pkgQty : null,
            pkgPrice: oldIng ? oldIng.pkgPrice : null,
          };
        }),
        costPerLiter: costs.costPerLiter,
        costPerServing: costs.costPerServing,
      };
      await updateRecipe(rndEditingId, recipe);
      await syncProductFromRecipe(rndEditingId, recipe, existing);
      showToast(t('rnd.updated'));
    } else {
      var recipe = {
        name: name,
        targetVolume: targetVolume,
        servingSize: servingSize,
        productName: productName,
        ingredients: ingredients.map(function(ing) { return { item: ing.item, merk: ing.merk, uom: ing.uom, qty: ing.qty }; }),
        costPerLiter: 0,
        costPerServing: 0,
      };
      var recipeId = await addRecipe(recipe);
      var product = {
        recipeId: recipeId,
        name: productName,
        costPerLiter: 0,
        costPerServing: 0,
        sellingPrice: 0,
        margin: 0,
        marginPct: 0,
      };
      await saveProduct(product);
      showToast(t('rnd.saved'));
    }
    rndEditingId = null;
    resetRNDForm();
    await loadRecipes();
  } catch (e) {
    showToast(t('rnd.failedSave'));
    console.error(e);
  }
}

function recalcCost(ingredients, existing, targetVolume, servingSize) {
  var ingTotal = 0;
  (ingredients || []).forEach(function(ing, idx) {
    var oldIng = (existing.ingredients || [])[idx];
    var pkgQty = oldIng ? oldIng.pkgQty : null;
    var pkgPrice = oldIng ? oldIng.pkgPrice : null;
    var qty = ing.qty || 0;
    if (pkgQty > 0 && pkgPrice > 0) {
      ingTotal += (qty / pkgQty) * pkgPrice;
    }
  });
  var otherTotal = (existing.otherCosts || []).reduce(function(s, oc) { return s + (oc.amount || 0); }, 0);
  var totalCost = ingTotal + otherTotal;
  return {
    costPerLiter: totalCost / ((targetVolume || 1000) / 1000),
    costPerServing: totalCost / ((targetVolume || 1000) / (servingSize || 200)),
  };
}

async function syncProductFromRecipe(recipeId, recipe, existing) {
  try {
    var product = await getProduct(recipeId);
    var costs = recalcCost(recipe.ingredients, existing, recipe.targetVolume, recipe.servingSize);
    if (product) {
      await saveProduct({
        recipeId: recipeId,
        name: recipe.productName || recipe.name,
        costPerLiter: costs.costPerLiter,
        costPerServing: costs.costPerServing,
        sellingPrice: product.sellingPrice || 0,
        margin: product.sellingPrice > 0 ? product.sellingPrice - costs.costPerServing : 0,
        marginPct: product.sellingPrice > 0 ? ((product.sellingPrice - costs.costPerServing) / product.sellingPrice) * 100 : 0,
        date: product.date || new Date().toISOString(),
      });
    }
  } catch(e) { console.warn('syncProduct error:', e); }
}

function resetRNDForm() {
  document.getElementById('recipe-name').value = '';
  document.getElementById('product-name').value = '';
  document.getElementById('target-volume').value = 1000;
  document.getElementById('serving-size').value = 200;
  document.getElementById('ingredient-rows').innerHTML = '';
  rndRowCounter = 0;
  rndEditingId = null;
  addIngredientRow();
  calculateIngredients();

  const header = document.querySelector('.card h3');
  if (header) header.textContent = '📝 Buat Resep Baru';

  const cancelBtn = document.querySelector('.btn-danger');
  if (cancelBtn) cancelBtn.remove();
}

function cancelEditRecipe() {
  resetRNDForm();
}

async function loadRecipes() {
  const el = document.getElementById('recipe-list');
  if (!el) return;

  try {
    const recipes = await getAllRecipes();

    if (!recipes.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>' + t('rnd.empty') + '</p></div>';
      return;
    }

    el.innerHTML = recipes.map(r => `
      <div class="recipe-item">
        <div class="recipe-info">
          <div class="recipe-name">${escapeHtml(r.name)}</div>
          <div class="recipe-meta">
            ${r.targetVolume || 1000}ml · ${Math.floor((r.targetVolume || 1000) / (r.servingSize || 200))} cup · ${t('rnd.ingredientCount', { count: r.ingredients?.length || 0 })} · ${formatDate(r.date)}
          </div>
        </div>
        <div class="recipe-cost">${r.servingSize || 200}ml/cup</div>
        <div class="recipe-actions">
          <button class="btn btn-accent btn-xs" onclick="editRecipe('${r.id}')">✏️</button>
          <button class="btn btn-danger btn-xs" onclick="deleteRecipeConfirm('${r.id}')">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    el.innerHTML = '<div class="empty-state"><p>' + t('rnd.failedLoad') + '</p></div>';
  }
}

async function editRecipe(id) {
  try {
    const recipe = await getRecipe(id);
    if (!recipe) {
      showToast(t('rnd.recipeNotFound'));
      return;
    }

    rndEditingId = id;
    document.getElementById('recipe-name').value = recipe.name;
    document.getElementById('product-name').value = recipe.productName || recipe.name;
    document.getElementById('target-volume').value = recipe.targetVolume || 1000;
    document.getElementById('serving-size').value = recipe.servingSize || 200;

    const container = document.getElementById('ingredient-rows');
    container.innerHTML = '';
    rndRowCounter = 0;

    (recipe.ingredients || []).forEach(ing => {
      addIngredientRow(ing.item, ing.merk, ing.uom, ing.qty);
    });

    if (!recipe.ingredients?.length) {
      addIngredientRow();
    }

    calculateIngredients();

    const header = document.querySelector('.card h3');
    if (header) header.textContent = '✏️ Edit Resep';

    const actions = document.querySelector('.form-actions');
    if (actions && !actions.querySelector('.btn-danger')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-danger';
      cancelBtn.textContent = '✕ Batal Edit';
      cancelBtn.onclick = cancelEditRecipe;
      actions.appendChild(cancelBtn);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    showToast(t('rnd.failedLoad'));
  }
}

async function deleteRecipeConfirm(id) {
  const ok = await confirmModal(t('rnd.deleteConfirm'));
  if (!ok) return;
  try {
    await deleteRecipe(id);
    showToast(t('rnd.deleted'));
    await loadRecipes();
  } catch (e) {
    showToast(t('rnd.deleteFailed'));
  }
}
