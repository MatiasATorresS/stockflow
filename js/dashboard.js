import { DB, isCritical } from './storage.js';
import { todayISO, esc } from './utils.js';
import { renderMovementsChart, renderTopProductsChart, renderCategoryStockChart } from './charts.js';

export function renderDashboard(){
  const el = document.getElementById('pageContent');
  const products = DB.getProducts();
  const movs = DB.getMovements();
  const today = todayISO();

  const stockTotal = products.reduce((s,p)=>s+Number(p.stock),0);
  const criticos = products.filter(isCritical);
  const entradasHoy = movs.filter(m=>m.tipo==='entrada' && m.fecha===today).reduce((s,m)=>s+Number(m.cantidad),0);
  const salidasHoy = movs.filter(m=>m.tipo==='salida' && m.fecha===today).reduce((s,m)=>s+Number(m.cantidad),0);

  el.innerHTML = `
    <div class="page-head">
      <h1>Dashboard</h1>
      <p class="muted">Resumen general del inventario</p>
    </div>

    <div class="cards-grid">
      <div class="card stat-card">
        <span class="stat-icon">📦</span>
        <div><div class="stat-value">${products.length}</div><div class="stat-label">Productos registrados</div></div>
      </div>
      <div class="card stat-card">
        <span class="stat-icon">📊</span>
        <div><div class="stat-value">${stockTotal}</div><div class="stat-label">Stock total (unidades)</div></div>
      </div>
      <div class="card stat-card ${criticos.length ? 'stat-warning':''}">
        <span class="stat-icon">⚠️</span>
        <div><div class="stat-value">${criticos.length}</div><div class="stat-label">Stock bajo / crítico</div></div>
      </div>
      <div class="card stat-card">
        <span class="stat-icon">📥</span>
        <div><div class="stat-value">+${entradasHoy}</div><div class="stat-label">Entradas de hoy</div></div>
      </div>
      <div class="card stat-card">
        <span class="stat-icon">📤</span>
        <div><div class="stat-value">-${salidasHoy}</div><div class="stat-label">Salidas de hoy</div></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Movimientos por mes</h3>
        <canvas id="chartMovs" height="180"></canvas>
      </div>
      <div class="card">
        <h3>Categorías con mayor stock</h3>
        <canvas id="chartCats" height="180"></canvas>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Productos más movidos</h3>
        <canvas id="chartTop" height="200"></canvas>
      </div>
      <div class="card">
        <h3>⚠ Alertas de stock crítico</h3>
        ${criticos.length ? `<table class="mini-table"><tbody>
         ${criticos.map(p=>`<tr><td>${esc(p.nombre)}</td><td class="danger-text">${p.stock} / min ${p.stockMin}</td></tr>`).join('')}
        </tbody></table>` : `<p class="muted">No hay productos con stock crítico 🎉</p>`}
      </div>
    </div>
  `;

  renderMovementsChart('chartMovs');
  renderCategoryStockChart('chartCats');
  renderTopProductsChart('chartTop');
}
