const User = require('../models/User');
const { validationResult } = require('express-validator');

// @route  GET /api/trainers
// @access Todos (autenticados)
const getTrainers = async (req, res, next) => {
    try {
        const { specialty, search } = req.query;

        const filter = { role: 'trainer', isActive: true };
        if (specialty) {
            filter['trainerProfile.specialties'] = specialty;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const trainers = await User.find(filter)
            .select('-password')
            .sort({ name: 1 });

        res.json({ success: true, data: trainers });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/trainers/:id
// @access Todos (autenticados)
const getTrainerById = async (req, res, next) => {
    try {
        const trainer = await User.findOne({
            _id: req.params.id,
            role: 'trainer',
        })
            .select('-password')
            .populate('trainerProfile.assignedMembers', 'name email avatar');

        if (!trainer) {
            return res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
        }

        res.json({ success: true, data: trainer });
    } catch (error) {
        next(error);
    }
};

// @route  POST /api/trainers
// @access Admin
const createTrainer = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password, specialties, certifications, experience } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email' });
        }

        const trainer = await User.create({
            name,
            email,
            password,
            role: 'trainer',
            trainerProfile: {
                specialties: specialties || [],
                certifications: certifications || [],
                experience: experience || 0,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Entrenador creado correctamente',
            data: trainer.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// @route  PUT /api/trainers/:id
// @access Admin | Self (trainer)
const updateTrainer = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' });
        if (!trainer) {
            return res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
        }

        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        const { name, phone, bio, specialties, certifications, experience, availability } = req.body;

        if (name) trainer.name = name;
        if (phone) trainer.phone = phone;
        if (bio) trainer.bio = bio;
        if (specialties) trainer.trainerProfile.specialties = specialties;
        if (certifications) trainer.trainerProfile.certifications = certifications;
        if (experience !== undefined) trainer.trainerProfile.experience = experience;
        if (availability) trainer.trainerProfile.availability = availability;

        await trainer.save();

        res.json({
            success: true,
            message: 'Entrenador actualizado',
            data: trainer.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// @route  DELETE /api/trainers/:id
// @access Admin
const deleteTrainer = async (req, res, next) => {
    try {
        const trainer = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'trainer' },
            { isActive: false },
            { new: true }
        );
        if (!trainer) {
            return res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
        }
        res.json({ success: true, message: 'Entrenador desactivado correctamente' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTrainers, getTrainerById, createTrainer, updateTrainer, deleteTrainer };