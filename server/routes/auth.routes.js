const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

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

module.exports = router;