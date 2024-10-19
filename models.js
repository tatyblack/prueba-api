// Importar la librería bcryptjs para manejar el hash de contraseñas
const bcrypt = require('bcryptjs');

// Simulación de una base de datos en memoria para almacenar usuarios
let users = []; 

// Función para registrar un nuevo usuario
function registerUser(username, password) {
    // Hashear la contraseña utilizando bcrypt
    const hashedPassword = bcrypt.hashSync(password, 8); // 8 es el número de rondas de salting
    // Crear un objeto de usuario con el nombre de usuario y la contraseña hasheada
    const user = { username, password: hashedPassword };
    // Agregar el usuario al array de usuarios
    users.push(user);
    // Retornar el objeto de usuario creado
    return user;
}

// Función para encontrar un usuario por nombre de usuario
function findUser(username) {
    // Buscar y retornar el usuario cuyo nombre de usuario coincida con el proporcionado
    return users.find(user => user.username === username);
}

// Exportar las funciones para que puedan ser utilizadas en otras partes de la aplicación
module.exports = { registerUser, findUser };


