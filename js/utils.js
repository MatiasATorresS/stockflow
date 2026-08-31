export const fmtMoney = n => '$' + Number(n||0).toLocaleString('es-CL');
export const fmtDate = d => new Date(d).toLocaleDateString('es-CL');
export const todayISO = () => new Date().toISOString().slice(0,10);
export const uid = p => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
export const $ = (sel, ctx=document) => ctx.querySelector(sel);
export const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const ESC_MAP = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
export const esc = s => String(s??'').replace(/[&<>"']/g, c => ESC_MAP[c]);
export function toast(msg, type='ok'){
  let box = document.getElementById('toastBox');
  if(!box){ box=document.createElement('div'); box.id='toastBox'; box.className='toast-box'; document.body.appendChild(box); }
  const t=document.createElement('div');
  t.className='toast toast-'+type;
  t.textContent=msg;
  box.appendChild(t);
  setTimeout(()=>t.classList.add('show'),10);
  setTimeout(()=>{t.classList.remove('show'); setTimeout(()=>t.remove(),300);},2500);
}
export function monthKey(d){ const dt=new Date(d); return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0'); }
