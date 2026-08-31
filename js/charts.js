import { DB } from './storage.js';
import { monthKey } from './utils.js';

function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

const chartInstances = {};
function getOrCreate(canvasId, config){
  if(chartInstances[canvasId]) chartInstances[canvasId].destroy();
  const ctx = document.getElementById(canvasId);
  if(!ctx) return null;
  chartInstances[canvasId] = new Chart(ctx, config);
  return chartInstances[canvasId];
}

export function renderMovementsChart(canvasId){
  const movs = DB.getMovements();
  const now = new Date();
  const months = [];
  for(let i=5;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    months.push(monthKey(d));
  }
  const labels = months.map(m => {
    const [y,mo] = m.split('-');
    return new Date(y, mo-1).toLocaleDateString('es-CL',{month:'short'});
  });
  const entradas = months.map(mk => movs.filter(m=>m.tipo==='entrada' && monthKey(m.fecha)===mk).reduce((s,m)=>s+Number(m.cantidad),0));
  const salidas = months.map(mk => movs.filter(m=>m.tipo==='salida' && monthKey(m.fecha)===mk).reduce((s,m)=>s+Number(m.cantidad),0));

  getOrCreate(canvasId, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label:'Entradas', data:entradas, borderColor: cssVar('--accent'), backgroundColor: cssVar('--accent')+'33', tension:.35, fill:true },
        { label:'Salidas', data:salidas, borderColor: cssVar('--danger'), backgroundColor: cssVar('--danger')+'33', tension:.35, fill:true },
      ]
    },
    options: { responsive:true, plugins:{legend:{labels:{color:cssVar('--text-muted')}}}, scales:{
      x:{ticks:{color:cssVar('--text-muted')}, grid:{color:cssVar('--border')}},
      y:{ticks:{color:cssVar('--text-muted')}, grid:{color:cssVar('--border')}}
    }}
  });
}

export function renderTopProductsChart(canvasId){
  const movs = DB.getMovements();
  const totals = {};
  movs.forEach(m => { totals[m.producto] = (totals[m.producto]||0) + Number(m.cantidad); });
  const top = Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  getOrCreate(canvasId, {
    type: 'bar',
    data: { labels: top.map(t=>t[0]), datasets:[{ label:'Movimientos', data: top.map(t=>t[1]), backgroundColor: cssVar('--accent') }] },
    options: { responsive:true, indexAxis:'y', plugins:{legend:{display:false}}, scales:{
      x:{ticks:{color:cssVar('--text-muted')}, grid:{color:cssVar('--border')}},
      y:{ticks:{color:cssVar('--text-muted')}, grid:{display:false}}
    }}
  });
}

export function renderCategoryStockChart(canvasId){
  const products = DB.getProducts();
  const cats = DB.getCategories();
  const data = cats.map(c => products.filter(p=>p.categoria===c).reduce((s,p)=>s+Number(p.stock),0));
  const palette = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#a855f7'];
  getOrCreate(canvasId, {
    type: 'doughnut',
    data: { labels: cats, datasets:[{ data, backgroundColor: palette }] },
    options: { responsive:true, plugins:{legend:{position:'bottom', labels:{color:cssVar('--text-muted')}}} }
  });
}
