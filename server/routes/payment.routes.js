const express = require('express');
const router = express.Router();
const {
    getPlans, createCheckout, webhook, getPayments, getMyPayments,
} = require('../controllers/payment.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// Webhook — debe ir ANTES de express.json() — usamos raw body
router.post(
    '/webhook',
    /* express.raw({ type: 'application/json' }),*/
    webhook
); 

router.get('/plans', getPlans);
router.get('/my', authenticateToken, getMyPayments);
router.get('/', authenticateToken, authorizeRole('admin'), getPayments);
router.post('/create-checkout', authenticateToken, createCheckout);

module.exports = router;