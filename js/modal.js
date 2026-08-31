export function openModal({ title, bodyHTML, onMount, footerHTML }){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'activeModal';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-head">
        <h3>${title}</h3>
        <button class="icon-btn" id="modalClose">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add('no-scroll');
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
  overlay.querySelector('#modalClose').addEventListener('click', closeModal);
  if(onMount) onMount(overlay);
  return overlay;
}

export function closeModal(){
  const m = document.getElementById('activeModal');
  if(m){ m.remove(); document.body.classList.remove('no-scroll'); }
}

export function confirmDialog(message){
  return new Promise((resolve) => {
    openModal({
      title: 'Confirmar acción',
      bodyHTML: `<p>${message}</p>`,
      footerHTML: `<button class="btn btn-ghost" id="cDlgNo">Cancelar</button><button class="btn btn-danger" id="cDlgYes">Eliminar</button>`,
      onMount(overlay){
        overlay.querySelector('#cDlgNo').onclick = () => { closeModal(); resolve(false); };
        overlay.querySelector('#cDlgYes').onclick = () => { closeModal(); resolve(true); };
      }
    });
  });
}
