function renderDashboard() {
  return `
    <div class="page-header">
      <h2 id="dash-title">${t('dash.title')}</h2>
      <span style="font-size:0.75rem;color:var(--text-secondary)">${formatDate(getTodayISO())}</span>
    </div>

    <div class="kpi-grid" id="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon">📦</div>
        <div class="kpi-info">
          <span class="kpi-label">${t('dash.kpiProducts')}</span>
          <span class="kpi-value" id="kpi-products">0</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">💰</div>
        <div class="kpi-info">
          <span class="kpi-label">${t('dash.kpiToday')}</span>
          <span class="kpi-value" id="kpi-today">Rp 0</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📅</div>
        <div class="kpi-info">
          <span class="kpi-label">${t('dash.kpiMonth')}</span>
          <span class="kpi-value" id="kpi-month">Rp 0</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📊</div>
        <div class="kpi-info">
          <span class="kpi-label">${t('dash.kpiMargin')}</span>
          <span class="kpi-value" id="kpi-margin">0%</span>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card chart-card">
            <h3>📉 ${t('dash.chartTrend')}</h3>
        <canvas id="chart-trend"></canvas>
        <p id="chart-trend-empty" class="empty-state" style="display:none">
          <div class="empty-icon">📊</div>
          <p>${t('dash.noSales')}</p>
        </p>
      </div>
      <div class="card chart-card">
            <h3>🏆 ${t('dash.chartTop')}</h3>
        <canvas id="chart-top"></canvas>
        <p id="chart-top-empty" class="empty-state" style="display:none">
          <div class="empty-icon">🏆</div>
          <p>${t('dash.noProducts')}</p>
        </p>
      </div>
      <div class="card chart-card">
            <h3>⚖️ ${t('dash.chartCost')}</h3>
        <canvas id="chart-cost"></canvas>
        <p id="chart-cost-empty" class="empty-state" style="display:none">
          <div class="empty-icon">⚖️</div>
          <p>${t('dash.noProducts')}</p>
        </p>
      </div>
    </div>

    <div class="card">
      <h3>🕐 ${t('dash.recentTransactions')}</h3>
      <div id="recent-transactions">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>${t('dash.noTransactions')}</p>
        </div>
      </div>
    `;
}

async function initDashboard() {
  await loadKPIs();
  await loadRecentTransactions();
  await renderSalesTrend();
  await renderTopProducts();
  await renderCostVsPrice();
}

async function loadKPIs() {
  try {
    const products = await getAllProducts();
    const todaySum = await getDailySalesSummary();
    const monthSum = await getMonthlySalesSummary();
    const avgMargin = await getAverageMargin();

    document.getElementById('kpi-products').textContent = products.length;
    document.getElementById('kpi-today').textContent = formatCurrency(todaySum.total);
    document.getElementById('kpi-month').textContent = formatCurrency(monthSum.total);
    document.getElementById('kpi-margin').textContent = avgMargin.toFixed(1) + '%';
  } catch (e) {
    console.error('KPI error:', e);
  }
}

async function loadRecentTransactions() {
  const el = document.getElementById('recent-transactions');
  try {
    const sales = await getAllSales();
    const recent = sales.slice(0, 10);

    if (!recent.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>' + t('dash.noTransactions') + '</p></div>';
      return;
    }

    el.innerHTML = `<div class="table-wrap">
      <table class="simple-table">
        <thead><tr>
          <th>Tanggal</th>
          <th>Item</th>
          <th>Total</th>
        </tr></thead>
        <tbody>
          ${recent.map(s => {
            const items = (s.items || []).map(i => `${i.productName} x${i.qty}`).join(', ');
            return `<tr>
              <td>${formatDateShort(s.date)}</td>
              <td style="font-size:0.72rem;color:var(--text-secondary)">${items || '-'}</td>
              <td style="font-weight:700">${formatCurrency(s.total)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  } catch (e) {
      el.innerHTML = '<div class="empty-state"><p>' + t('dash.failedLoad') + '</p></div>';
  }
}

async function renderSalesTrend() {
  const canvas = document.getElementById('chart-trend');
  const empty = document.getElementById('chart-trend-empty');
  if (!canvas) return;

  try {
    const sales = await getSalesLast30Days();

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const dailyTotals = {};
    sales.forEach(s => {
      const day = s.date.slice(0, 10);
      dailyTotals[day] = (dailyTotals[day] || 0) + (s.total || 0);
    });

    const data = days.map(d => dailyTotals[d] || 0);

    if (data.every(v => v === 0)) {
      canvas.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    canvas.style.display = 'block';
    empty.style.display = 'none';

    const labels = days.map(d => {
      const parts = d.split('-');
      return parts[2] + '/' + parts[1];
    });

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: t('dash.chartTrend'),
          data,
          borderColor: '#C68E5B',
          backgroundColor: 'rgba(198,142,91,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => formatCurrency(ctx.parsed.y)
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 9 }, maxTicksLimit: 10 },
            grid: { display: false }
          },
          y: {
            ticks: {
              font: { size: 9 },
              callback: v => formatCurrency(v)
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
    registerChart(chart);
  } catch (e) {
    console.error('Chart error:', e);
  }
}

async function renderTopProducts() {
  const canvas = document.getElementById('chart-top');
  const empty = document.getElementById('chart-top-empty');
  if (!canvas) return;

  try {
    const products = await getProductSalesLast30Days();
    const top5 = products.slice(0, 5);

    if (!top5.length) {
      canvas.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    canvas.style.display = 'block';
    empty.style.display = 'none';

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top5.map(p => p.name.length > 12 ? p.name.slice(0, 12) + '..' : p.name),
        datasets: [{
          label: t('dash.sold'),
          data: top5.map(p => p.qty),
          backgroundColor: ['#4A2C2A', '#6B3A2A', '#8B5E3C', '#C68E5B', '#E8C49A'],
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ctx.parsed.x + ' ' + t('dash.sold')
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 9 }, stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y: {
            ticks: { font: { size: 9 } },
            grid: { display: false }
          }
        }
      }
    });
    registerChart(chart);
  } catch (e) {
    console.error('Top products chart error:', e);
  }
}

async function renderCostVsPrice() {
  const canvas = document.getElementById('chart-cost');
  const empty = document.getElementById('chart-cost-empty');
  if (!canvas) return;

  try {
    const products = await getAllProducts();
    const withData = products.filter(p => p.costPerServing > 0 && p.sellingPrice > 0);

    if (!withData.length) {
      canvas.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    canvas.style.display = 'block';
    empty.style.display = 'none';

    const labels = withData.map(p => p.name.length > 12 ? p.name.slice(0, 12) + '..' : p.name);
    const costs = withData.map(p => p.costPerServing);
    const prices = withData.map(p => p.sellingPrice);

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: t('dash.costLabel'),
            data: costs,
            backgroundColor: '#6B3A2A',
            borderRadius: 4,
          },
          {
            label: t('dash.priceLabel'),
            data: prices,
            backgroundColor: '#C68E5B',
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 9 }, boxWidth: 12, padding: 8 }
          },
          tooltip: {
            callbacks: {
              label: ctx => ctx.dataset.label + ': ' + formatCurrency(ctx.parsed.y)
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 8 } },
            grid: { display: false }
          },
          y: {
            ticks: {
              font: { size: 9 },
              callback: v => formatCurrency(v)
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
    registerChart(chart);
  } catch (e) {
    console.error('Cost vs price chart error:', e);
  }
}
