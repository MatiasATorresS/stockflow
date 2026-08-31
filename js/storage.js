import { uid, todayISO } from './utils.js';

const KEYS = {
  products: 'sf_products',
  suppliers: 'sf_suppliers',
  categories: 'sf_categories',
  movements: 'sf_movements',
  theme: 'sf_theme'
};

function get(key, fallback){
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e){ return fallback; }
}
function set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }

function seedIfEmpty(){
  if(get(KEYS.categories, null)) return;
  const categories = ['Electrónica','Alimentos','Ropa','Herramientas','Papelería'];
  const suppliers = [
    {id: uid('sup'), nombre:'TechImport SPA', telefono:'+56 9 1234 5678', correo:'ventas@techimport.cl', direccion:'Av. Providencia 1234, Santiago'},
    {id: uid('sup'), nombre:'Distribuidora Andina', telefono:'+56 9 8765 4321', correo:'contacto@andina.cl', direccion:'Av. Matta 500, Santiago'}
  ];
  const products = [
    {codigo:'MOU-001', nombre:'Mouse Logitech M170', categoria:'Electrónica', precio:8990, stock:42, stockMin:10, proveedor:suppliers[0].nombre, ubicacion:'A1-03'},
    {codigo:'TEC-002', nombre:'Teclado Redragon K552', categoria:'Electrónica', precio:24990, stock:8, stockMin:10, proveedor:suppliers[0].nombre, ubicacion:'A1-05'},
    {codigo:'ARR-003', nombre:'Arroz Grado 1 1kg', categoria:'Alimentos', precio:1290, stock:120, stockMin:30, proveedor:suppliers[1].nombre, ubicacion:'B2-01'},
    {codigo:'POL-004', nombre:'Polera Algodón M', categoria:'Ropa', precio:6990, stock:15, stockMin:5, proveedor:suppliers[1].nombre, ubicacion:'C1-02'},
    {codigo:'TAL-005', nombre:'Taladro Percutor 650W', categoria:'Herramientas', precio:39990, stock:4, stockMin:5, proveedor:suppliers[0].nombre, ubicacion:'D3-01'},
    {codigo:'CUA-006', nombre:'Cuaderno Universitario', categoria:'Papelería', precio:1990, stock:60, stockMin:20, proveedor:suppliers[1].nombre, ubicacion:'E1-04'}
  ].map(p=>({...p, id: uid('prod'), fechaCreacion: todayISO()}));

  const movements = [];
  set(KEYS.categories, categories);
  set(KEYS.suppliers, suppliers);
  set(KEYS.products, products);
  set(KEYS.movements, movements);
}
seedIfEmpty();

export const DB = {
  // Productos
  getProducts: () => get(KEYS.products, []),
  saveProducts: (arr) => set(KEYS.products, arr),
  addProduct(p){ const arr=this.getProducts(); arr.push({...p, id:uid('prod'), fechaCreacion: todayISO()}); this.saveProducts(arr); },
  updateProduct(id, data){ const arr=this.getProducts().map(p=>p.id===id?{...p,...data}:p); this.saveProducts(arr); },
  deleteProduct(id){ this.saveProducts(this.getProducts().filter(p=>p.id!==id)); },
  getProduct(id){ return this.getProducts().find(p=>p.id===id); },

  // Proveedores
  getSuppliers: () => get(KEYS.suppliers, []),
  saveSuppliers: (arr) => set(KEYS.suppliers, arr),
  addSupplier(s){ const arr=this.getSuppliers(); arr.push({...s, id:uid('sup')}); this.saveSuppliers(arr); },
  updateSupplier(id, data){ this.saveSuppliers(this.getSuppliers().map(s=>s.id===id?{...s,...data}:s)); },
  deleteSupplier(id){ this.saveSuppliers(this.getSuppliers().filter(s=>s.id!==id)); },

  // Categorías
  getCategories: () => get(KEYS.categories, []),
  saveCategories: (arr) => set(KEYS.categories, arr),
  addCategory(name){ const arr=this.getCategories(); if(!arr.includes(name)){ arr.push(name); this.saveCategories(arr);} },
  deleteCategory(name){ this.saveCategories(this.getCategories().filter(c=>c!==name)); },

  // Movimientos (entradas/salidas)
  getMovements: () => get(KEYS.movements, []),
  saveMovements: (arr) => set(KEYS.movements, arr),
  addMovement(m){ const arr=this.getMovements(); arr.unshift({...m, id:uid('mov')}); this.saveMovements(arr); },

  // Tema
  getTheme: () => get(KEYS.theme, 'light'),
  setTheme: (t) => set(KEYS.theme, t),
};

// Lógica de negocio de inventario
export function registrarEntrada({productId, cantidad, proveedor, fecha, observacion}){
  const p = DB.getProduct(productId);
  if(!p) throw new Error('Producto no encontrado');
  cantidad = Number(cantidad);
  DB.updateProduct(productId, { stock: p.stock + cantidad });
  DB.addMovement({ tipo:'entrada', productId, producto:p.nombre, codigo:p.codigo, cantidad, proveedor, fecha: fecha||todayISO(), observacion: observacion||'' });
}

export function registrarSalida({productId, cantidad, destino, fecha}){
  const p = DB.getProduct(productId);
  if(!p) throw new Error('Producto no encontrado');
  cantidad = Number(cantidad);
  if(cantidad > p.stock) throw new Error('Stock insuficiente. Disponible: ' + p.stock);
  DB.updateProduct(productId, { stock: p.stock - cantidad });
  DB.addMovement({ tipo:'salida', productId, producto:p.nombre, codigo:p.codigo, cantidad, destino, fecha: fecha||todayISO() });
}

export function isCritical(p){ return Number(p.stock) <= Number(p.stockMin); }
