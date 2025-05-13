document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario está autenticado
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  // Obtener ID del pedido de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  if (!orderId) {
    window.location.href = 'orders/orders.html';
    return;
  }

  // Cargar detalles del pedido
  cargarDetallesPedido(orderId);
});

async function cargarDetallesPedido(orderId) {
  try {
    // Obtener token de autenticación
    const token = localStorage.getItem('authToken');
    
    // Hacer petición a la API para obtener detalles del pedido
    const response = await fetch(`https://localhost:44370/api/ordenes/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    debugger;
    if (!response.ok) throw new Error('Error al obtener detalles del pedido');
    
    const pedido = await response.json();
    
    // Mostrar detalles del pedido
    document.getElementById('order-id').textContent = pedido.id;
    
    // Formatear fecha
    const fecha = new Date(pedido.fechaOrden);
    document.getElementById('order-date').textContent = fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Mostrar total
    document.getElementById('order-total').textContent = `$${pedido.total.toFixed(2)} MXN`;
    
    // Mostrar tipo de entrega
    const tipoEntrega = pedido.tipoEntrega === 'pickup' ? 'Recoger en tienda' : 'Entrega a domicilio';
    document.getElementById('delivery-type').textContent = tipoEntrega;
    
  } catch (error) {
    console.error('Error al cargar detalles del pedido:', error);
    document.querySelector('.confirmation-message').textContent = 
      'No pudimos cargar los detalles de tu pedido, pero ha sido registrado correctamente.';
  }
}