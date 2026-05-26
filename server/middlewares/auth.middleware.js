const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verificar JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Token no proporcionado',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntar usuario al request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token invalido o expirado',
        });
    }
};

// Verificar rol
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`,
            });
        }
        next();
    };
};

module.exports = { authenticateToken, authorizeRole };