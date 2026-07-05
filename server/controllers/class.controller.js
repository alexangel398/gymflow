const User = require('../models/User');
const { sendEnrollmentEmail } = require('../services/email.service');
const Class = require('../models/Class');
const { validationResult } = require('express-validator');
const { createNotification } = require('./notification.controller');

// @route  GET /api/classes
// @access Todos (autenticados)
const getClasses = async (req, res, next) => {
    try {
        const { type, trainer, day, active = true } = req.query;

        const filter = {};
        if (req.query.active !== undefined) {
            filter.isActive = req.query.active === 'true';
        };
        if (type) filter.type = type;
        if (trainer) filter.trainer = trainer;
        if (day !== undefined) filter['schedule.dayOfWeek'] = Number(day);

        const classes = await Class.find(filter)
            .populate('trainer', 'name avatar')
            .populate('enrolled.user', 'name avatar')
            .sort({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });

        res.json({ success: true, data: classes });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/classes/:id
// @access Todos (autenticados)
const getClassById = async (req, res, next) => {
    try {
        const gymClass = await Class.findById(req.params.id)
            .populate('trainer', 'name avatar bio')
            .populate('enrolled.user', 'name avatar');

        if (!gymClass) {
            return res.status(404).json({ success: false, message: 'Clase no encontrada' });
        }

        res.json({ success: true, data: gymClass });
    } catch (error) {
        next(error);
    }
};

// @route  POST /api/classes
// @access Admin | Trainer
const createClass = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Trainer solo puede crear clases asignadas a sí mismo
        const trainerId = req.user.role === 'admin'
            ? (req.body.trainer || req.user.id)
            : req.user.id;

        const gymClass = await Class.create({ ...req.body, trainer: trainerId });
        await gymClass.populate('trainer', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'Clase creada correctamente',
            data: gymClass,
        });
    } catch (error) {
        next(error);
    }
};

// @route  PUT /api/classes/:id
// @access Admin | Trainer (solo sus clases)
const updateClass = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const gymClass = await Class.findById(req.params.id);
        if (!gymClass) {
            return res.status(404).json({ success: false, message: 'Clase no encontrada' });
        }

        // Trainer solo puede editar sus propias clases
        if (
            req.user.role === 'trainer' &&
            gymClass.trainer.toString() !== req.user.id
        ) {
            return res.status(403).json({ success: false, message: 'No podés editar esta clase' });
        }

        const allowed = ['name', 'description', 'type', 'schedule', 'capacity', 'location', 'color', 'isActive'];
        if (req.user.role === 'admin') allowed.push('trainer');

        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const updated = await Class.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('trainer', 'name avatar');

        res.json({ success: true, message: 'Clase actualizada', data: updated });
    } catch (error) {
        next(error);
    }
};

// @route  DELETE /api/classes/:id
// @access Admin
const deleteClass = async (req, res, next) => {
    try {
        const gymClass = await Class.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!gymClass) {
            return res.status(404).json({ success: false, message: 'Clase no encontrada' });
        }
        res.json({ success: true, message: 'Clase desactivada correctamente' });
    } catch (error) {
        next(error);
    }
};

// @route  POST /api/classes/:id/enroll
// @access Member | Trainer | Admin
const enrollClass = async (req, res, next) => {
    try {
        const gymClass = await Class.findById(req.params.id);
        if (!gymClass) {
            return res.status(404).json({ success: false, message: 'Clase no encontrada' });
        }

        if (!gymClass.isActive) {
            return res.status(400).json({ success: false, message: 'Esta clase no está disponible' });
        }

        // Verificar si ya está inscripto
        const alreadyEnrolled = gymClass.enrolled.some(
            e => e.user.toString() === req.user.id
        );
        if (alreadyEnrolled) {
            return res.status(409).json({ success: false, message: 'Ya estás inscripto en esta clase' });
        }

        // Verificar cupo
        if (gymClass.isFull) {
            return res.status(400).json({ success: false, message: 'La clase está llena' });
        }

        gymClass.enrolled.push({ user: req.user.id });
        await gymClass.save();

        // Enviar email de confirmación (no bloqueante)
        try {
            const enrolledUser = await User.findById(req.user.id);
            const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            await sendEnrollmentEmail({
                to: enrolledUser.email,
                userName: enrolledUser.name,
                className: gymClass.name,
                day: DAYS_ES[gymClass.schedule.dayOfWeek],
                time: `${gymClass.schedule.startTime} – ${gymClass.schedule.endTime}`,
                trainer: gymClass.trainer?.name || 'Por confirmar',
            });
        } catch (emailError) {
            console.error('[EMAIL ERROR]', emailError.message);
        }

        // Crear notificacion en app
        await createNotification({
            userId: req.user.id,
            title: `Inscripto en ${gymClass.name}`,
            message: `Te inscribiste a ${gymClass.name} el ${['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][gymClass.schedule.dayOfWeek]} a las ${gymClass.schedule.startTime}hs`,
            type: 'class',
            link: '/member/my-classes',
        });

        res.json({
            success: true,
            message: `¡Inscripto correctamente en ${gymClass.name}!`,
            data: {
                enrolledCount: gymClass.enrolledCount,
                availableSpots: gymClass.availableSpots,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @route  DELETE /api/classes/:id/enroll
// @access Member | Trainer | Admin
const unenrollClass = async (req, res, next) => {
    try {
        const gymClass = await Class.findById(req.params.id);
        if (!gymClass) {
            return res.status(404).json({ success: false, message: 'Clase no encontrada' });
        }

        const index = gymClass.enrolled.findIndex(
            e => e.user.toString() === req.user.id
        );
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'No estás inscripto en esta clase' });
        }

        gymClass.enrolled.splice(index, 1);
        await gymClass.save();

        res.json({ success: true, message: 'Inscripción cancelada correctamente' });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/classes/my
// @access Member | Trainer | Admin
const getMyClasses = async (req, res, next) => {
    try {
        let classes;

        if (req.user.role === 'trainer' || req.user.role === 'admin') {
            // Entrenador ve las clases que dicta
            classes = await Class.find({ trainer: req.user.id, isActive: true })
                .populate('enrolled.user', 'name avatar')
                .sort({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });
        } else {
            // Miembro ve las clases en las que está inscripto
            classes = await Class.find({
                'enrolled.user': req.user.id,
                isActive: true,
            })
                .populate('trainer', 'name avatar')
                .sort({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });
        }

        res.json({ success: true, data: classes });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClasses, getClassById, createClass,
    updateClass, deleteClass, enrollClass,
    unenrollClass, getMyClasses,
};