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

        return productos
            .filter(prod => prod.visible === true || prod.visible === 1) // Solo productos visibles
            .filter(prod => {
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
        catalogContainer.innerHTML = "";


        const esAdmin = isAdmin();

        if (esAdmin) {
            const filtros = document.querySelector(".catalog-filters");
        
            const adminControls = document.createElement("div");
            adminControls.classList.add("admin-controls");
        
            const btnAgregar = document.createElement("button");
            btnAgregar.textContent = "Agregar Producto";
            btnAgregar.classList.add("btn", "btn-agregar-admin");
            btnAgregar.addEventListener("click", () => {
                window.location.href = "add-product.html";
            });
        
            adminControls.appendChild(btnAgregar);
        
            // Evitar duplicados si ya se había renderizado
            if (!filtros.querySelector(".admin-controls")) {
                filtros.appendChild(adminControls);
            }
        }
        
        
  
    
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
                  ${esAdmin ? `
                      <button class="btn btn-editar" data-id="${producto.id}">✏️ Editar</button>
                      <button class="btn btn-eliminar" data-id="${producto.id}">🗑️ Eliminar</button>
                  ` : ''}
                </div>
            `;

            catalogContainer.appendChild(card);
        });

        if (esAdmin) {
            document.querySelectorAll(".btn-editar").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.dataset.id;
                    window.location.href = `add-product.html?id=${id}`;
                });
            });

            document.querySelectorAll(".btn-eliminar").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    const id = e.target.dataset.id;
                    const confirmar = confirm("¿Estás seguro de que deseas eliminar este producto?");
                    if (!confirmar) return;

                    try {
                        const token = localStorage.getItem("authToken");
                        const response = await fetch(`https://localhost:44370/api/jugos/${id}/visible`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({ visible: false }) // Soft delete
                        });

                        if (!response.ok) throw new Error("Error al eliminar el producto");

                        alert("Producto eliminado correctamente.");
                        actualizarCatalogo();

                    } catch (err) {
                        console.error("Error al eliminar:", err);
                        alert("Ocurrió un error al eliminar el producto.");
                    }
                });
            });
        }
    }

    async function actualizarCatalogo() {
        const productos = await obtenerProductos();
        const filtrados = filtrarProductos(productos);
        renderizarProductos(filtrados);
    }

    searchInput.addEventListener("input", actualizarCatalogo);
    typeFilters.forEach(cb => cb.addEventListener("change", actualizarCatalogo));
    priceFilters.forEach(rb => rb.addEventListener("change", actualizarCatalogo));

    actualizarCatalogo();
});
