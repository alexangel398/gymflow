const express = require('express');
const router = express.Router();
const {
    generateQR, scanQR, manualAttendance,
    getAttendance, getMyAttendance, exportCSV,
} = require('../controllers/attendance.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

router.get('/qr', authenticateToken, generateQR);
router.get('/my', authenticateToken, getMyAttendance);
router.get('/export', authenticateToken, authorizeRole('admin', 'trainer'), exportCSV);
router.get('/', authenticateToken, authorizeRole('admin', 'trainer'), getAttendance);
router.post('/scan', authenticateToken, authorizeRole('admin', 'trainer'), scanQR);
router.post('/manual', authenticateToken, authorizeRole('admin', 'trainer'), manualAttendance);

module.exports = router;