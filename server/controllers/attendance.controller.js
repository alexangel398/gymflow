const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Class = require('../models/Class');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// @route  GET /api/attendance/qr
// @access Member (genera su propio QR)
const generateQR = async (req, res, next) => {
    try {
        // Token QR con expiración de 5 minutos
        const qrPayload = {
            userId: req.user.id,
            type: 'attendance_qr',
            iat: Date.now(),
        };

        const qrToken = jwt.sign(qrPayload, process.env.JWT_SECRET, { expiresIn: '5m' });

        // Generar imagen QR en base64
        const qrImage = await QRCode.toDataURL(qrToken, {
            width: 300,
            margin: 2,
            color: { dark: '#1B4F72', light: '#FFFFFF' },
        });

        res.json({
            success: true,
            data: {
                qrImage,
                qrToken,
                expiresIn: 300, // segundos
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route  POST /api/attendance/scan
// @access Trainer | Admin
const scanQR = async (req, res, next) => {
    try {
        const { qrToken, classId, notes } = req.body;

        if (!qrToken) {
            return res.status(400).json({ success: false, message: 'Token QR requerido' });
        }

        // Verificar y decodificar el token QR
        let decoded;
        try {
            decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: err.name === 'TokenExpiredError'
                    ? 'El QR expiró. El miembro debe generar uno nuevo'
                    : 'QR inválido',
            });
        }

        if (decoded.type !== 'attendance_qr') {
            return res.status(400).json({ success: false, message: 'QR inválido' });
        }

        const member = await User.findById(decoded.userId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Miembro no encontrado' });
        }

        // Verificar si ya tiene asistencia hoy para esta clase
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existing = await Attendance.findOne({
            member: decoded.userId,
            class: classId || null,
            date: { $gte: today, $lt: tomorrow },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: `${member.name} ya registró asistencia hoy`,
            });
        }

        const attendance = await Attendance.create({
            member: decoded.userId,
            recordedBy: req.user.id,
            class: classId || null,
            method: 'qr',
            notes: notes || '',
            date: new Date(),
        });

        await attendance.populate('member', 'name email avatar');

        res.status(201).json({
            success: true,
            message: `Asistencia registrada para ${member.name}`,
            data: attendance,
        });
    } catch (error) {
        next(error);
    }
};

// @route  POST /api/attendance/manual
// @access Trainer | Admin
const manualAttendance = async (req, res, next) => {
    try {
        const { memberId, classId, notes } = req.body;

        const member = await User.findById(memberId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Miembro no encontrado' });
        }

        // Verificar duplicado hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existing = await Attendance.findOne({
            member: memberId,
            class: classId || null,
            date: { $gte: today, $lt: tomorrow },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: `${member.name} ya tiene asistencia registrada hoy`,
            });
        }

        const attendance = await Attendance.create({
            member: memberId,
            recordedBy: req.user.id,
            class: classId || null,
            method: 'manual',
            notes: notes || '',
            date: new Date(),
        });

        await attendance.populate('member', 'name email avatar');

        res.status(201).json({
            success: true,
            message: `Asistencia manual registrada para ${member.name}`,
            data: attendance,
        });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/attendance
// @access Admin | Trainer
const getAttendance = async (req, res, next) => {
    try {
        const { memberId, classId, from, to, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (memberId) filter.member = memberId;
        if (classId) filter.class = classId;
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        const total = await Attendance.countDocuments(filter);
        const records = await Attendance.find(filter)
            .populate('member', 'name email avatar')
            .populate('recordedBy', 'name')
            .populate('class', 'name schedule')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            data: records,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/attendance/my
// @access Member
const getMyAttendance = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const total = await Attendance.countDocuments({ member: req.user.id });
        const records = await Attendance.find({ member: req.user.id })
            .populate('class', 'name schedule color')
            .populate('recordedBy', 'name')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            data: records,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/attendance/export
// @access Admin | Trainer
const exportCSV = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const filter = {};
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        const records = await Attendance.find(filter)
            .populate('member', 'name email')
            .populate('recordedBy', 'name')
            .populate('class', 'name')
            .sort({ date: -1 });

        const rows = [
            ['Fecha', 'Miembro', 'Email', 'Clase', 'Metodo', 'Registrado por'],
            ...records.map(r => [
                new Date(r.date).toLocaleDateString('es-AR'),
                r.member?.name || '',
                r.member?.email || '',
                r.class?.name || 'Sin clase',
                r.method === 'qr' ? 'QR' : 'Manual',
                r.recordedBy?.name || '',
            ]),
        ];

        const csv = rows.map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=asistencia.csv');
        res.send('\uFEFF' + csv); // BOM para Excel
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateQR, scanQR, manualAttendance,
    getAttendance, getMyAttendance, exportCSV,
};