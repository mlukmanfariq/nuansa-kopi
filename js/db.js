firebase.initializeApp({
  apiKey: "AIzaSyDoa94VssmXciZUlCE-Tjdx6W_S0qLibOY",
  authDomain: "nuansakopi.firebaseapp.com",
  projectId: "nuansakopi",
  storageBucket: "nuansakopi.firebasestorage.app",
  messagingSenderId: "362484407520",
  appId: "1:362484407520:web:bc771247f50404cfd78485",
  measurementId: "G-SFM90XZKR9"
});

const fbdb = firebase.firestore();

fbdb.enablePersistence().catch(function(err) {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore: multiple tabs open, persistence in one tab only');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore: browser does not support persistence');
  }
});

var _seedPromise = null;

async function seedMasterData() {
  if (_seedPromise) return _seedPromise;
  _seedPromise = (async function() {
    var miSnap = await fbdb.collection('masterItems').limit(1).get();
    if (miSnap.empty) {
      var batch = fbdb.batch();
      ['gr', 'ml', 'pcs'].forEach(function(n) { batch.set(fbdb.collection('masterItems').doc(), { type: 'uom', name: n }); });
      await batch.commit();
    }
    var userDoc = await fbdb.collection('users').doc('admin').get();
    if (!userDoc.exists) {
      await fbdb.collection('users').doc('admin').set({ username: 'admin', password: 'nupi171' });
    }
  })();
  return _seedPromise;
}

async function authenticateUser(username, password) {
  try {
    var doc = await fbdb.collection('users').doc(username).get();
    if (doc.exists && doc.data().password === password) return { id: doc.id, username: doc.data().username };
    return null;
  } catch(e) { return null; }
}

async function changePassword(username, oldPassword, newPassword) {
  try {
    var doc = await fbdb.collection('users').doc(username).get();
    if (!doc.exists || doc.data().password !== oldPassword) return false;
    await fbdb.collection('users').doc(username).update({ password: newPassword });
    return true;
  } catch(e) { return false; }
}

async function getMasterData(type) {
  var snap = await fbdb.collection('masterItems').where('type', '==', type).get();
  return snap.docs.map(function(d) { return { id: d.id, type: d.data().type, name: d.data().name }; });
}

async function addMasterItem(type, name) {
  var trimmed = (name || '').trim();
  if (!trimmed) return null;
  var snap = await fbdb.collection('masterItems').where('type', '==', type).where('name', '==', trimmed).limit(1).get();
  if (!snap.empty) return { id: snap.docs[0].id, type: type, name: trimmed };
  var ref = await fbdb.collection('masterItems').add({ type: type, name: trimmed });
  return { id: ref.id, type: type, name: trimmed };
}

async function addRecipe(recipe) {
  recipe.date = new Date().toISOString();
  var ref = await fbdb.collection('recipes').add(recipe);
  return ref.id;
}

async function updateRecipe(id, data) {
  await fbdb.collection('recipes').doc(id).set(data, { merge: true });
}

async function deleteRecipe(id) {
  await fbdb.collection('recipes').doc(id).delete();
  var snap = await fbdb.collection('products').where('recipeId', '==', id).get();
  if (!snap.empty) {
    var batch = fbdb.batch();
    snap.docs.forEach(function(d) { batch.delete(d.ref); });
    await batch.commit();
  }
}

async function getAllRecipes() {
  var snap = await fbdb.collection('recipes').orderBy('date', 'desc').get();
  return snap.docs.map(function(d) { return { id: d.id, date: d.data().date, name: d.data().name, targetVolume: d.data().targetVolume, servingSize: d.data().servingSize, ingredients: d.data().ingredients, productName: d.data().productName, costPerLiter: d.data().costPerLiter, costPerServing: d.data().costPerServing, otherCosts: d.data().otherCosts }; });
}

async function getRecipe(id) {
  var doc = await fbdb.collection('recipes').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, date: doc.data().date, name: doc.data().name, targetVolume: doc.data().targetVolume, servingSize: doc.data().servingSize, ingredients: doc.data().ingredients, productName: doc.data().productName, costPerLiter: doc.data().costPerLiter, costPerServing: doc.data().costPerServing, otherCosts: doc.data().otherCosts };
}

async function saveProduct(product) {
  product.date = new Date().toISOString();
  var snap = await fbdb.collection('products').where('recipeId', '==', product.recipeId).get();
  if (!snap.empty) {
    var existing = snap.docs[0];
    await fbdb.collection('products').doc(existing.id).set(product, { merge: true });
    return existing.id;
  }
  var ref = await fbdb.collection('products').add(product);
  return ref.id;
}

async function getAllProducts() {
  var snap = await fbdb.collection('products').get();
  return snap.docs.map(function(d) { return { id: d.id, recipeId: d.data().recipeId, name: d.data().name, costPerLiter: d.data().costPerLiter, costPerServing: d.data().costPerServing, sellingPrice: d.data().sellingPrice, margin: d.data().margin, marginPct: d.data().marginPct, date: d.data().date }; });
}

async function getProduct(recipeId) {
  var snap = await fbdb.collection('products').where('recipeId', '==', recipeId).limit(1).get();
  if (snap.empty) return null;
  var d = snap.docs[0];
  return { id: d.id, recipeId: d.data().recipeId, name: d.data().name, costPerLiter: d.data().costPerLiter, costPerServing: d.data().costPerServing, sellingPrice: d.data().sellingPrice, margin: d.data().margin, marginPct: d.data().marginPct, date: d.data().date };
}

async function deleteProduct(id) {
  await fbdb.collection('products').doc(id).delete();
}

async function addSale(sale) {
  sale.date = new Date().toISOString();
  var ref = await fbdb.collection('sales').add(sale);
  return ref.id;
}

async function deleteSale(id) {
  await fbdb.collection('sales').doc(id).delete();
}

async function getSale(id) {
  var doc = await fbdb.collection('sales').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, date: doc.data().date, items: doc.data().items, total: doc.data().total };
}

async function getAllSales() {
  var snap = await fbdb.collection('sales').orderBy('date', 'desc').get();
  return snap.docs.map(function(d) { return { id: d.id, date: d.data().date, items: d.data().items, total: d.data().total }; });
}

async function getSalesByDateRange(startISO, endISO) {
  var snap = await fbdb.collection('sales').where('date', '>=', startISO).where('date', '<=', endISO + '\uffff').orderBy('date', 'desc').get();
  return snap.docs.map(function(d) { return { id: d.id, date: d.data().date, items: d.data().items, total: d.data().total }; });
}

async function getTodaySales() {
  var today = getTodayISO();
  return getSalesByDateRange(today, today);
}

async function getMonthSales() {
  var r = getMonthRange(getTodayISO());
  return getSalesByDateRange(r.start, r.end);
}

async function getSalesLast30Days() {
  var end = new Date();
  var start = new Date();
  start.setDate(start.getDate() - 29);
  return getSalesByDateRange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
}

async function getProductSalesLast30Days() {
  var sales = await getSalesLast30Days();
  var productMap = {};
  sales.forEach(function(sale) {
    (sale.items || []).forEach(function(item) {
      var key = item.productName || 'Unknown';
      productMap[key] = (productMap[key] || 0) + item.qty;
    });
  });
  return Object.entries(productMap).map(function(e) { return { name: e[0], qty: e[1] }; }).sort(function(a, b) { return b.qty - a.qty; });
}

async function getDailySalesSummary() {
  var sales = await getTodaySales();
  return {
    count: sales.length,
    total: sales.reduce(function(s, sale) { return s + (sale.total || 0); }, 0),
    items: sales.reduce(function(s, sale) { return s + (sale.items || []).reduce(function(a, i) { return a + i.qty; }, 0); }, 0),
  };
}

async function getMonthlySalesSummary() {
  var sales = await getMonthSales();
  return {
    count: sales.length,
    total: sales.reduce(function(s, sale) { return s + (sale.total || 0); }, 0),
  };
}

async function getAverageMargin() {
  var products = await getAllProducts();
  if (!products.length) return 0;
  var margins = products.filter(function(p) { return p.costPerServing > 0 && p.sellingPrice > 0; }).map(function(p) { return ((p.sellingPrice - p.costPerServing) / p.sellingPrice) * 100; });
  if (!margins.length) return 0;
  return margins.reduce(function(s, m) { return s + m; }, 0) / margins.length;
}

async function resetMasterData() {
  var snap = await fbdb.collection('masterItems').where('type', 'in', ['item', 'merk', 'uom']).get();
  if (!snap.empty) {
    var batch = fbdb.batch();
    snap.docs.forEach(function(d) { batch.delete(d.ref); });
    await batch.commit();
  }
  var batch2 = fbdb.batch();
  ['gr', 'ml', 'pcs'].forEach(function(n) { batch2.set(fbdb.collection('masterItems').doc(), { type: 'uom', name: n }); });
  await batch2.commit();
}