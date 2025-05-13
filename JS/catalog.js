document.addEventListener("DOMContentLoaded", () => {
    const catalogContainer = document.querySelector(".catalog-items");
    const searchInput = document.querySelector(".search-input");
    const typeFilters = document.querySelectorAll('input[name="type"]');
    const priceFilters = document.querySelectorAll('input[name="price"]');

    async function obtenerProductos() {
        try {
            const response = await fetch("https://localhost:44370/api/jugos");
            if (!response.ok) throw new Error("Error al obtener los productos");
            return await response.json();
        } catch (error) {
            console.error("Error al cargar productos:", error);
            return [];
        }
    }

    function filtrarProductos(productos) {
        const nombre = searchInput.value.toLowerCase();
        const tiposSeleccionados = Array.from(typeFilters)
            .filter(cb => cb.checked)
            .map(cb => cb.value.toLowerCase());
        const precioSeleccionado = Array.from(priceFilters)
            .find(rb => rb.checked)?.value;

        return productos.filter(prod => {
            const coincideNombre = prod.nombre.toLowerCase().includes(nombre);
            const coincideTipo = tiposSeleccionados.length === 0 || tiposSeleccionados.includes(tipoToString(prod.tipo));
            const coincidePrecio = evaluarPrecio(prod.precio, precioSeleccionado);
            return coincideNombre && coincideTipo && coincidePrecio;
        });
    }

    function tipoToString(tipo) {
        switch (tipo) {
            case 0: return "jugo";
            case 1: return "licuado";
            case 2: return "postre";
            default: return "";
        }
    }

    function evaluarPrecio(precio, filtro) {
        if (!filtro) return true;
        const [min, max] = filtro.split("-").map(Number);
        return precio >= min && precio <= max;
    }

    function renderizarProductos(productos) {
        catalogContainer.innerHTML = ""; // limpiar antes de renderizar

        if (productos.length === 0) {
            catalogContainer.innerHTML = "<p>No hay productos disponibles.</p>";
            return;
        }

        productos.forEach((producto) => {
            const card = document.createElement("div");
            card.classList.add("item-card");

            const imagen = producto.imagenUrl
                ? `IMG/${producto.imagenUrl}`
                : "IMG/default.png";

            card.innerHTML = `
                <img src="${imagen}" alt="${producto.nombre}" />
                <div class="item-details">
                  <h4>${producto.nombre}</h4>
                  <p class="price">$${producto.precio.toFixed(2)} MXN</p>
                  <p class="desc">${producto.descripcion}</p>
                  <a href="product.html?id=${producto.id}" class="btn">Ver</a>
                </div>
            `;

            catalogContainer.appendChild(card);
        });
    }

    async function actualizarCatalogo() {
        const productos = await obtenerProductos();
        const filtrados = filtrarProductos(productos);
        renderizarProductos(filtrados);
    }

    // Eventos para actualizar dinámicamente
    searchInput.addEventListener("input", actualizarCatalogo);
    typeFilters.forEach(cb => cb.addEventListener("change", actualizarCatalogo));
    priceFilters.forEach(rb => rb.addEventListener("change", actualizarCatalogo));

    // Cargar por primera vez
    actualizarCatalogo();
});
