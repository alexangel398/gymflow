const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            default: null,
        },
        method: {
            type: String,
            enum: ['qr', 'manual'],
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            default: '',
            maxlength: 200,
        },
    },
    { timestamps: true }
);

// Indice para evitar duplicados el mismo dia
attendanceSchema.index(
    { member: 1, date: 1 },
    {
        unique: false, // permitimos múltiples por dia (diferentes clases)
    }
);

module.exports = mongoose.model('Attendance', attendanceSchema);