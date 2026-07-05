const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verificar JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Encabezados recibidos:", req.headers);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Token no proporcionado',
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // --- AQUÍ ESTÁ EL CAMBIO ---
        // Buscamos al usuario en la base de datos usando el ID del token
        const currentUser = await User.findById(decoded.id);

        // Si el usuario fue borrado de la DB o está inactivo, rechazamos el acceso
        if (!currentUser || !currentUser.isActive) {
            return res.status(401).json({ success: false, message: 'Usuario no válido o inactivo' });
        }

        // Adjuntamos el objeto de usuario completo de la base de datos al request
        req.user = currentUser;
        next();

        /*         // Adjuntar usuario al request
                req.user = decoded;
                next(); */
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token invalido o expirado',
        });
    }
};


const authorizeRole = (...roles) => {
    return (req, res, next) => {
        // Obtenemos el rol directamente del usuario que consultamos a la BD
        const userRole = req.user.role; 

        console.log("DEBUG - Usuario:", req.user.email);
        console.log("DEBUG - Rol obtenido de BD:", userRole);
        console.log("DEBUG - Roles permitidos en ruta:", roles);

        // Comparación simple
        if (roles.includes(userRole)) {
            return next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: "No tienes permisos de entrenador." 
            });
        }
    };
};

module.exports = { authenticateToken, authorizeRole };