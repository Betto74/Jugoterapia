// auth.js
// Este archivo debe ser incluido en todas las páginas que requieran verificación de autenticación
// y gestión de sesión del usuario. Asegúrate de incluirlo después de la carga de la librería de jQuery.

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario está autenticado, false en caso contrario
 */
function isAuthenticated() {
  return localStorage.getItem('authToken') !== null;
}
/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario está autenticado, false en caso contrario
 */
function isAuthenticated() {
  return localStorage.getItem('authToken') !== null;
}


/**
 * Verifica si el usuario actual es administrador
 * @returns {boolean}
 */
function isAdmin() {
  return localStorage.getItem('userRole') === 'Administrador';
}
/**
 * Obtiene el userId del usuario autenticado
 * @returns {number|null} el ID del usuario o null si no está autenticado
 */
function getUserId() {
  return localStorage.getItem('userId');
}

/**
 * Obtiene el nombre del usuario autenticado
 * @returns {string|null} el nombre del usuario o null si no está autenticado
 */
function getUserName() {
  return localStorage.getItem('userName');
}

/**
 * Obtiene el token de autenticación
 * @returns {string|null} el token JWT o null si no está autenticado
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Cierra la sesión del usuario
 */
function logout() {
  const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
  if (!confirmLogout) return;

  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');



  // Redirigir al inicio o página de login
  window.location.href = 'index.html';
}


/**
 * Configura la interfaz de usuario según el estado de autenticación
 */
function setupUI() {
  const loginItem = document.getElementById('login-item');
  const signupItem = document.getElementById('signup-item');
  const logoutItem = document.getElementById('logout-item');
  const logoutSeparator = document.getElementById('logout-separator');
  const ordersItem = document.getElementById('orders-item');
  const cartItem = document.getElementById('cart-item');

  if (isAuthenticated()) {
    // Oculta login y sign up
    if (loginItem) loginItem.style.display = 'none';
    if (signupItem) signupItem.style.display = 'none';

    // Muestra cerrar sesión, pedidos y carrito
    if (logoutItem) logoutItem.style.display = 'block';
    if (logoutSeparator) logoutSeparator.style.display = 'block';
    if (ordersItem) ordersItem.style.display = 'block';
    if (cartItem) cartItem.style.display = 'block';

  } else {
    // Muestra login y sign up
    if (loginItem) loginItem.style.display = 'block';
    if (signupItem) signupItem.style.display = 'block';

    // Oculta cerrar sesión, pedidos y carrito
    if (logoutItem) logoutItem.style.display = 'none';
    if (logoutSeparator) logoutSeparator.style.display = 'none';
    if (ordersItem) ordersItem.style.display = 'none';
    if (cartItem) cartItem.style.display = 'block'; // Carrito siempre visible
  }
}


/**
 * Añade headers de autenticación a las peticiones fetch
 * @param {Object} options - Opciones para la petición fetch
 * @returns {Object} - Opciones con los headers de autenticación añadidos
 */
function addAuthHeader(options = {}) {
  const token = getAuthToken();
  if (!token) return options;

  if (!options.headers) {
    options.headers = {};
  }

  options.headers['Authorization'] = `Bearer ${token}`;
  return options;
}

/**
 * Función para realizar una petición fetch autenticada
 * @param {string} url - URL de la petición
 * @param {Object} options - Opciones para la petición fetch
 * @returns {Promise} - Promise con la respuesta
 */
async function authenticatedFetch(url, options = {}) {
  const authOptions = addAuthHeader(options);
  return fetch(url, authOptions);
}

// Ejecutar setupUI cuando se carga la página
document.addEventListener('DOMContentLoaded', setupUI);