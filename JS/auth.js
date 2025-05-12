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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
  }
  
  /**
   * Configura la interfaz de usuario según el estado de autenticación
   */
  function setupUI() {
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    
    if (isAuthenticated()) {
      // Usuario autenticado
      if (authLinks) authLinks.style.display = 'none';
      if (userInfo) {
        userInfo.style.display = 'flex';
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
          userNameElement.textContent = getUserName();
        }
      }
    } else {
      // Usuario no autenticado
      if (authLinks) authLinks.style.display = 'flex';
      if (userInfo) userInfo.style.display = 'none';
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