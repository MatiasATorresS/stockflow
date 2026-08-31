import { DB, isCritical } from './storage.js';
import { $, esc } from './utils.js';

const NAV = [
  { href: 'index.html', icon: '📊', label: 'Dashboard', key: 'dashboard' },
  { href: 'pages/productos.html', icon: '📦', label: 'Productos', key: 'productos' },
  { href: 'pages/entradas.html', icon: '📥', label: 'Entradas', key: 'entradas' },
  { href: 'pages/salidas.html', icon: '📤', label: 'Salidas', key: 'salidas' },
  { href: 'pages/proveedores.html', icon: '🚚', label: 'Proveedores', key: 'proveedores' },
  { href: 'pages/historial.html', icon: '📜', label: 'Historial', key: 'historial' },
];

export function renderLayout(activeKey){
  const root = document.getElementById('app-shell');
  if(!root) return;
  const isSubpage = activeKey !== 'dashboard';
  const base = isSubpage ? '../' : '';

  root.innerHTML = `
    <aside class="sidebar">
      <div class="brand"><span class="brand-logo">📦</span><span>StockFlow</span></div>
      <nav class="nav">
        ${NAV.map(n => `<a href="${base}${n.href}" class="nav-link ${n.key===activeKey?'active':''}"><span>${n.icon}</span><span>${n.label}</span></a>`).join('')}
      </nav>
    </aside>
    <div class="main">
      <header class="header">
        <button class="icon-btn" id="menuToggle">☰</button>
        <div class="search-wrap"><input id="globalSearch" placeholder="Buscar productos, códigos, proveedores..." /></div>
        <div class="header-alerts" id="headerAlerts"></div>
        <button class="icon-btn" id="themeToggle">🌙</button>
      </header>
      <main class="content" id="pageContent"></main>
    </div>
  `;

  applyTheme(DB.getTheme());
  $('#themeToggle').addEventListener('click', () => {
    const next = DB.getTheme() === 'dark' ? 'light' : 'dark';
    DB.setTheme(next); applyTheme(next);
  });
  $('#menuToggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));

  renderHeaderAlerts();
  const search = $('#globalSearch');
  search.addEventListener('input', () => {
    document.dispatchEvent(new CustomEvent('global-search', { detail: search.value.trim().toLowerCase() }));
  });
}

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if(btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function renderHeaderAlerts(){
  const box = document.getElementById('headerAlerts');
  if(!box) return;
  const criticos = DB.getProducts().filter(isCritical);
  if(criticos.length === 0){ box.innerHTML=''; return; }
  box.innerHTML = `<span class="alert-pill" title="${esc(criticos.map(p=>p.nombre).join(', '))}">⚠ ${criticos.length} stock crítico</span>`;
}

export function initTheme(){ applyTheme(DB.getTheme()); }
