import { DB, registrarEntrada, registrarSalida } from './storage.js';
import { fmtDate, toast, todayISO, esc } from './utils.js';

function productOptions(){
  return DB.getProducts().map(p => `<option value="${p.id}">${esc(p.nombre)} (${esc(p.codigo)}) — stock: ${p.stock}</option>`).join('');
}

export function renderEntradas(){
  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="page-head"><h1>Entradas</h1><p class="muted">Registrar ingreso de mercadería a bodega</p></div>
    <div class="grid-2">
      <div class="card">
        <h3>Nueva entrada</h3>
        <form id="entradaForm" class="form-grid">
          <label>Producto<select required name="productId">${productOptions()}</select></label>
          <label>Cantidad<input required type="number" min="1" name="cantidad" /></label>
          <label>Proveedor<input name="proveedor" placeholder="Nombre proveedor" /></label>
          <label>Fecha<input type="date" name="fecha" value="${todayISO()}" /></label>
          <label class="full">Observación<input name="observacion" placeholder="Opcional" /></label>
          <button class="btn btn-primary full" type="submit">Registrar entrada (Stock +=)</button>
        </form>
      </div>
      <div class="card">
        <h3>Últimas entradas</h3>
        <table class="mini-table" id="entradasList"></table>
      </div>
    </div>
  `;
  el.querySelector('#entradaForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      registrarEntrada(data);
      toast('Entrada registrada, stock actualizado');
      e.target.reset(); e.target.fecha.value = todayISO();
      drawEntradasList();
      el.querySelector('select[name="productId"]').innerHTML = productOptions();
    } catch(err){ toast(err.message, 'error'); }
  });
  drawEntradasList();
}

function drawEntradasList(){
  const box = document.getElementById('entradasList');
  if(!box) return;
  const list = DB.getMovements().filter(m=>m.tipo==='entrada').slice(0,10);
  box.innerHTML = `<tbody>${list.length ? list.map(m=>`
    <tr><td>${fmtDate(m.fecha)}</td><td>${esc(m.producto)}</td><td class="ok-text">+${m.cantidad}</td></tr>
  `).join('') : `<tr><td class="muted">Sin registros aún.</td></tr>`}</tbody>`;
}

export function renderSalidas(){
  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="page-head"><h1>Salidas</h1><p class="muted">Registrar salida de mercadería de bodega</p></div>
    <div class="grid-2">
      <div class="card">
        <h3>Nueva salida</h3>
        <form id="salidaForm" class="form-grid">
          <label>Producto<select required name="productId">${productOptions()}</select></label>
          <label>Cantidad<input required type="number" min="1" name="cantidad" /></label>
          <label>Destino<input name="destino" placeholder="Cliente / sucursal" /></label>
          <label>Fecha<input type="date" name="fecha" value="${todayISO()}" /></label>
          <button class="btn btn-primary full" type="submit">Registrar salida (Stock -=)</button>
        </form>
      </div>
      <div class="card">
        <h3>Últimas salidas</h3>
        <table class="mini-table" id="salidasList"></table>
      </div>
    </div>
  `;
  el.querySelector('#salidaForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      registrarSalida(data);
      toast('Salida registrada, stock actualizado');
      e.target.reset(); e.target.fecha.value = todayISO();
      drawSalidasList();
      el.querySelector('select[name="productId"]').innerHTML = productOptions();
    } catch(err){ toast(err.message, 'error'); }
  });
  drawSalidasList();
}

function drawSalidasList(){
  const box = document.getElementById('salidasList');
  if(!box) return;
  const list = DB.getMovements().filter(m=>m.tipo==='salida').slice(0,10);
  box.innerHTML = `<tbody>${list.length ? list.map(m=>`
    <tr><td>${fmtDate(m.fecha)}</td><td>${esc(m.producto)}</td><td class="danger-text">-${m.cantidad}</td></tr>
  `).join('') : `<tr><td class="muted">Sin registros aún.</td></tr>`}</tbody>`;
}

export function renderHistorial(){
  const el = document.getElementById('pageContent');
  const movs = DB.getMovements();
  el.innerHTML = `
    <div class="page-head">
      <h1>Historial de movimientos</h1>
      <div class="page-actions">
        <select id="histFiltro"><option value="">Todos</option><option value="entrada">Entradas</option><option value="salida">Salidas</option></select>
      </div>
    </div>
    <div class="card table-card">
      <table class="data-table">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Código</th><th>Cantidad</th><th>Detalle</th></tr></thead>
        <tbody id="histBody"></tbody>
      </table>
    </div>
    <div class="grid-2">
      <div class="card"><h3>Stock por categoría</h3><canvas id="statCat" height="180"></canvas></div>
      <div class="card"><h3>Movimientos del mes</h3><canvas id="statMonth" height="180"></canvas></div>
    </div>
  `;
  const draw = (filtro='') => {
    const body = el.querySelector('#histBody');
    const list = filtro ? movs.filter(m=>m.tipo===filtro) : movs;
    body.innerHTML = list.length ? list.map(m => `
      <tr>
        <td>${fmtDate(m.fecha)}</td>
        <td><span class="badge ${m.tipo==='entrada'?'badge-ok':'badge-danger'}">${m.tipo==='entrada'?'📥 Entrada':'📤 Salida'}</span></td>
        <td>${esc(m.producto)}</td><td>${esc(m.codigo)}</td>
        <td class="${m.tipo==='entrada'?'ok-text':'danger-text'}">${m.tipo==='entrada'?'+':'-'}${m.cantidad}</td>
        <td>${m.tipo==='entrada' ? esc(m.observacion||'-') : esc(m.destino||'-')}</td>
      </tr>
    `).join('') : `<tr><td colspan="6" class="muted center">Sin movimientos.</td></tr>`;
  };
  el.querySelector('#histFiltro').addEventListener('change', e => draw(e.target.value));
  draw();

  import('./charts.js').then(({renderCategoryStockChart, renderMovementsChart}) => {
    renderCategoryStockChart('statCat');
    renderMovementsChart('statMonth');
  });
}
