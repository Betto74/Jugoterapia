document.addEventListener('DOMContentLoaded', () => {
  mostrarProductosCarrito();
  
  // Evento para vaciar carrito
  const vaciarBtn = document.getElementById('vaciar-carrito');
  if (vaciarBtn) {
    vaciarBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
        vaciarCarrito();
        mostrarProductosCarrito();
      }
    });
  }
  
  // Evento para proceder al pago
  const checkoutBtn = document.querySelector('.cart-summary .btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Verificar si hay productos en el carrito
      const carrito = obtenerCarrito();
      if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
      }
      
      // Redirigir a la página de checkout
      window.location.href = 'checkout.html';
    });
  }
});

function mostrarProductosCarrito() {
  const carrito = obtenerCarrito();
  const tbody = document.querySelector('.cart-table tbody');
  const totalElement = document.querySelector('.total-amount');
  
  if (!tbody || !totalElement) return;
  
  // Limpiar tabla
  tbody.innerHTML = '';
  
  if (carrito.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tu carrito está vacío</td></tr>';
    totalElement.textContent = '$0.00 MXN';
    return;
  }
  
  // Agregar productos al tbody
  carrito.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cart-item">
        <img src="IMG/${item.imagen}" alt="${item.nombre}" />
        <div class="cart-item-info">
          <h4>${item.nombre}</h4>
        </div>
      </td>
      <td>$${item.precio.toFixed(2)} MXN</td>
      <td>
        <input type="number" value="${item.cantidad}" min="1" class="quantity-input" data-id="${item.id}" />
      </td>
      <td>$${(item.precio * item.cantidad).toFixed(2)} MXN</td>
      <td>
        <button class="btn-small-delete remove-btn" data-id="${item.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Actualizar total
  const total = calcularTotal();
  totalElement.textContent = `$${total.toFixed(2)} MXN`;
  
  // Agregar eventos a los botones de eliminar
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      eliminarDelCarrito(id);
      mostrarProductosCarrito();
    });
  });
  
  // Agregar eventos a los inputs de cantidad
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = parseInt(e.target.dataset.id);
      const cantidad = parseInt(e.target.value) || 1;
      
      if (cantidad <= 0) {
        e.target.value = 1;
        actualizarCantidad(id, 1);
      } else {
        actualizarCantidad(id, cantidad);
      }
      
      mostrarProductosCarrito();
    });
  });
}