document.addEventListener("DOMContentLoaded", () => {
    const catalogContainer = document.querySelector(".catalog-items");

    async function cargarProductos() {
        try {
            const response = await fetch("https://localhost:44370/api/jugos"); // Ajusta el puerto si es necesario
            if (!response.ok) throw new Error("Error al obtener los productos");

            const productos = await response.json();

            if (productos.length === 0) {
                catalogContainer.innerHTML = "<p>No hay productos disponibles.</p>";
                return;
            }

            productos.forEach((producto) => {
                const card = document.createElement("div");
                card.classList.add("item-card");

                const imagen = producto.imagenUrl
                    ? `IMG/${producto.imagenUrl}` // Ajusta extensión o ruta según tu API
                    : "IMG/default.png";

                card.innerHTML = `
            <img src="${imagen}" alt="${producto.nombre}" />
            <div class="item-details">
              <h4>${producto.nombre}</h4>
              <p class="price">$${producto.precio.toFixed(2)} MXN</p>
              <p class="desc">${producto.descripcion}</p>
              <a href="product.html?id=${producto.id}" class="btn">Agregar</a>
            </div>
          `;

                catalogContainer.appendChild(card);
            });
        } catch (error) {
            console.error("Error al cargar productos:", error);
            catalogContainer.innerHTML = "<p>Ocurrió un error al cargar los productos.</p>";
        }
    }

    cargarProductos();
});
