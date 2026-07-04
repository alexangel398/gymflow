const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            maxlength: [100, 'Máximo 100 caracteres'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Máximo 500 caracteres'],
            default: '',
        },
        type: {
            type: String,
            enum: ['yoga', 'crossfit', 'spinning', 'pilates', 'funcional', 'hiit', 'boxeo', 'otro'],
            default: 'otro',
        },
        trainer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'El entrenador es obligatorio'],
        },
        schedule: {
            dayOfWeek: {
                type: Number, // 0=Dom, 1=Lun ... 6=Sab
                required: true,
                min: 0,
                max: 6,
            },
            startTime: {
                type: String, // "09:00"
                required: true,
                match: [/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'],
            },
            endTime: {
                type: String,
                required: true,
                match: [/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'],
            },
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, 'La capacidad mínima es 1'],
            max: [100, 'La capacidad máxima es 100'],
        },
        enrolled: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                enrolledAt: { type: Date, default: Date.now },
            },
        ],
        location: {
            type: String,
            trim: true,
            default: 'Sala principal',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        color: {
            type: String,
            default: '#2E86C1', // color para el calendario
        },
    },
    { timestamps: true }
);


// Virtual: cantidad de inscriptos
classSchema.virtual('enrolledCount').get(function () {
    const enrolled = Array.isArray(this.enrolled) ? this.enrolled : [];
    return enrolled.length;
});

// Virtual: cupos disponibles
classSchema.virtual('availableSpots').get(function () {
    const enrolled = Array.isArray(this.enrolled) ? this.enrolled : [];
    return (this.capacity ?? 0) - enrolled.length;
});

// Virtual: si la clase está llena
classSchema.virtual('isFull').get(function () {
    const enrolled = Array.isArray(this.enrolled) ? this.enrolled : [];
    return enrolled.length >= (this.capacity ?? 0);
});

classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Class', classSchema);