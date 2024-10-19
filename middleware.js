// Importar la librería jsonwebtoken para manejar la verificación de tokens JWT
const jwt = require('jsonwebtoken');
// Obtener la clave secreta para la firma de tokens desde las variables de entorno
const { JWT_SECRET } = process.env;

// Definir la función middleware para verificar el token
function verifyToken(req, res, next) {
    // Obtener el encabezado de autorización de la solicitud
    const authHeader = req.headers['authorization']; 
    // Verificar si el encabezado de autorización no está presente
    if (!authHeader) {
        return res.status(403).send({ message: 'No se proporcionó el token!' }); // Responder con error 403 si no se proporciona el token
    }

    // Extraer el token eliminando el prefijo 'Bearer '
    const token = authHeader.split(' ')[1]; 
    // Verificar si el token está presente
    if (!token) {
        return res.status(403).send({ message: 'Formato de token inválido!' }); // Responder con error 403 si el formato del token es incorrecto
    }

    // Verificar el token usando la clave secreta
    jwt.verify(token,  process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Si hay un error al verificar el token, registrar el error
            console.error("Error al verificar token:", err.message);
            return res.status(401).send({ message: 'No autorizado!' }); // Responder con error 401 si la verificación falla
        }
        // Almacenar el ID del usuario decodificado en el objeto de la solicitud para su uso posterior
        req.userId = decoded.id; 
        next(); // Llamar a la siguiente función en la cadena de middleware
    });
}

// Exportar la función para que pueda ser utilizada en otras partes de la aplicación
module.exports = { verifyToken };


