const Plan = require('../models/Plan');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { sendPlanAssignedEmail } = require('../services/email.service');
const { createNotification } = require('./notification.controller');

// @route  GET /api/plans
// @access Admin | Trainer (sus planes)
const getPlans = async (req, res, next) => {
    try {
        const filter = {};

        if (req.user.role === 'trainer') filter.trainer = req.user.id;
        if (req.user.role === 'admin' && req.query.trainer) filter.trainer = req.query.trainer;
        if (req.query.member) filter.member = req.query.member;
        if (req.query.type) filter.type = req.query.type;

        const plans = await Plan.find(filter)
            .populate('trainer', 'name avatar')
            .populate('member', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/plans/my
// @access Member
const getMyPlans = async (req, res, next) => {
    try {
        const plans = await Plan.find({ member: req.user.id, isActive: true })
            .populate('trainer', 'name avatar bio')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/plans/:id
// @access Admin | Trainer | Member (propio)
const getPlanById = async (req, res, next) => {
    try {
        const plan = await Plan.findById(req.params.id)
            .populate('trainer', 'name avatar')
            .populate('member', 'name email avatar');

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan no encontrado' });
        }

        // Miembro solo puede ver sus propios planes
        if (req.user.role === 'member' && plan.member._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        res.json({ success: true, data: plan });
    } catch (error) {
        next(error);
    }
};

// @route  POST /api/plans
// @access Admin | Trainer
const createPlan = async (req, res, next) => {
    try {
        const {
            title, type, member, description, goal,
            duration, workoutDays, meals, totalCalories, macros,
        } = req.body;

        const memberUser = await User.findById(member);
        if (!memberUser) {
            return res.status(404).json({ success: false, message: 'Miembro no encontrado' });
        }

        const planData = {
            title,
            type,
            trainer: req.user.id,
            member,
            description: description || '',
            goal: goal || 'salud',
            duration: duration || 4,
        };

        if (type === 'workout' && workoutDays) {
            planData.workoutDays = typeof workoutDays === 'string'
                ? JSON.parse(workoutDays)
                : workoutDays;
        }

        if (type === 'diet') {
            if (meals) planData.meals = typeof meals === 'string' ? JSON.parse(meals) : meals;
            if (totalCalories) planData.totalCalories = totalCalories;
            if (macros) planData.macros = typeof macros === 'string' ? JSON.parse(macros) : macros;
        }

        // Archivo adjunto si se subió
        if (req.file) {
            planData.fileUrl = `/uploads/plans/${req.file.filename}`;
            planData.fileName = req.file.originalname;
        }

        const plan = await Plan.create(planData);
        await plan.populate('trainer', 'name avatar');
        await plan.populate('member', 'name email');

        // Email al miembro
        try {
            await sendPlanAssignedEmail({
                to: memberUser.email,
                memberName: memberUser.name,
                trainerName: plan.trainer.name,
                planTitle: plan.title,
                planType: type === 'workout' ? 'Entrenamiento' : 'Dieta',
            });
        } catch (emailErr) {
            console.error('[EMAIL ERROR]', emailErr.message);
        }

        await createNotification({
            userId: member,
            title: `Nuevo plan asignado: ${title}`,
            message: `Tu entrenador te asigno el plan "${title}" de tipo ${type === 'workout' ? 'entrenamiento' : 'dieta'}`,
            type: 'plan',
            link: '/member/plans',
        });

        res.status(201).json({
            success: true,
            message: 'Plan creado y asignado correctamente',
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

// @route  PUT /api/plans/:id
// @access Admin | Trainer (propio)
const updatePlan = async (req, res, next) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan no encontrado' });
        }

        if (req.user.role === 'trainer' && plan.trainer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'No podés editar este plan' });
        }

        const allowed = ['title', 'description', 'goal', 'duration', 'workoutDays', 'meals', 'totalCalories', 'macros', 'isActive'];
        const updates = {};
        allowed.forEach(f => {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        });

        if (req.file) {
            // Borrar archivo anterior
            if (plan.fileUrl) {
                const oldPath = path.join(__dirname, '../', plan.fileUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updates.fileUrl = `/uploads/plans/${req.file.filename}`;
            updates.fileName = req.file.originalname;
        }

        const updated = await Plan.findByIdAndUpdate(
            req.params.id, { $set: updates }, { new: true }
        ).populate('trainer', 'name').populate('member', 'name email');

        res.json({ success: true, message: 'Plan actualizado', data: updated });
    } catch (error) {
        next(error);
    }
};

// @route  DELETE /api/plans/:id
// @access Admin | Trainer (propio)
const deletePlan = async (req, res, next) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan no encontrado' });
        }

        if (req.user.role === 'trainer' && plan.trainer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'No podés eliminar este plan' });
        }

        plan.isActive = false;
        await plan.save();

        res.json({ success: true, message: 'Plan eliminado correctamente' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPlans, getMyPlans, getPlanById, createPlan, updatePlan, deletePlan };