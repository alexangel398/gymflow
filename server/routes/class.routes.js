const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getClasses, getClassById, createClass,
    updateClass, deleteClass, enrollClass,
    unenrollClass, getMyClasses,
} = require('../controllers/class.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

const classValidation = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
    body('type').isIn(['yoga', 'crossfit', 'spinning', 'pilates', 'funcional', 'hiit', 'boxeo', 'otro'])
        .withMessage('Tipo de clase inválido'),
    body('capacity').isInt({ min: 1, max: 100 }).withMessage('Capacidad entre 1 y 100'),
    body('schedule.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Día inválido'),
    body('schedule.startTime').matches(/^\d{2}:\d{2}$/).withMessage('Formato HH:MM requerido'),
    body('schedule.endTime').matches(/^\d{2}:\d{2}$/).withMessage('Formato HH:MM requerido'),
];

router.get('/my', authenticateToken, getMyClasses);
router.get('/', authenticateToken, getClasses);
router.get('/:id', authenticateToken, getClassById);

router.post('/', authenticateToken, authorizeRole('admin', 'trainer'), classValidation, createClass);
router.put('/:id', authenticateToken, authorizeRole('admin', 'trainer'), updateClass);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteClass);

router.post('/:id/enroll', authenticateToken, enrollClass);
router.delete('/:id/enroll', authenticateToken, unenrollClass);

module.exports = router;