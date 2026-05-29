const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getUsers, getUserById, updateUser, changePassword
} = require('../controllers/user.controller');
const {
    authenticateToken, authorizeRole
} = require('../middlewares/auth.middleware');

const updateValidation = [
    body('name').optional().trim()
        .isLength({ min: 2, max: 100 }).withMessage('Nombre entre 2 y 100 caracteres'),
    body('phone').optional().trim()
        .isLength({ max: 20 }).withMessage('Teléfono demasiado largo'),
    body('bio').optional().trim()
        .isLength({ max: 500 }).withMessage('Bio máximo 500 caracteres'),
    body('role').optional()
        .isIn(['admin', 'trainer', 'member']).withMessage('Rol inválido'),
];

const passwordValidation = [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
];

router.get('/', authenticateToken, authorizeRole('admin'), getUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateValidation, updateUser);
router.put('/:id/password', authenticateToken, passwordValidation, changePassword);

module.exports = router;