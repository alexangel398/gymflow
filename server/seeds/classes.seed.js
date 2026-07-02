const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});
console.log("ENV:", process.env.MONGO_URI);

const mongoose = require('mongoose');
const Class = require('../models/Class');
const User = require('../models/User');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Buscar un trainer o admin para asignar
    const trainer = await User.findOne({ role: { $in: ['trainer', 'admin'] } });
    if (!trainer) {
        console.log('❌ No hay trainer/admin. Registrá uno primero.');
        process.exit(1);
    }

    await Class.deleteMany({});

    const classes = [
        { name: 'Yoga Matutino', type: 'yoga', trainer: trainer._id, capacity: 12, location: 'Sala A', color: '#8E44AD', schedule: { dayOfWeek: 1, startTime: '08:00', endTime: '09:00' } },
        { name: 'CrossFit', type: 'crossfit', trainer: trainer._id, capacity: 15, location: 'Sala B', color: '#E74C3C', schedule: { dayOfWeek: 1, startTime: '10:00', endTime: '11:00' } },
        { name: 'Spinning', type: 'spinning', trainer: trainer._id, capacity: 20, location: 'Sala C', color: '#F39C12', schedule: { dayOfWeek: 2, startTime: '18:00', endTime: '19:00' } },
        { name: 'Pilates', type: 'pilates', trainer: trainer._id, capacity: 10, location: 'Sala A', color: '#27AE60', schedule: { dayOfWeek: 3, startTime: '09:00', endTime: '10:00' } },
        { name: 'HIIT', type: 'hiit', trainer: trainer._id, capacity: 15, location: 'Sala B', color: '#E67E22', schedule: { dayOfWeek: 3, startTime: '19:00', endTime: '20:00' } },
        { name: 'Funcional', type: 'funcional', trainer: trainer._id, capacity: 12, location: 'Sala C', color: '#2E86C1', schedule: { dayOfWeek: 4, startTime: '07:00', endTime: '08:00' } },
        { name: 'Boxeo Fitness', type: 'boxeo', trainer: trainer._id, capacity: 10, location: 'Sala B', color: '#C0392B', schedule: { dayOfWeek: 5, startTime: '18:00', endTime: '19:30' } },
        { name: 'Yoga Vespertino', type: 'yoga', trainer: trainer._id, capacity: 12, location: 'Sala A', color: '#8E44AD', schedule: { dayOfWeek: 6, startTime: '10:00', endTime: '11:00' } },
    ];

    await Class.insertMany(classes);
    console.log(`✅ ${classes.length} clases creadas para ${trainer.name}`);
    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });