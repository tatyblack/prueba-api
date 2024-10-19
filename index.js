// Importar dependencias necesarias
const express = require('express'); // Framework para crear aplicaciones web
const jwt = require('jsonwebtoken'); // Para manejar JSON Web Tokens
const bcrypt = require('bcryptjs'); // Para el hashing de contraseñas
const { Client, TokenCreateTransaction, TokenInfoQuery } = require('@hashgraph/sdk'); // SDK de Hedera para interactuar con la red
const { registerUser, findUser } = require('./models'); // Funciones para manejar usuarios (registrar y encontrar)
const { verifyToken } = require('./middleware'); // Middleware para verificar tokens JWT
const axios = require('axios'); // Realizar peticiones HTTP
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

// Crear una instancia de la aplicación Express
const app = express();
// Definir el puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 3000;

// Middleware para parsear las solicitudes JSON
app.use(express.json());

// Configurar el cliente de Hedera
const client = Client.forTestnet(); // Usar la red de prueba de Hedera
client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY); // Configurar el ID de cuenta y la clave privada del operador

// Ruta para registrar un nuevo usuario
app.post('/register', (req, res) => {
    const { username, password } = req.body; // Obtener el nombre de usuario y la contraseña del cuerpo de la solicitud
    const user = registerUser(username, password); // Registrar el nuevo usuario
    res.status(201).send({ message: 'User registered successfully!', user }); // Responder con un mensaje de éxito y el usuario creado
});

// Ruta para iniciar sesión de un usuario
app.post('/login', (req, res) => {
    const { username, password } = req.body; // Obtener el nombre de usuario y la contraseña del cuerpo de la solicitud
    const user = findUser(username); // Buscar el usuario por nombre de usuario

    if (!user) { // Verificar si el usuario existe
        return res.status(401).send({ message: 'Invalid credentials!' }); // Si no existe, responder con error 401
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password); // Comparar la contraseña proporcionada con la almacenada

    if (!isPasswordValid) { // Verificar si la contraseña es válida
        console.log("Contraseña no válida"); // Log para depuración
        return res.status(401).send({ message: 'Invalid credentials!' }); // Si no es válida, responder con error 401
    }

    // Crear un token JWT que contiene el ID del usuario y que expira en 24 horas
    const token = jwt.sign({ id: user.username }, process.env.JWT_SECRET, {
        expiresIn: 86400, // 24 horas
    });

    // Responder con el token y un estado de autenticación
    res.status(200).send({ auth: true, token });
});

// Ruta para crear un token en la red de Hedera
app.post('/create-token-hedera', verifyToken, async (req, res) => {
    const { tokenName, tokenSymbol, initialSupply } = req.body; // Obtener información del token del cuerpo de la solicitud

    // Crear una transacción para crear un nuevo token
    const tokenTransaction = await new TokenCreateTransaction()
        .setTokenName(tokenName) // Establecer el nombre del token
        .setTokenSymbol(tokenSymbol) // Establecer el símbolo del token
        .setTreasuryAccountId(process.env.HEDERA_ACCOUNT_ID) // Establecer la cuenta del tesoro
        .setInitialSupply(initialSupply) // Establecer el suministro inicial del token
        .setDecimals(0) // Establecer el número de decimales
        .setAdminKey(client.operatorPublicKey) // Establecer la clave del administrador
        .execute(client); // Ejecutar la transacción

    // Obtener el recibo de la transacción
    const receipt = await tokenTransaction.getReceipt(client);
    // Responder con el ID del token creado
    res.status(201).send({ tokenId: receipt.tokenId.toString() });
});

// Ruta para listar tokens (actualmente no implementada)
app.get('/list-token', verifyToken, async (req, res) => {
    // Aquí puedes implementar la lógica para listar los tokens
    // Actualmente no se está almacenando información sobre los tokens creados
    res.status(200).send({ message: 'Token listing is not implemented yet.' });
});

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
    console.log(`Server corriendo en el puerto ${PORT}`); // Log para indicar que el servidor está en funcionamiento
});
