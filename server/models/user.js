const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            maxlength: [100, 'El nombre no puede superar 100 caracteres'],
        },
        email: {
            type: String,
            required: [true, 'El email es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email invalido'],
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
            select: false, // nunca se devuelve en queries por defecto
        },
        role: {
            type: String,
            enum: ['admin', 'trainer', 'member'],
            default: 'member',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            maxlength: [500, 'La bio no puede superar 500 caracteres'],
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        subscription: {
            plan: {
                type: String,
                enum: ['none', 'monthly', 'quarterly', 'annual'],
                default: 'none',
            },
            status: {
                type: String,
                enum: ['active', 'inactive', 'past_due', 'canceled'],
                default: 'inactive',
            },
            stripeCustomerId: { type: String, default: '' },
            stripeSubscriptionId: { type: String, default: '' },
            currentPeriodEnd: { type: Date, default: null },
        },
    },
    {
        timestamps: true, // agrega createdAt y updatedAt automaticamente
    }
);

// Hook: hashear password antes de guardar
userSchema.pre('save', async function (next) {
    // Solo hashear si el password fue modificado
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Metodo de instancia: comparar password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Metodo de instancia: devolver datos publicos (sin password)
userSchema.methods.toPublicJSON = function () {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        phone: this.phone,
        avatar: this.avatar,
        bio: this.bio,
        isActive: this.isActive,
        subscription: this.subscription,
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.model('User', userSchema);