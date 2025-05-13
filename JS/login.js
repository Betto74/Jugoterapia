//Login.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        debugger;
        try {
            const response = await fetch('https://localhost:44370/api/Auth/Login', {


                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    errorMessage.textContent = 'Email o contraseña incorrectos';
                } else {
                    errorMessage.textContent = 'Error en el inicio de sesión';
                }
                return;
            }

            const data = await response.json();

            // Guardar token y datos del usuario
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.nombre);
            localStorage.setItem('userRole', data.tipoUsuario === 0 ?   'Administrador' : 'Cliente'); 

            // Redireccionar al usuario
            window.location.href = '../index.html';
        } catch (error) {
            errorMessage.textContent = 'Error de conexión con el servidor';
            console.error('Error:', error);
        }
    });
});