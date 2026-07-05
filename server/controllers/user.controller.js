const User = require('../models/User');
const { validationResult } = require('express-validator');
const path = require('path');
const fs   = require('fs');
const { upload } = require('../config/multer');

// Agrega esto a tus controladores si no existe
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al borrar' });
    }
};
// @route  GET /api/users
// @access Admin
const getUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            data: users.map(u => u.toPublicJSON()),
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

// @route  GET /api/users/:id
// @access Admin | Self
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Solo admin puede ver otros usuarios
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: 'No tenés permiso para ver este perfil',
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

// @route  PUT /api/users/:id
// @access Admin | Self
const updateUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { id } = req.params;

        // Solo admin puede editar otros usuarios
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({
                success: false,
                message: 'No tenés permiso para editar este perfil',
            });
        }

        // Campos que cualquiera puede editar
        const allowed = ['name', 'phone', 'bio'];

        // Solo admin puede cambiar el rol o desactivar
        if (req.user.role === 'admin') {
            allowed.push('role', 'isActive');
        }

        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            data: user.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// @route  PUT /api/users/:id/password
// @access Self
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Acción no permitida' });
        }

        const user = await User.findById(req.params.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        next(error);
    }
};

// @route  POST /api/users/:id/avatar
// @access Self
const uploadAvatar = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Acción no permitida' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se recibió ninguna imagen' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Borrar avatar anterior si existe
        if (user.avatar) {
            const oldPath = path.join(__dirname, '../', user.avatar);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        // Guardar ruta relativa en la BD
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        user.avatar = avatarUrl;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar actualizado correctamente',
            data: { avatar: avatarUrl },
        });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/users/assigned-members
// @access Trainer
const getAssignedMembers = async (req, res, next) => {
    try {
        // Log para ver qué llega
        console.log("Usuario autenticado:", req.user); 
        
        const trainer = await User.findById(req.user.id).populate('trainerProfile.assignedMembers', 'name email avatar');
        
        if (!trainer) {
            return res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
        }

        res.json({ success: true, data: trainer.trainerProfile.assignedMembers || [] });
    } catch (error) {
        next(error);
    }
};

module.exports = { getUsers, getUserById, updateUser, changePassword, uploadAvatar, deleteUser, getAssignedMembers };