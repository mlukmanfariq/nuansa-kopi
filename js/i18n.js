const dict = {
  // App
  'app.name': { id: 'Nuansa Kopi', en: 'Nuansa Kopi' },

  // Nav
  'nav.dashboard': { id: 'Beranda', en: 'Dashboard' },
  'nav.sales': { id: 'Penjualan', en: 'Sales' },
  'nav.rnd': { id: 'Riset', en: 'R&D' },
  'nav.cost': { id: 'Biaya', en: 'Cost' },
  'nav.settings': { id: 'Pengaturan', en: 'Settings' },

  // Login
  'login.title': { id: 'Masuk', en: 'Login' },
  'login.username': { id: 'Username', en: 'Username' },
  'login.password': { id: 'Password', en: 'Password' },
  'login.btn': { id: 'Masuk', en: 'Login' },
  'login.invalid': { id: 'Username atau password salah', en: 'Invalid username or password' },
  'login.welcome': { id: 'Selamat datang di', en: 'Welcome to' },

  // Settings
  'settings.title': { id: 'Pengaturan', en: 'Settings' },
  'settings.language': { id: 'Bahasa', en: 'Language' },
  'settings.changePassword': { id: 'Ubah Password', en: 'Change Password' },
  'settings.oldPassword': { id: 'Password Lama', en: 'Old Password' },
  'settings.newPassword': { id: 'Password Baru', en: 'New Password' },
  'settings.confirmPassword': { id: 'Konfirmasi Password', en: 'Confirm Password' },
  'settings.savePassword': { id: 'Simpan Password', en: 'Save Password' },
  'settings.logout': { id: 'Keluar', en: 'Logout' },
  'settings.passwordMismatch': { id: 'Konfirmasi password tidak cocok', en: 'Password confirmation does not match' },
  'settings.passwordChanged': { id: 'Password berhasil diubah', en: 'Password changed successfully' },
  'settings.wrongPassword': { id: 'Password lama salah', en: 'Wrong old password' },

  // Dashboard
  'dash.title': { id: 'Beranda', en: 'Dashboard' },
  'dash.kpiProducts': { id: 'Total Produk', en: 'Total Products' },
  'dash.kpiToday': { id: 'Penjualan Hari Ini', en: "Today's Sales" },
  'dash.kpiMonth': { id: 'Penjualan Bulan Ini', en: 'Monthly Sales' },
  'dash.kpiMargin': { id: 'Rata-rata Margin', en: 'Avg Margin' },
  'dash.chartTrend': { id: 'Penjualan 30 Hari', en: 'Sales 30 Days' },
  'dash.chartTop': { id: 'Produk Terlaris', en: 'Top Products' },
  'dash.chartCost': { id: 'Biaya vs Harga Jual', en: 'Cost vs Selling Price' },
  'dash.recentTransactions': { id: 'Transaksi Terakhir', en: 'Recent Transactions' },
  'dash.costLabel': { id: 'Biaya/cup', en: 'Cost/cup' },
  'dash.priceLabel': { id: 'Harga Jual', en: 'Selling Price' },
  'dash.sold': { id: 'cup terjual', en: 'cups sold' },
  'dash.noSales': { id: 'Belum ada data penjualan', en: 'No sales data yet' },
  'dash.noProducts': { id: 'Belum ada data produk', en: 'No product data yet' },
  'dash.noTransactions': { id: 'Belum ada transaksi', en: 'No transactions yet' },
  'dash.failedLoad': { id: 'Gagal memuat data', en: 'Failed to load data' },

  // R&D
  'rnd.title': { id: 'Riset & Pengembangan', en: 'R&D' },
  'rnd.newRecipe': { id: 'Buat Resep Baru', en: 'New Recipe' },
  'rnd.editRecipe': { id: 'Edit Resep', en: 'Edit Recipe' },
  'rnd.recipeName': { id: 'Nama Resep', en: 'Recipe Name' },
  'rnd.recipeNamePlaceholder': { id: 'Cth: Es Kopi Susu Aren', en: 'E.g.: Iced Coffee Palm Sugar' },
  'rnd.targetVolume': { id: 'Target Volume (ml)', en: 'Target Volume (ml)' },
  'rnd.servingSize': { id: 'Ukuran Per Cup (ml)', en: 'Serving Size (ml)' },
  'rnd.productName': { id: 'Nama Produk (untuk penjualan)', en: 'Product Name (for sales)' },
  'rnd.productNameHint': { id: 'Kosongkan = pakai nama resep', en: 'Leave empty = use recipe name' },
  'rnd.item': { id: 'Item', en: 'Item' },
  'rnd.brand': { id: 'Merk', en: 'Brand' },
  'rnd.uom': { id: 'Satuan', en: 'UoM' },
  'rnd.qty': { id: 'Jumlah', en: 'Qty' },
  'rnd.deleteBtn': { id: 'Hapus', en: 'Delete' },
  'rnd.failedSave': { id: 'Gagal menyimpan resep', en: 'Failed to save recipe' },
  'rnd.failedLoad': { id: 'Gagal memuat resep', en: 'Failed to load recipe' },
  'rnd.recipeNotFound': { id: 'Resep tidak ditemukan', en: 'Recipe not found' },
  'rnd.ingredients': { id: 'Bahan-bahan', en: 'Ingredients' },
  'rnd.addIngredient': { id: '+ Tambah Bahan', en: '+ Add Ingredient' },
  'rnd.totalCost': { id: 'Total Biaya', en: 'Total Cost' },
  'rnd.costPerLiter': { id: 'Biaya / Liter', en: 'Cost / Liter' },
  'rnd.costPerCup': { id: 'Biaya / {size}ml', en: 'Cost / {size}ml' },
  'rnd.save': { id: 'Simpan Resep', en: 'Save Recipe' },
  'rnd.reset': { id: 'Reset', en: 'Reset' },
  'rnd.cancelEdit': { id: 'Batal Edit', en: 'Cancel Edit' },
  'rnd.history': { id: 'Riwayat Resep', en: 'Recipe History' },
  'rnd.empty': { id: 'Belum ada resep. Buat resep pertama kamu!', en: 'No recipes yet. Create your first one!' },
  'rnd.perCup': { id: '/cup', en: '/cup' },
  'rnd.perServing': { id: '/{size}ml', en: '/{size}ml' },
  'rnd.ingredientCount': { id: '{count} bahan', en: '{count} ingredients' },
  'rnd.nameRequired': { id: 'Masukkan nama resep', en: 'Enter recipe name' },
  'rnd.minOneIngredient': { id: 'Tambahkan minimal 1 bahan', en: 'Add at least 1 ingredient' },
  'rnd.saved': { id: 'Resep berhasil disimpan', en: 'Recipe saved' },
  'rnd.updated': { id: 'Resep berhasil diperbarui', en: 'Recipe updated' },
  'rnd.deleteConfirm': { id: 'Hapus resep ini?', en: 'Delete this recipe?' },
  'rnd.deleted': { id: 'Resep dihapus', en: 'Recipe deleted' },
  'rnd.deleteFailed': { id: 'Gagal menghapus resep', en: 'Failed to delete recipe' },
  'rnd.noPricesHint': { id: 'Atur harga bahan di Analisis Biaya', en: 'Set prices in Cost Analysis' },

  // Cost Analysis
  'cost.title': { id: 'Analisis Biaya', en: 'Cost Analysis' },
  'cost.all': { id: 'Semua Resep', en: 'All Recipes' },
  'cost.loading': { id: 'Memuat data...', en: 'Loading...' },
  'cost.empty': { id: 'Belum ada resep. Buat resep di menu Riset terlebih dahulu.', en: 'No recipes yet. Create one in R&D menu first.' },
  'cost.failedLoad': { id: 'Gagal memuat data', en: 'Failed to load data' },
  'cost.targetVolume': { id: 'Target Volume', en: 'Target Volume' },
  'cost.servingSize': { id: 'Ukuran Per Cup', en: 'Serving Size' },
  'cost.ingredient': { id: 'Bahan', en: 'Ingredient' },
  'cost.pkgQty': { id: 'Isi/Wadah', en: 'Pkg Qty' },
  'cost.pkgUom': { id: 'Sat. Wadah', en: 'Pkg UoM' },
  'cost.pkgPrice': { id: 'Harga/Wadah', en: 'Pkg Price' },
  'cost.effectiveCost': { id: 'Biaya Efektif', en: 'Effective Cost' },
  'cost.subtotal': { id: 'Subtotal', en: 'Subtotal' },
  'cost.total': { id: 'TOTAL', en: 'TOTAL' },
  'cost.pct': { id: '%', en: '%' },
  'cost.costPerLiter': { id: 'Biaya / Liter', en: 'Cost / Liter' },
  'cost.costPerCup': { id: 'Biaya / {size}ml', en: 'Cost / {size}ml' },
  'cost.sellingPrice': { id: 'Harga Jual / {size}ml', en: 'Selling Price / {size}ml' },
  'cost.sellingPricePlaceholder': { id: 'Masukkan harga jual', en: 'Enter selling price' },
  'cost.marginRp': { id: 'Margin (Rp)', en: 'Margin (IDR)' },
  'cost.marginPct': { id: 'Margin (%)', en: 'Margin (%)' },
  'cost.saveProduct': { id: 'Simpan Produk', en: 'Save Product' },
  'cost.savePrices': { id: 'Simpan Harga Bahan', en: 'Save Prices' },
  'cost.pricesSaved': { id: 'Harga bahan berhasil disimpan', en: 'Prices saved successfully' },
  'cost.perCupLabel': { id: 'Takaran per {size}ml cup', en: 'Measurement per {size}ml cup' },
  'cost.saved': { id: 'Produk berhasil disimpan', en: 'Product saved' },
  'cost.enterPrice': { id: 'Masukkan harga jual terlebih dahulu', en: 'Enter selling price first' },
  'cost.cost': { id: 'Biaya', en: 'Cost' },
  'cost.failedSave': { id: 'Gagal menyimpan produk', en: 'Failed to save product' },
  'cost.recipeNotFound': { id: 'Resep tidak ditemukan', en: 'Recipe not found' },
  'cost.failedSavePrices': { id: 'Gagal menyimpan harga', en: 'Failed to save prices' },
  'cost.otherCosts': { id: 'Biaya Lainnya', en: 'Other Costs' },
  'cost.otherCostName': { id: 'Nama Biaya', en: 'Cost Name' },
  'cost.otherCostAmount': { id: 'Jumlah (Rp)', en: 'Amount (Rp)' },
  'cost.addOtherCost': { id: '+ Tambah Biaya Lain', en: '+ Add Other Cost' },
  'cost.otherCostHint': { id: 'Biaya kemasan, tenaga, utilitas, dll', en: 'Packaging, labor, utilities, etc.' },
  'cost.otherCostsTotal': { id: 'Total Biaya Lain', en: 'Other Costs Total' },
  'cost.ingredientCostsTotal': { id: 'Total Bahan Baku', en: 'Ingredient Total' },

  // Sales
  'sales.title': { id: 'Penjualan', en: 'Sales' },
  'sales.newTransaction': { id: 'Transaksi Baru', en: 'New Transaction' },
  'sales.date': { id: 'Tanggal', en: 'Date' },
  'sales.itemsSold': { id: 'Item Terjual', en: 'Items Sold' },
  'sales.addItem': { id: '+ Tambah Item', en: '+ Add Item' },
  'sales.save': { id: 'Simpan Transaksi', en: 'Save Transaction' },
  'sales.saved': { id: 'Transaksi berhasil disimpan', en: 'Transaction saved' },
  'sales.failedSave': { id: 'Gagal menyimpan transaksi', en: 'Failed to save transaction' },
  'sales.history': { id: 'Riwayat Penjualan', en: 'Sales History' },
  'sales.daily': { id: 'Harian', en: 'Daily' },
  'sales.weekly': { id: 'Mingguan', en: 'Weekly' },
  'sales.monthly': { id: 'Bulanan', en: 'Monthly' },
  'sales.export': { id: 'Excel', en: 'Excel' },
  'sales.selectProduct': { id: '-- Pilih Produk --', en: '-- Select Product --' },
  'sales.noData': { id: 'Tidak ada transaksi periode ini', en: 'No transactions this period' },
  'sales.totalTransactions': { id: 'Total Transaksi', en: 'Total Transactions' },
  'sales.totalSales': { id: 'Total Penjualan', en: 'Total Sales' },
  'sales.totalItems': { id: 'Total Item Terjual', en: 'Total Items Sold' },
  'sales.avgTransaction': { id: 'Rata-rata/Transaksi', en: 'Avg/Transaction' },
  'sales.minOneItem': { id: 'Minimal 1 item', en: 'At least 1 item' },
  'sales.pickProduct': { id: 'Pilih minimal 1 produk', en: 'Pick at least 1 product' },
  'sales.pickDate': { id: 'Pilih tanggal', en: 'Pick a date' },
  'sales.exportSuccess': { id: 'Export {mode} berhasil ({count} transaksi)', en: 'Export {mode} success ({count} transactions)' },
  'sales.failedLoad': { id: 'Gagal memuat data', en: 'Failed to load data' },
  'sales.deleteConfirm': { id: 'Hapus transaksi ini?', en: 'Delete this transaction?' },
  'sales.deleted': { id: 'Transaksi dihapus', en: 'Transaction deleted' },
  'sales.deleteFailed': { id: 'Gagal menghapus transaksi', en: 'Failed to delete transaction' },
  'sales.noExportData': { id: 'Tidak ada data untuk diexport', en: 'No data to export' },
  'sales.exportOk': { id: 'Export {mode} berhasil ({count} transaksi)', en: 'Export {mode} success ({count} transactions)' },
};

let _currentLang = null;

function getLang() {
  if (_currentLang) return _currentLang;
  const saved = localStorage.getItem('nuansa_lang');
  if (saved === 'id' || saved === 'en') {
    _currentLang = saved;
    return saved;
  }
  _currentLang = 'id';
  return 'id';
}

function setLang(lang) {
  if (lang !== 'id' && lang !== 'en') return;
  _currentLang = lang;
  localStorage.setItem('nuansa_lang', lang);
}

function t(key, params) {
  const lang = getLang();
  let text = dict[key]?.[lang];
  if (text === undefined || text === null) return key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return text;
}
