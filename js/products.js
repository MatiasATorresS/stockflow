import { DB, isCritical } from './storage.js';
import { fmtMoney, fmtDate, toast, esc } from './utils.js';
import { openModal, closeModal, confirmDialog } from './modal.js';
import { searchProducts, sortProducts, filterProducts } from './filters.js';

let state = { term:'', sortBy:'nombre-asc', categoria:'', proveedor:'', criticos:false };

export function renderProducts(){
  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="page-head">
      <h1>Productos</h1>
      <div class="page-actions">
        <button class="btn btn-ghost" id="btnCategorias">🏷 Categorías</button>
        <button class="btn btn-primary" id="btnNuevoProducto">+ Nuevo producto</button>
      </div>
    </div>

    <div class="toolbar card">
      <input id="pTerm" placeholder="Buscar por nombre, código, proveedor..." class="input-search" />
      <select id="pCategoria"><option value="">Todas las categorías</option></select>
      <select id="pProveedor"><option value="">Todos los proveedores</option></select>
      <select id="pSort">
        <option value="nombre-asc">Nombre (A-Z)</option>
        <option value="nombre-desc">Nombre (Z-A)</option>
        <option value="stock-asc">Stock (menor a mayor)</option>
        <option value="stock-desc">Stock (mayor a menor)</option>
        <option value="precio-asc">Precio (menor a mayor)</option>
        <option value="precio-desc">Precio (mayor a menor)</option>
      </select>
      <label class="chk"><input type="checkbox" id="pCriticos" /> Solo stock crítico</label>
    </div>

    <div class="card table-card">
      <table class="data-table">
        <thead><tr>
          <th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Ubicación</th><th>Proveedor</th><th></th>
        </tr></thead>
        <tbody id="productsBody"></tbody>
      </table>
    </div>
  `;

  const cats = DB.getCategories();
  const provs = DB.getSuppliers();
  el.querySelector('#pCategoria').insertAdjacentHTML('beforeend', cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(''));
  el.querySelector('#pProveedor').insertAdjacentHTML('beforeend', provs.map(p=>`<option value="${esc(p.nombre)}">${esc(p.nombre)}</option>`).join(''));

  el.querySelector('#pTerm').addEventListener('input', e => { state.term = e.target.value; draw(); });
  el.querySelector('#pCategoria').addEventListener('change', e => { state.categoria = e.target.value; draw(); });
  el.querySelector('#pProveedor').addEventListener('change', e => { state.proveedor = e.target.value; draw(); });
  el.querySelector('#pSort').addEventListener('change', e => { state.sortBy = e.target.value; draw(); });
  el.querySelector('#pCriticos').addEventListener('change', e => { state.criticos = e.target.checked; draw(); });
  el.querySelector('#btnNuevoProducto').addEventListener('click', () => openProductForm());
  el.querySelector('#btnCategorias').addEventListener('click', () => openCategoriesModal());

  document.addEventListener('global-search', e => { state.term = e.detail; el.querySelector('#pTerm').value = e.detail; draw(); });

  draw();
}

function draw(){
  const body = document.getElementById('productsBody');
  if(!body) return;
  let list = DB.getProducts();
  list = searchProducts(list, state.term);
  list = filterProducts(list, state);
  list = sortProducts(list, state.sortBy);

  body.innerHTML = list.length ? list.map(p => `
    <tr class="${isCritical(p)?'row-critical':''}">
      <td>${esc(p.codigo)}</td>
      <td>${esc(p.nombre)}${isCritical(p) ? ' <span class="badge badge-danger">⚠ Stock crítico</span>' : ''}</td>
      <td><span class="badge">${esc(p.categoria)}</span></td>
      <td>${fmtMoney(p.precio)}</td>
      <td>${p.stock} <span class="muted">/ min ${p.stockMin}</span></td>
      <td>${esc(p.ubicacion||'-')}</td>
      <td>${esc(p.proveedor||'-')}</td>
      <td class="row-actions">
        <button class="icon-btn" data-edit="${p.id}" title="Editar">✏️</button>
        <button class="icon-btn" data-del="${p.id}" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="8" class="muted center">No se encontraron productos.</td></tr>`;

  body.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openProductForm(DB.getProduct(b.dataset.edit))));
  body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    const ok = await confirmDialog('¿Eliminar este producto? Esta acción no se puede deshacer.');
    if(ok){ DB.deleteProduct(b.dataset.del); toast('Producto eliminado'); draw(); }
  }));
}

function openProductForm(product){
  const editing = !!product;
  const cats = DB.getCategories();
  const provs = DB.getSuppliers();
  openModal({
    title: editing ? 'Editar producto' : 'Nuevo producto',
    bodyHTML: `
      <form id="productForm" class="form-grid">
        <label>Código<input required name="codigo" value="${product?.codigo||''}" /></label>
        <label>Nombre<input required name="nombre" value="${product?.nombre||''}" /></label>
        <label>Categoría<select name="categoria">${cats.map(c=>`<option ${product?.categoria===c?'selected':''}>${c}</option>`).join('')}</select></label>
        <label>Proveedor<select name="proveedor">${provs.map(p=>`<option ${product?.proveedor===p.nombre?'selected':''}>${p.nombre}</option>`).join('')}</select></label>
        <label>Precio<input required type="number" min="0" name="precio" value="${product?.precio??0}" /></label>
        <label>Stock<input required type="number" min="0" name="stock" value="${product?.stock??0}" /></label>
        <label>Stock mínimo<input required type="number" min="0" name="stockMin" value="${product?.stockMin??0}" /></label>
        <label>Ubicación en bodega<input name="ubicacion" value="${product?.ubicacion||''}" /></label>
      </form>
    `,
    footerHTML: `<button class="btn btn-ghost" id="cancelForm">Cancelar</button><button class="btn btn-primary" id="saveForm">Guardar</button>`,
    onMount(overlay){
      overlay.querySelector('#cancelForm').onclick = closeModal;
      overlay.querySelector('#saveForm').onclick = () => {
        const form = overlay.querySelector('#productForm');
        if(!form.reportValidity()) return;
        const fd = new FormData(form);
        const data = Object.fromEntries(fd.entries());
        data.precio = Number(data.precio); data.stock = Number(data.stock); data.stockMin = Number(data.stockMin);
        if(editing){ DB.updateProduct(product.id, data); toast('Producto actualizado'); }
        else { DB.addProduct(data); toast('Producto agregado'); }
        closeModal();
        draw();
      };
    }
  });
}

function openCategoriesModal(){
  const render = () => {
    const cats = DB.getCategories();
    return `
      <div class="cat-list">${cats.map(c=>`<span class="chip">${esc(c)} <button data-delcat="${esc(c)}">✕</button></span>`).join('') || '<p class="muted">Sin categorías.</p>'}</div>
      <form id="catForm" class="inline-form"><input name="cat" placeholder="Nueva categoría" required /><button class="btn btn-primary" type="submit">Agregar</button></form>
    `;
  };
  openModal({
    title: 'Categorías',
    bodyHTML: render(),
    onMount(overlay){
      const bind = () => {
        overlay.querySelector('#catForm').onsubmit = (e) => {
          e.preventDefault();
          const val = e.target.cat.value.trim();
          if(val){ DB.addCategory(val); overlay.querySelector('.modal-body').innerHTML = render(); bind(); draw(); }
        };
        overlay.querySelectorAll('[data-delcat]').forEach(b => b.onclick = () => {
          DB.deleteCategory(b.dataset.delcat);
          overlay.querySelector('.modal-body').innerHTML = render(); bind(); draw();
        });
      };
      bind();
    }
  });
}
