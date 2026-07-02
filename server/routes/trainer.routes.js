const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getTrainers, getTrainerById, createTrainer, updateTrainer, deleteTrainer,
} = require('../controllers/trainer.controller');
const {
    assignMember, unassignMember, getAssignedMembers
} = require('../controllers/assignment.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

const createValidation = [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email invalido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Minimo 6 caracteres'),
    body('specialties').optional().isArray().withMessage('Especialidades debe ser un array'),
];

router.get('/', authenticateToken, getTrainers);
router.get('/:id', authenticateToken, getTrainerById);
router.post('/', authenticateToken, authorizeRole('admin'), createValidation, createTrainer);
router.put('/:id', authenticateToken, authorizeRole('admin', 'trainer'), updateTrainer);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteTrainer);

router.get('/:id/members', authenticateToken, authorizeRole('admin', 'trainer'), getAssignedMembers);
router.post('/:id/assign/:memberId', authenticateToken, authorizeRole('admin'), assignMember);
router.delete('/:id/assign/:memberId', authenticateToken, authorizeRole('admin'), unassignMember);

module.exports = router;
/* EOF */