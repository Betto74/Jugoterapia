document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData();

        // Obtener valores del formulario
        formData.append("Nombre", form.name.value);
        formData.append("Descripcion", form.description.value);
        formData.append("Ingredientes", form.ingredients.value);
        formData.append("Precio", parseFloat(form.price.value));
        formData.append("Stock", parseInt(form.stock.value));
        formData.append("Tipo", tipoToInt(form.type.value));
        formData.append("Imagen", form.image.files[0]);
        debugger;

        fetch("https://localhost:44370/api/jugos")
            .then(() => console.log("Servidor listo"))
            .catch(() => console.warn("Primer conexión fallida, puede ser normal en caliente"));

        try {
            const response = await fetch('https://localhost:44370/api/jugos', {
                method: 'POST',
                body: formData
            });

            const responseText = await response.text();

            if (response.ok) {
                alert("Producto agregado correctamente");
                form.reset();
            } else {
                console.warn("Respuesta no exitosa:", response.status, responseText);
                alert("Error al guardar: " + responseText);
            }
        } catch (error) {
            console.error("Error real de conexión o red:", error);
            alert("Error al conectar con el servidor: " + error.message);
        }

    });

    function tipoToInt(tipo) {
        switch (tipo.toLowerCase()) {
            case "jugo": return 0;
            case "licuado": return 1;
            case "postre": return 2;
            default: return 0;
        }
    }
});
