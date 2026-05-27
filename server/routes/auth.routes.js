const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authorizeRole } = require('../middlewares/auth.middleware');

// Validaciones
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 100 }).withMessage('Nombre demasiado largo'),
    body('email')
        .trim()
        .isEmail().withMessage('Email invalido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const loginValidation = [
    body('email').trim().isEmail().withMessage('Email invalido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

// Endpoints

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticateToken, getMe);


// Rutas de prueba por rol (se pueden borrar al terminar el sprint)
router.get('/test/admin',
    authenticateToken,
    authorizeRole('admin'),
    (req, res) => res.json({ success: true, message: 'Hola Admin', user: req.user })
);

router.get('/test/trainer',
    authenticateToken,
    authorizeRole('trainer', 'admin'),
    (req, res) => res.json({ success: true, message: 'Hola Trainer', user: req.user })
);

router.get('/test/member',
    authenticateToken,
    authorizeRole('member', 'trainer', 'admin'),
    (req, res) => res.json({ success: true, message: 'Hola Member', user: req.user })
);

module.exports = router;