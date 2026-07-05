const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:gymflow123@localhost:27017/gymflow_test?authSource=admin';

beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    await User.deleteMany({ email: /gymflow_test/ });
});

afterAll(async () => {
    // 1. Verificamos que mongoose esté conectado antes de borrar
    if (mongoose.connection && mongoose.connection.readyState === 1) {
        await User.deleteMany({ email: /gymflow_test/ });
        // 2. Cerramos la conexión
        await mongoose.connection.close();
    }
});

describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test_gymflow_test@gymflow.com',
                password: 'test123456',
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.role).toBe('member');
    });

    it('debe fallar con email duplicado', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User 2',
                email: 'test_gymflow_test@gymflow.com',
                password: 'test123456',
            });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });

    it('debe fallar con password corto', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User 3',
                email: 'test3_gymflow_test@gymflow.com',
                password: '123',
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('POST /api/auth/login', () => {
    it('debe loguear con credenciales correctas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test_gymflow_test@gymflow.com',
                password: 'test123456',
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
    });

    it('debe fallar con password incorrecto', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test_gymflow_test@gymflow.com',
                password: 'wrongpassword',
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test_gymflow_test@gymflow.com',
                password: 'test123456',
            });
        token = res.body.token;
    });

    it('debe retornar el usuario autenticado', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('test_gymflow_test@gymflow.com');
    });

    it('debe fallar sin token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});