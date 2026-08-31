import { renderLayout } from './ui.js';
import { renderDashboard } from './dashboard.js';
import { renderProducts } from './products.js';
import { renderSuppliers } from './suppliers.js';
import { renderEntradas, renderSalidas, renderHistorial } from './inventory.js';

const page = document.body.dataset.page || 'dashboard';

const RENDERERS = {
  dashboard: renderDashboard,
  productos: renderProducts,
  proveedores: renderSuppliers,
  entradas: renderEntradas,
  salidas: renderSalidas,
  historial: renderHistorial,
};

renderLayout(page);
(RENDERERS[page] || renderDashboard)();
