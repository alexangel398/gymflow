const express = require('express');
const router = express.Router();
const {
    getPlans, getMyPlans, getPlanById,
    createPlan, updatePlan, deletePlan,
} = require('../controllers/plan.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const { planUpload } = require('../config/multer');

router.get('/my', authenticateToken, getMyPlans);
router.get('/', authenticateToken, authorizeRole('admin', 'trainer'), getPlans);
router.get('/:id', authenticateToken, getPlanById);

router.post('/',
    authenticateToken,
    authorizeRole('admin', 'trainer'),
    planUpload.single('file'),
    createPlan
);

router.put('/:id',
    authenticateToken,
    authorizeRole('admin', 'trainer'),
    planUpload.single('file'),
    updatePlan
);

router.delete('/:id',
    authenticateToken,
    authorizeRole('admin', 'trainer'),
    deletePlan
);

module.exports = router;