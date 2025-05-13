document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signupForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const telefono = document.getElementById('telefono').value;
        const direccion = document.getElementById('direccion').value;
        const errorMessage = document.getElementById('error-message');

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Las contraseñas no coinciden';
            return;
        }

        try {
            const response = await fetch('https://localhost:44370/api/Auth/Registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: name,
                    email: email,
                    password: password,
                    telefono: telefono || null,
                    direccion: direccion || null
                })
            });

            const text = await response.text(); // Obtenemos texto plano por si no es JSON válido
            let data;

            try {
                data = JSON.parse(text); // Intentamos parsearlo a JSON
            } catch {
                data = { message: text }; // Si falla, lo tratamos como mensaje de texto plano
            }

            if (!response.ok) {
                if (response.status === 409 || (data.message && data.message.toLowerCase().includes('correo'))) {
                    errorMessage.textContent = 'El correo ya está registrado. Intenta con otro.';
                } else {
                    errorMessage.textContent = data.message || 'Error en el registro';
                }
                return;
            }

            // Guardar token y datos del usuario
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.nombre);

            window.location.href = '../index.html';
        } catch (error) {
            // Manejo mejorado del catch
            if (error.message && error.message.toLowerCase().includes('correo')) {
                //errorMessage.textContent = 'El correo ya está registrado. Intenta con otro.';
                alert("El correo ya está registrado. Intenta con otro. ");
            } else {
                alert("Error de conexión con el servidor.");
                //errorMessage.textContent = 'Error de conexión con el servidor.';
            }
            console.error('Error:', error);
        }

    });
});