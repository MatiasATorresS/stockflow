# 📦 StockFlow — Control de Inventario para PYMES

Llevar el control de un inventario a mano es una pesadilla: hojas de cálculo que se desactualizan, productos que se quedan sin stock justo cuando más los necesitas y cero visibilidad de lo que entra y sale. **StockFlow** nace para resolver eso de forma simple.

Es un **sistema de gestión de stock e inventario** pensado para una PYME de venta minorista: catálogo de productos, proveedores, entradas y salidas de mercadería, un historial de movimientos y un dashboard con las cifras más importantes. Todo 100% construido con **HTML, CSS y JavaScript puro** (módulos ES nativos), sin frameworks ni build step, y con los datos guardados en el navegador.

## ✨ Qué hace

- **Dashboard** con las cifras del día de un vistazo: productos registrados, unidades totales en stock, productos en estado crítico, entradas de hoy y salidas de hoy. Acompañado de tres gráficos (movimientos por mes, stock por categoría y productos más movidos).
- **Productos**: alta, edición y eliminación con código, categoría, precio, stock, stock mínimo y ubicación en bodega. Incluye búsqueda en vivo, filtros combinables (categoría, proveedor, "solo stock crítico") y ordenamiento por nombre, stock o precio.
- **Proveedores**: CRUD completo de tus proveedores, que alimentan los productos y los filtros.
- **Entradas de mercadería**: registras una entrada y el stock del producto se suma al instante, con su movimiento en el historial.
- **Salidas de stock**: restas unidades con validación (no deja salir más de lo disponible) y dejas constancia del destino.
- **Historial de movimientos**: cada entrada y salida queda registrada con fecha, producto, cantidad y detalle, con filtro por tipo.
- **Alertas de stock crítico**: cuando un producto llega a su stock mínimo, se marca en rojo en las tablas, aparece una alerta en el encabezado y se refleja en el dashboard. ¡Así nunca te quedas sin ese producto que se vende más!

## 🛠️ Stack

| Tecnología | Uso |
|---|---|
| HTML5 + CSS3 | Estructura y estilos (variables CSS, Grid, Flexbox) |
| JavaScript (ES Modules) | Toda la lógica de la app |
| [Chart.js](https://www.chartjs.org/) v4 | Gráficos del dashboard e historial (vía CDN) |
| LocalStorage API | Persistencia de productos, proveedores, categorías y movimientos |

Sin framework, sin bundler, sin `package.json`, sin backend. Solo un navegador y un servidor estático.

## ▶️ Cómo ejecutarlo

Como el proyecto usa **módulos ES** (`<script type="module">`), necesita servirse por HTTP — no funciona abriendo `index.html` con doble clic. Cualquiera de estas opciones sirve:

```bash
# Opción 1: Python
cd stockflow
python -m http.server 8000
# luego abre http://localhost:8000

# Opción 2: Node (sin instalar nada global)
cd stockflow
npx serve .

# Opción 3: extensión "Live Server" de VS Code
# clic derecho sobre index.html → "Open with Live Server"
```

> ⚠️ La primera carga necesita conexión a internet para descargar **Chart.js** desde el CDN. Si no hay red, la app funciona pero los gráficos no se renderizan.

## 🗄️ Datos y persistencia

Todo se guarda en `localStorage` (claves con prefijo `sf_`). En la primera visita se cargan **datos de ejemplo chilenos** para que no veas todo vacío: 6 productos (Mouse Logitech, Teclado Redragon, Arroz, Polera, Taladro, Cuaderno), 2 proveedores de Santiago y 5 categorías. Algunos productos nacen ya en stock crítico para que veas cómo funcionan las alertas.

Para volver a empezar desde cero, abre la consola del navegador y ejecuta:

```js
localStorage.clear(); location.reload();
```

## 📁 Estructura

```
stockflow/
├── index.html                # Dashboard (página raíz)
├── pages/
│   ├── productos.html         # Catálogo de productos
│   ├── proveedores.html       # Gestión de proveedores
│   ├── entradas.html          # Entradas de mercadería
│   ├── salidas.html           # Salidas de stock
│   └── historial.html         # Historial de movimientos
├── js/
│   ├── app.js                 # Punto de entrada: resuelve la vista por data-page
│   ├── ui.js                  # Layout compartido: sidebar, header, tema, alertas
│   ├── storage.js             # DB + localStorage + datos semilla + lógica de stock
│   ├── utils.js               # Formato de moneda/fecha, IDs, helpers, toasts
│   ├── modal.js               # Modales y diálogos de confirmación
│   ├── filters.js             # Búsqueda, filtros y ordenamiento
│   ├── products.js            # Página Productos
│   ├── suppliers.js           # Página Proveedores
│   ├── inventory.js           # Entradas, Salidas e Historial
│   ├── dashboard.js           # Dashboard (KPIs)
│   └── charts.js              # Gráficos (Chart.js)
└── css/
    ├── main.css               # Variables, layout, sidebar, botones, toasts
    ├── dashboard.css          # Filas críticas y tarjetas
    ├── table.css              # Tablas y toolbar
    ├── forms.css              # Formularios
    ├── modal.css              # Modales
    └── responsive.css         # Adaptación a tablet/móvil
```

## 🧠 Decisiones técnicas

- **Arquitectura multi-página con renderizado por JS**: cada página es un HTML con un atributo `data-page`, y `app.js` decide qué vista renderizar dentro de un mismo shell de layout (sidebar + header). Navegación tradicional, pero una sola estructura visual.
- **Lógica de stock centralizada**: `registrarEntrada()` y `registrarSalida()` en `storage.js` son las únicas responsables de tocar el stock, de modo que las reglas (validar disponibilidad, llevar movimiento) se cumplen siempre.
- **Gráficos con tema dinámico**: los colores se leen de variables CSS, así los gráficos se adaptan solos al tema claro u oscuro.
- **Seguridad ante XSS**: todo dato del usuario se escapa al insertarlo en el HTML (`esc()`), protegiendo contra inyección.
- **Carga perezosa**: `charts.js` se importa dinámicamente solo cuando hace falta (historial y dashboard), manteniendo liviana la carga inicial.
- **Comunicación cross-page con `CustomEvent`**: la búsqueda del header dispara un evento global que la página de productos escucha, sincronizando resultados desde cualquier vista.

## 🎨 Diseño

Interfaz limpia y moderna con **tema claro/oscuro persistente**, totalmente **responsive** (la sidebar se convierte en menú deslizante en móvil). Las alertas de stock crítico usan acentos en rojo para llamar la atención donde importa, los movimientos se distinguen con badges de color (📥 entrada / 📤 salida) y todas las tablas tienen estados vacíos amigables. Moneda en pesos chilenos (CLP) y fechas en formato chileno.

## 🚀 Posibles siguientes pasos

- Mover los datos de `localStorage` a una base de datos real (SQLite/PostgreSQL) con una API REST, para uso multiusuario.
- Exportar/importar el inventario a CSV/JSON como respaldo.
- Códigos de barras para agilizar las entradas y salidas.
- Roles y permisos (admin, encargado de bodega, vendedor).

---

Proyecto desarrollado por **Matías Torres Sandoval** como pieza de portafolio — Ingeniero Civil Informático (UNAB).
