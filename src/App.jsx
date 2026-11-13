import React, { useState, useEffect } from 'react';

// Número de WhatsApp configurado (México +52)
const TELEFONO_NEGOCIO = "527121717056";

export default function CatalogoHamburguesas() {
  const [productos, setProductos] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [nombreCliente, setNombreCliente] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Carga de datos desde Google Sheets (Sustituir TU_SHEET_ID)
  useEffect(() => {
   // Únicamente el ID de la hoja, sin la URL completa
const SHEET_ID = "128V74RhQFZPgqw2cUXkKMt6s1CaZ6UMND6qhKMm1qoc";

fetch(`https://opensheet.elk.sh/${SHEET_ID}/Hoja1`)
      .then((res) => res.json())
      .then((data) => {
        const activos = data.filter(p => p.disponible?.toLowerCase() === 'true');
        setProductos(activos);
      })
      .catch((err) => console.error("Error al cargar Google Sheets:", err));
  }, []);

  // Agregar al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  // Modificar cantidades
  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Cálculos de totales
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrecio = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  // Formateador y enviador del mensaje a WhatsApp
  const enviarPedidoWhatsApp = (e) => {
    e.preventDefault();
    if (!nombreCliente.trim()) {
      alert("Por favor ingresa tu nombre para el pedido.");
      return;
    }

    let msg = `🍔 *NUEVO PEDIDO - CATÁLOGO DIGITAL* 🍔\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *Cliente:* ${nombreCliente.trim()}\n`;
    msg += `📅 *Fecha:* ${new Date().toLocaleDateString('es-MX')}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `📋 *DETALLE DEL PEDIDO:*\n`;

    carrito.forEach((item) => {
      msg += `▪️ *${item.cantidad}x* ${item.nombre} — *$${item.precio * item.cantidad} MXN*\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *TOTAL A PAGAR:* *$${totalPrecio} MXN*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (observaciones.trim()) {
      msg += `\n📝 *Notas/Especificaciones:* ${observaciones.trim()}\n`;
    }

    msg += `\n_¡Quedo a la espera de su confirmación para preparar el pedido!_`;

    const urlWA = `https://wa.me/${TELEFONO_NEGOCIO}?text=${encodeURIComponent(msg)}`;
    window.open(urlWA, '_blank');
  };

  // Filtrado dinámico
  const productosFiltrados = productos.filter((p) => {
    const coincideCat = categoriaSel === 'Todas' || p.categoria === categoriaSel;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideBusqueda;
  });

  const categorias = ['Todas', ...new Set(productos.map((p) => p.categoria))];

  return (
    <div className="min-h-screen bg-gray-100 pb-24 font-sans">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wide">Burger Express 🍔</h1>
            <p className="text-xs text-red-100">Haz tu pedido directo a WhatsApp</p>
          </div>
        </div>
      </header>

      {/* Buscador y Categorías */}
      <div className="max-w-md mx-auto p-4 space-y-3">
        <input
          type="text"
          placeholder="Buscar hamburguesa, bebida..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                categoriaSel === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <main className="max-w-md mx-auto px-4 grid grid-cols-1 gap-4">
        {productosFiltrados.map((prod) => (
          <div key={prod.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex border border-gray-100">
            <img
              src={prod.imagen_url}
              alt={prod.nombre}
              className="w-28 h-28 object-cover flex-shrink-0"
            />
            <div className="p-3 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{prod.nombre}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{prod.descripcion}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-extrabold text-red-600 text-base">${prod.precio} MXN</span>
                <button
                  onClick={() => agregarAlCarrito(prod)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm transition-transform active:scale-95"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Barra Flotante Inferior del Carrito */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl z-20">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">{totalItems} productos seleccionados</p>
              <p className="text-lg font-black text-gray-800">${totalPrecio} MXN</p>
            </div>
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              Ver Carrito 🛒
            </button>
          </div>
        </div>
      )}

      {/* Modal de Carrito y Checkout */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-800">Tu Pedido</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-grow">
              {carrito.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex-grow pr-2">
                    <p className="font-semibold text-sm text-gray-800">{item.nombre}</p>
                    <p className="text-xs text-gray-500">${item.precio} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(item.id, -1)}
                      className="w-7 h-7 rounded-md bg-gray-200 font-bold text-gray-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.id, 1)}
                      className="w-7 h-7 rounded-md bg-gray-200 font-bold text-gray-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <form id="form-pedido" onSubmit={enviarPedidoWhatsApp} className="mt-4 space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Daniel López"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Instrucciones / Notas adicionales (opcional)
                  </label>
                  <textarea
                    placeholder="Ej. Sin cebolla la hawaiana, catsup extra..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                    rows="2"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t bg-gray-50 space-y-3">
              <div className="flex justify-between text-base font-black text-gray-900">
                <span>Total:</span>
                <span>${totalPrecio} MXN</span>
              </div>
              <button
                type="submit"
                form="form-pedido"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                Confirmar y Enviar a WhatsApp 📲
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}