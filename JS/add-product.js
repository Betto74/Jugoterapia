document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('.add-product-form');
    let titulo= document.getElementById('titulo');
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = urlParams.get('id');
    let productoActual = null;

    if (productoId) {
        // Cargar datos del producto existente
        try {
            const response = await fetch(`https://localhost:44370/api/jugos/${productoId}`);
            if (!response.ok) throw new Error("Producto no encontrado");
            productoActual = await response.json();
            llenarFormulario(productoActual);
        } catch (error) {
            console.error("Error al cargar producto:", error);
            alert("No se pudo cargar el producto. Verifica el ID.");
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("Nombre", form.name.value);
        formData.append("Descripcion", form.description.value);
        formData.append("Ingredientes", form.ingredients.value);
        formData.append("Precio", parseFloat(form.price.value));
        formData.append("Unidades", parseInt(form.stock.value));
        formData.append("Tipo", tipoToInt(form.type.value));

        // Solo agregar imagen si se seleccionó una nueva
        if (form.image.files.length > 0) {
            formData.append("Imagen", form.image.files[0]);
        }

        const url = productoId
            ? `https://localhost:44370/api/jugos/${productoId}`
            : 'https://localhost:44370/api/jugos';

        const method = productoId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                body: formData
            });

            const responseText = await response.text();

            if (response.ok) {
                alert(productoId ? "Producto actualizado correctamente" : "Producto agregado correctamente");
                if (!productoId) form.reset();
                if (productoId) window.location.href = "catalog.html";
            } else {
                console.warn("Respuesta no exitosa:", response.status, responseText);
                alert("Error al guardar: " + responseText);
            }
        } catch (error) {
            console.error("Error real de conexión o red:", error);
            alert("Error al conectar con el servidor: " + error.message);
        }
    });

    function llenarFormulario(producto) {
        form.name.value = producto.nombre || '';
        form.description.value = producto.descripcion || '';
        form.ingredients.value = producto.ingredientes || '';
        form.price.value = producto.precio || '';
        form.stock.value = producto.unidades || 0;
        titulo.textContent = "Actualizar producto: " + producto.nombre;
        // Convertir tipo numérico a valor string del select
        switch (producto.tipo) {
            case 0:
                form.type.value = "jugo";
                break;
            case 1:
                form.type.value = "licuado";
                break;
            case 2:
                form.type.value = "postre";
                break;
            default:
                form.type.value = "jugo"; // Valor por defecto
                break;
        }
    }

    function tipoToInt(tipo) {
        switch (tipo.toLowerCase()) {
            case "jugo": return 0;
            case "licuado": return 1;
            case "postre": return 2;
            default: return 0;
        }
    }
});
