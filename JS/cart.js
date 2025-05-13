// Funciones para manejar el carrito usando localStorage

// Estructura del carrito:
// [
//   {
//     id: number,
//     nombre: string,
//     precio: number,
//     cantidad: number,
//     imagen: string
//   }
// ]

// Obtener el carrito actual o crear uno nuevo si no existe
function obtenerCarrito() {
  const carrito = localStorage.getItem('carrito');
  return carrito ? JSON.parse(carrito) : [];
}

// Guardar el carrito en localStorage
function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Agregar un producto al carrito
function agregarAlCarrito(producto) {
  const carrito = obtenerCarrito();
  
  // Verificar si el producto ya está en el carrito
  const indiceExistente = carrito.findIndex(item => item.id === producto.id);
  
  if (indiceExistente >= 0) {
    // Si ya existe, incrementar la cantidad
    carrito[indiceExistente].cantidad += producto.cantidad;
  } else {
    // Si no existe, agregar al carrito
    carrito.push(producto);
  }
  
  guardarCarrito(carrito);
  actualizarContadorCarrito();
}

// Eliminar un producto del carrito
function eliminarDelCarrito(id) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => item.id !== id);
  guardarCarrito(carrito);
  actualizarContadorCarrito();
  return carrito;
}

// Actualizar la cantidad de un producto
function actualizarCantidad(id, cantidad) {
  const carrito = obtenerCarrito();
  const indice = carrito.findIndex(item => item.id === id);
  
  if (indice >= 0) {
    carrito[indice].cantidad = cantidad;
    guardarCarrito(carrito);
  }
  
  return carrito;
}

// Calcular el total del carrito
function calcularTotal() {
  const carrito = obtenerCarrito();
  return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

// Vaciar el carrito
function vaciarCarrito() {
  localStorage.removeItem('carrito');
  actualizarContadorCarrito();
}

// Actualizar contador de productos en el carrito (para mostrar en el navbar)
function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
  
  // Aquí puedes actualizar algún elemento visual que muestre la cantidad
  // Por ejemplo, si tienes un span con id "cart-count":
  const contadorElement = document.getElementById('cart-count');
  if (contadorElement) {
    contadorElement.textContent = cantidadTotal;
    contadorElement.style.display = cantidadTotal > 0 ? 'inline-block' : 'none';
  }
}

// Inicializar contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
});