document.addEventListener('DOMContentLoaded', () => {
  // Obtener el ID del producto de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const productoId = urlParams.get('id');
  
  if (productoId) {
    cargarDetallesProducto(productoId);
  } else {
    document.querySelector('.product-container').innerHTML = '<p>Producto no encontrado</p>';
  }
  
  // Agregar evento al botón de agregar al carrito
  const addToCartBtn = document.getElementById('add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', agregarProductoActualAlCarrito);
  }
});

async function cargarDetallesProducto(id) {
  try {
    const response = await fetch(`https://localhost:44370/api/jugos/${id}`);
    if (!response.ok) throw new Error('Error al obtener el producto');
    
    const producto = await response.json();
    mostrarDetallesProducto(producto);
  } catch (error) {
    console.error('Error al cargar el producto:', error);
    document.querySelector('.product-container').innerHTML = '<p>Error al cargar el producto</p>';
  }
}

function mostrarDetallesProducto(producto) {
  const productImage = document.querySelector('.product-image img');
  const productTitle = document.querySelector('.product-details h1');
  const productPrice = document.querySelector('.product-details .price');
  const productDesc = document.querySelector('.product-details .desc');
  const ingredientsList = document.querySelector('.ingredients');
  
  // Actualizar la imagen
  if (productImage) {
    productImage.src = producto.imagenUrl ? `IMG/${producto.imagenUrl}` : 'IMG/default.png';
    productImage.alt = producto.nombre;
  }
  
  // Actualizar texto
  if (productTitle) productTitle.textContent = producto.nombre;
  if (productPrice) productPrice.textContent = `$${producto.precio.toFixed(2)} MXN`;
  if (productDesc) productDesc.textContent = producto.descripcion;
  
  // Actualizar ingredientes
  if (ingredientsList && producto.ingredientes) {
    ingredientsList.innerHTML = '';
    const ingredientes = producto.ingredientes.split(',');
    ingredientes.forEach(ingrediente => {
      const li = document.createElement('li');
      li.textContent = ingrediente.trim();
      ingredientsList.appendChild(li);
    });
  }
  
  // Guardar ID del producto en el botón para usarlo al agregar al carrito
  const addToCartBtn = document.getElementById('add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.dataset.id = producto.id;
    addToCartBtn.dataset.nombre = producto.nombre;
    addToCartBtn.dataset.precio = producto.precio;
    addToCartBtn.dataset.imagen = producto.imagenUrl || 'default.png';
  }
}

function agregarProductoActualAlCarrito() {
  const btn = document.getElementById('add-to-cart');
  const cantidadInput = document.getElementById('quantity');
  
  if (!btn || !cantidadInput) return;
  
  const cantidad = parseInt(cantidadInput.value) || 1;
  
  if (cantidad <= 0) {
    alert('Por favor ingresa una cantidad válida');
    return;
  }
  
  const producto = {
    id: parseInt(btn.dataset.id),
    nombre: btn.dataset.nombre,
    precio: parseFloat(btn.dataset.precio),
    cantidad: cantidad,
    imagen: btn.dataset.imagen
  };
  
  agregarAlCarrito(producto);
  alert(`${cantidad} ${producto.nombre} agregado(s) al carrito`);
}