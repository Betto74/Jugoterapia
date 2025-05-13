document.addEventListener('DOMContentLoaded', () => {
  if (!isAuthenticated()) {
    alert('Debes iniciar sesión para continuar con la compra');
    window.location.href = 'auth/login.html';
    return;
  }

  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    alert('Tu carrito está vacío');
    window.location.href = 'catalog.html';
    return;
  }

  cargarResumenPedido();
  cargarDatosUsuario();
  configurarFormulario();
});

function cargarResumenPedido() {
  const carrito = obtenerCarrito();
  const orderItemsContainer = document.querySelector('.order-items');
  const subtotalElement = document.getElementById('subtotal');
  const shippingCostElement = document.getElementById('shipping-cost');
  const totalElement = document.getElementById('total');

  orderItemsContainer.innerHTML = '';

  carrito.forEach(item => {
    const orderItem = document.createElement('div');
    orderItem.classList.add('order-item');
    orderItem.innerHTML = `
      <img src="IMG/${item.imagen}" alt="${item.nombre}" class="order-item-image">
      <div class="order-item-details">
        <h4 class="order-item-name">${item.nombre}</h4>
        <p class="order-item-price">$${item.precio.toFixed(2)} MXN</p>
        <span class="order-item-quantity">Cantidad: ${item.cantidad}</span>
      </div>
    `;
    orderItemsContainer.appendChild(orderItem);
  });

  const subtotal = calcularTotal();
  let shippingCost = 0;

  const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
  if (deliveryType === 'delivery') {
    shippingCost = 30;
  }

  const total = subtotal + shippingCost;

  subtotalElement.textContent = `$${subtotal.toFixed(2)} MXN`;
  shippingCostElement.textContent = `$${shippingCost.toFixed(2)} MXN`;
  totalElement.textContent = `$${total.toFixed(2)} MXN`;

  document.getElementById('shipping-cost-container').style.display =
    deliveryType === 'delivery' ? 'flex' : 'none';
}

async function cargarDatosUsuario() {
  try {
    const userId = getUserId();
    if (!userId) return;

    const token = localStorage.getItem('authToken');

    const response = await fetch(`https://localhost:44370/api/clientes/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Error al obtener datos del usuario');

    const usuario = await response.json();

    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('telefono').value = usuario.telefono || '';

    if (usuario.direccion) {
      document.getElementById('calle').value = usuario.direccion.calle || '';
      document.getElementById('colonia').value = usuario.direccion.colonia || '';
      document.getElementById('ciudad').value = usuario.direccion.ciudad || '';
      document.getElementById('estado').value = usuario.direccion.estado || '';
      document.getElementById('cp').value = usuario.direccion.cp || '';
    }

  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
  }
}

function configurarFormulario() {
  const deliveryTypeInputs = document.querySelectorAll('input[name="deliveryType"]');
  const direccionGroup = document.getElementById('direccion-group');

  function actualizarCamposDireccion() {
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    direccionGroup.style.display = deliveryType === 'delivery' ? 'block' : 'none';

    const direccionInputs = direccionGroup.querySelectorAll('input');
    direccionInputs.forEach(input => {
      input.required = deliveryType === 'delivery';
    });

    cargarResumenPedido();
  }

  actualizarCamposDireccion();

  deliveryTypeInputs.forEach(input => {
    input.addEventListener('change', actualizarCamposDireccion);
  });

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para continuar');
      window.location.href = 'auth/login.html';
      return;
    }

    const formData = new FormData(e.target);
    const tipoEntrega = formData.get('deliveryType');
    const carrito = obtenerCarrito();

    const items = carrito.map(producto => ({
      jugoId: producto.id,
      cantidad: producto.cantidad
    }));

    let direccionEntrega = null;
    if (tipoEntrega === 'delivery') {
      direccionEntrega = `${formData.get('calle')}, ${formData.get('colonia')}, ${formData.get('ciudad')}, ${formData.get('estado')}, CP: ${formData.get('cp')}`;
    }

    const ordenRequest = {
      clienteId: getUserId(),
      tipoEntrega: tipoEntrega === 'delivery' ? 1 : 0,
      direccionEntrega: direccionEntrega,
      items: items
    };

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch('https://localhost:44370/api/ordenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ordenRequest)
      });

      if (!response.ok) throw new Error('Error al procesar la orden');

      const ordenGuardada = await response.json();
      vaciarCarrito();
      window.location.href = `order-confirmation.html?id=${ordenGuardada.id}`;

    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Ocurrió un error al procesar tu pedido. Por favor, intenta nuevamente.');
    }
  });
}
