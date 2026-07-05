const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // separamos app de server

// Registrar y loguear usuario de prueba
const createTestUser = async (role = 'member') => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: `Test ${role}`,
            email: `test_${role}_${Date.now()}@gymflow.com`,
            password: 'test123456',
        });

    // Si es admin o trainer, actualizar rol directo en BD
    if (role !== 'member') {
        const User = require('../models/User');
        await User.findByIdAndUpdate(res.body.user._id, { role });
    }

    return {
        token: res.body.token,
        user: res.body.user,
    };
};

const loginUser = async (email, password) => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.token;
};

module.exports = { createTestUser, loginUser };