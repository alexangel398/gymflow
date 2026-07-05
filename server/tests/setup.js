const mongoose = require('mongoose');

beforeAll(async () => {
    // Usar variables de entorno de test
    process.env.JWT_SECRET = 'test_secret_key_gymflow';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.NODE_ENV = 'test';
});

afterAll(async () => {
    await mongoose.connection.close();
});