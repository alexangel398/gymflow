const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Class = require('../../models/Class');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:gymflow123@localhost:27017/gymflow_test?authSource=admin';

let adminToken, memberToken, adminUser, memberUser, testClass;

beforeAll(async () => {
    // 1. Asegurar conexión y dar tiempo a MongoDB
    await mongoose.connect(MONGO_URI);
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Limpieza previa por si quedaron datos de ejecuciones fallidas
    await User.deleteMany({ email: 'admin_class_test@gymflow.com' });
    await User.deleteMany({ email: 'member_class_test@gymflow.com' });

    // 3. Crear admin
    const adminRes = await request(app).post('/api/auth/register').send({
        name: 'Admin Test',
        email: 'admin_class_test@gymflow.com',
        password: 'test123456',
    });

    // 4. DEBUG: Si el registro falla, aquí veremos el error real del servidor
    if (!adminRes.body || !adminRes.body.user) {
        throw new Error(`Fallo en el registro del Admin: ${JSON.stringify(adminRes.body)}`);
    }

    adminUser = adminRes.body.user;
    await User.findByIdAndUpdate(adminUser._id, { role: 'admin' });

    const adminLogin = await request(app).post('/api/auth/login').send({
        email: 'admin_class_test@gymflow.com',
        password: 'test123456',
    });
    adminToken = adminLogin.body.token;

    // 5. Crear member
    const memberRes = await request(app).post('/api/auth/register').send({
        name: 'Member Test',
        email: 'member_class_test@gymflow.com',
        password: 'test123456',
    });
    memberUser = memberRes.body.user;
    memberToken = memberRes.body.token;
});

afterAll(async () => {
    // 1. Verificamos que la conexión esté abierta antes de borrar
    if (mongoose.connection.readyState === 1) {
        await User.deleteMany({ email: /_class_test@gymflow/ });
        await Class.deleteMany({ name: 'Test Class Jest' });

        // 2. Cerramos la conexión correctamente
        await mongoose.connection.close();
    }
});

describe('POST /api/classes', () => {
    it('admin puede crear una clase', async () => {
        const res = await request(app)
            .post('/api/classes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Class Jest',
                type: 'yoga',
                capacity: 10,
                location: 'Sala Test',
                schedule: { dayOfWeek: 1, startTime: '09:00', endTime: '10:00' },
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        testClass = res.body.data;
    });

    it('member no puede crear una clase', async () => {
        const res = await request(app)
            .post('/api/classes')
            .set('Authorization', `Bearer ${memberToken}`)
            .send({
                name: 'Test Class Member',
                type: 'yoga',
                capacity: 10,
                schedule: { dayOfWeek: 2, startTime: '10:00', endTime: '11:00' },
            });

        expect(res.status).toBe(403);
    });
});

describe('POST /api/classes/:id/enroll', () => {
    it('member puede inscribirse a una clase', async () => {
        const res = await request(app)
            .post(`/api/classes/${testClass._id}/enroll`)
            .set('Authorization', `Bearer ${memberToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('no puede inscribirse dos veces', async () => {
        const res = await request(app)
            .post(`/api/classes/${testClass._id}/enroll`)
            .set('Authorization', `Bearer ${memberToken}`);

        expect(res.status).toBe(409);
    });
});

describe('DELETE /api/classes/:id/enroll', () => {
    it('member puede cancelar su inscripcion', async () => {
        const res = await request(app)
            .delete(`/api/classes/${testClass._id}/enroll`)
            .set('Authorization', `Bearer ${memberToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});