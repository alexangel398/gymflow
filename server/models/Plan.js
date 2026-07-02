const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: { type: Number, default: 3 },
    reps: { type: String, default: '10' },
    rest: { type: String, default: '60s' },
    notes: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
});

const workoutDaySchema = new mongoose.Schema({
    day: { type: String, required: true },
    focus: { type: String, default: '' },
    exercises: [exerciseSchema],
    notes: { type: String, default: '' },
});

const mealSchema = new mongoose.Schema({
    time: { type: String, default: '' },
    name: { type: String, required: true },
    foods: [{ type: String }],
    calories: { type: Number, default: 0 },
    notes: { type: String, default: '' },
});

const planSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 100 },
        type: { type: String, enum: ['workout', 'diet'], required: true },
        trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        description: { type: String, default: '', maxlength: 500 },
        goal: {
            type: String,
            enum: ['perdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento', 'salud'],
            default: 'salud',
        },
        duration: { type: Number, default: 4 },
        isActive: { type: Boolean, default: true },
        workoutDays: [workoutDaySchema],
        meals: [mealSchema],
        totalCalories: { type: Number, default: 0 },
        macros: {
            protein: { type: Number, default: 0 },
            carbs: { type: Number, default: 0 },
            fats: { type: Number, default: 0 },
        },
        fileUrl: { type: String, default: '' },
        fileName: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
