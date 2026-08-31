export function searchProducts(products, term){
  if(!term) return products;
  term = term.toLowerCase();
  return products.filter(p =>
    p.nombre.toLowerCase().includes(term) ||
    p.codigo.toLowerCase().includes(term) ||
    (p.proveedor||'').toLowerCase().includes(term) ||
    (p.categoria||'').toLowerCase().includes(term)
  );
}

export function sortProducts(products, sortBy){
  const arr = [...products];
  switch(sortBy){
    case 'nombre-asc': return arr.sort((a,b)=>a.nombre.localeCompare(b.nombre));
    case 'nombre-desc': return arr.sort((a,b)=>b.nombre.localeCompare(a.nombre));
    case 'stock-asc': return arr.sort((a,b)=>a.stock-b.stock);
    case 'stock-desc': return arr.sort((a,b)=>b.stock-a.stock);
    case 'precio-asc': return arr.sort((a,b)=>a.precio-b.precio);
    case 'precio-desc': return arr.sort((a,b)=>b.precio-a.precio);
    default: return arr;
  }
}

export function filterProducts(products, { categoria, proveedor, criticos }){
  return products.filter(p => {
    if(categoria && p.categoria !== categoria) return false;
    if(proveedor && p.proveedor !== proveedor) return false;
    if(criticos && p.stock > p.stockMin) return false;
    return true;
  });
}
