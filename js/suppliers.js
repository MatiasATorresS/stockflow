import { DB } from './storage.js';
import { toast, esc } from './utils.js';
import { openModal, closeModal, confirmDialog } from './modal.js';

export function renderSuppliers(){
  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="page-head">
      <h1>Proveedores</h1>
      <button class="btn btn-primary" id="btnNuevoProv">+ Nuevo proveedor</button>
    </div>
    <div class="card table-card">
      <table class="data-table">
        <thead><tr><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Dirección</th><th></th></tr></thead>
        <tbody id="suppliersBody"></tbody>
      </table>
    </div>
  `;
  el.querySelector('#btnNuevoProv').addEventListener('click', () => openSupplierForm());
  draw();
}

function draw(){
  const body = document.getElementById('suppliersBody');
  const list = DB.getSuppliers();
  body.innerHTML = list.length ? list.map(s => `
    <tr>
      <td>${esc(s.nombre)}</td><td>${esc(s.telefono||'-')}</td><td>${esc(s.correo||'-')}</td><td>${esc(s.direccion||'-')}</td>
      <td class="row-actions">
        <button class="icon-btn" data-edit="${s.id}">✏️</button>
        <button class="icon-btn" data-del="${s.id}">🗑️</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="5" class="muted center">No hay proveedores.</td></tr>`;

  body.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openSupplierForm(list.find(s=>s.id===b.dataset.edit))));
  body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    const ok = await confirmDialog('¿Eliminar este proveedor?');
    if(ok){ DB.deleteSupplier(b.dataset.del); toast('Proveedor eliminado'); draw(); }
  }));
}

function openSupplierForm(supplier){
  const editing = !!supplier;
  openModal({
    title: editing ? 'Editar proveedor' : 'Nuevo proveedor',
    bodyHTML: `
      <form id="supForm" class="form-grid">
        <label>Nombre<input required name="nombre" value="${supplier?.nombre||''}" /></label>
        <label>Teléfono<input name="telefono" value="${supplier?.telefono||''}" /></label>
        <label>Correo<input type="email" name="correo" value="${supplier?.correo||''}" /></label>
        <label>Dirección<input name="direccion" value="${supplier?.direccion||''}" /></label>
      </form>
    `,
    footerHTML: `<button class="btn btn-ghost" id="cancelForm">Cancelar</button><button class="btn btn-primary" id="saveForm">Guardar</button>`,
    onMount(overlay){
      overlay.querySelector('#cancelForm').onclick = closeModal;
      overlay.querySelector('#saveForm').onclick = () => {
        const form = overlay.querySelector('#supForm');
        if(!form.reportValidity()) return;
        const data = Object.fromEntries(new FormData(form).entries());
        if(editing){ DB.updateSupplier(supplier.id, data); toast('Proveedor actualizado'); }
        else { DB.addSupplier(data); toast('Proveedor agregado'); }
        closeModal(); draw();
      };
    }
  });
}
