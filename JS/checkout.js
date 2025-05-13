document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario está autenticado
  if (!isAuthenticated()) {
    alert('Debes iniciar sesión para continuar con la compra');
    window.location.href = 'auth/login.html';
    return;
  }

  // Verificar si hay productos en el carrito
  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    alert('Tu carrito está vacío');
    window.location.href = 'catalog.html';
    return;
  }

  // Inicializar la página
  cargarResumenPedido();
  cargarDatosUsuario();
  configurarFormulario();
});

// Cargar el resumen del pedido en la columna derecha
function cargarResumenPedido() {
  const carrito = obtenerCarrito();
  const orderItemsContainer = document.querySelector('.order-items');
  const subtotalElement = document.getElementById('subtotal');
  const shippingCostElement = document.getElementById('shipping-cost');
  const totalElement = document.getElementById('total');

  // Limpiar contenedor
  orderItemsContainer.innerHTML = '';

  // Agregar cada producto al resumen
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

  // Calcular y mostrar totales
  const subtotal = calcularTotal();
  let shippingCost = 0;
  
  // Verificar tipo de entrega seleccionado
  const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
  if (deliveryType === 'delivery') {
    shippingCost = 30; // Costo fijo de envío
  }
  
  const total = subtotal + shippingCost;
  
  subtotalElement.textContent = `$${subtotal.toFixed(2)} MXN`;
  shippingCostElement.textContent = `$${shippingCost.toFixed(2)} MXN`;
  totalElement.textContent = `$${total.toFixed(2)} MXN`;
  
  // Mostrar/ocultar costo de envío según tipo de entrega
  document.getElementById('shipping-cost-container').style.display = 
    deliveryType === 'delivery' ? 'flex' : 'none';
}

// Cargar datos del usuario si está autenticado
async function cargarDatosUsuario() {
  try {
    const userId = getUserId();
    if (!userId) return;
    
    // Obtener token de autenticación
    const token = localStorage.getItem('authToken');
    
    // Hacer petición a la API para obtener datos del usuario
    const response = await fetch(`https://localhost:44370/api/usuarios/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Error al obtener datos del usuario');
    
    const usuario = await response.json();
    
    // Rellenar campos del formulario con datos del usuario
    document.getElementById('nombre').value = usuario.nombre || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('telefono').value = usuario.telefono || '';
    
    // Si hay dirección guardada
    if (usuario.direccion) {
      document.getElementById('calle').value = usuario.direccion.calle || '';
      document.getElementById('colonia').value = usuario.direccion.colonia || '';
      document.getElementById('ciudad').value = usuario.direccion.ciudad || '';
      document.getElementById('estado').value = usuario.direccion.estado || '';
      document.getElementById('cp').value = usuario.direccion.cp || '';
    }
    
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    // No mostrar error al usuario, simplemente dejar el formulario vacío
  }
}

// Configurar comportamiento del formulario
function configurarFormulario() {
  // Mostrar/ocultar sección de dirección según tipo de entrega
  const deliveryTypeInputs = document.querySelectorAll('input[name="deliveryType"]');
  const direccionGroup = document.getElementById('direccion-group');
  
  // Función para actualizar visibilidad de campos de dirección
  function actualizarCamposDireccion() {
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    direccionGroup.style.display = deliveryType === 'delivery' ? 'block' : 'none';
    
    // Actualizar requeridos en campos de dirección
    const direccionInputs = direccionGroup.querySelectorAll('input');
    direccionInputs.forEach(input => {
      input.required = deliveryType === 'delivery';
    });
    
    // Actualizar resumen con costo de envío
    cargarResumenPedido();
  }
  
  // Inicializar estado
  actualizarCamposDireccion();
  
  // Escuchar cambios en tipo de entrega
  deliveryTypeInputs.forEach(input => {
    input.addEventListener('change', actualizarCamposDireccion);
  });
  
  // Manejar envío del formulario
  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para continuar');
      window.location.href = 'auth/login.html';
      return;
    }
    
    // Recopilar datos del formulario
    const formData = new FormData(e.target);
    const pedidoData = {
      userId: getUserId(),
      tipoEntrega: formData.get('deliveryType'),
      nombre: formData.get('nombre'),
      telefono: formData.get('telefono'),
      email: formData.get('email'),
      comentarios: formData.get('comentarios'),
      productos: obtenerCarrito(),
      total: calcularTotal(),
      fecha: new Date().toISOString()
    };
    
    // Si es delivery, agregar dirección
    if (pedidoData.tipoEntrega === 'delivery') {
      pedidoData.direccion = {
        calle: formData.get('calle'),
        colonia: formData.get('colonia'),
        ciudad: formData.get('ciudad'),
        estado: formData.get('estado'),
        cp: formData.get('cp'),
        referencias: formData.get('referencias')
      };
      
      // Agregar costo de envío
      pedidoData.costoEnvio = 30;
      pedidoData.total += pedidoData.costoEnvio;
    }
    
    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      
      // Enviar pedido a la API
      const response = await fetch('https://localhost:44370/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pedidoData)
      });
      
      if (!response.ok) throw new Error('Error al procesar el pedido');
      
      const pedidoResponse = await response.json();
      
      // Vaciar carrito
      vaciarCarrito();
      
      // Redirigir a página de confirmación
      window.location.href = `order-confirmation.html?id=${pedidoResponse.id}`;
      
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Ocurrió un error al procesar tu pedido. Por favor, intenta nuevamente.');
    }
  });
}