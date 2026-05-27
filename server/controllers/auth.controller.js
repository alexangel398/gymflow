const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');


// GENERAR JWT

const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
    );
};


// @route   POST /api/auth/register
// @access  Public

const register = async (req, res, next) => {
    try {


        // VALIDAR INPUTS

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }


        // OBTENER DATOS DEL BODY

        const { name, email, password, role } = req.body;


        // VERIFICAR SI EL EMAIL YA EXISTE

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una cuenta con ese email',
            });
        }


        // ASIGNAR ROL

        const assignedRole =
            role && ['trainer', 'admin'].includes(role)
                ? 'member'
                : 'member';


        // CREAR USUARIO

        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
        });


        // 🔥 MODIFICADO:
        // DEBUG PARA VER SI JWT_SECRET EXISTE

        console.log('JWT_SECRET:', process.env.JWT_SECRET);


        // GENERAR TOKEN

        const token = generateToken(user._id, user.role);


        // RESPUESTA EXITOSA

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            token,


            // SI FALLA ACA:
            // user.toPublicJSON is not a function
            // entonces usar temporalmente:
            //
            // user: user

            user: user.toPublicJSON(),
        });

    } catch (error) {


        // MODIFICADO:
        // ANTES TENÍAS:
        //
        // next(error);
        //
        // AHORA MOSTRAMOS EL ERROR REAL

        console.error('ERROR REGISTER:', error);

        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
};


// @route   POST /api/auth/login
// @access  Public

const login = async (req, res, next) => {
    try {


        // VALIDACIONES

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;


        // BUSCAR USUARIO

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos',
            });
        }


        // VERIFICAR SI ESTÁ ACTIVO

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Cuenta desactivada',
            });
        }


        // COMPARAR PASSWORD

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos',
            });
        }


        // GENERAR TOKEN

        const token = generateToken(user._id, user.role);


        // RESPUESTA

        res.json({
            success: true,
            message: 'Sesion iniciada correctamente',
            token,
            user: user.toPublicJSON(),
        });

    } catch (error) {


        // MODIFICADO:
        // REEMPLAZA next(error)

        console.error('ERROR LOGIN:', error);

        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
};


// @route   GET /api/auth/me
// @access  Private

const getMe = async (req, res, next) => {
    try {


        // BUSCAR USUARIO

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
            });
        }


        // RESPUESTA

        res.json({
            success: true,
            user: user.toPublicJSON(),
        });

    } catch (error) {


        // MODIFICADO:
        // REEMPLAZA next(error)

        console.error('ERROR GETME:', error);

        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
};


// EXPORTAR

module.exports = {
    register,
    login,
    getMe,
};