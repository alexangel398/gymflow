const cron = require('node-cron');
const User = require('../models/User');
const Class = require('../models/Class');
const Subscription = require('../models/Subscription');
const { sendClassReminderEmail, sendSubscriptionExpiryEmail } = require('./email.service');
const { sendClassReminderSMS } = require('./sms.service');

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

// Recordatorio de clases — todos los dias a las 18:00
const scheduleClassReminders = () => {
    cron.schedule('0 18 * * *', async () => {
        console.log('[CRON] Enviando recordatorios de clases...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayOfWeek = tomorrow.getDay();

            // Clases del dia siguiente
            const classes = await Class.find({
                'schedule.dayOfWeek': dayOfWeek,
                isActive: true,
            }).populate('trainer', 'name');

            for (const gymClass of classes) {
                // Miembros inscriptos con email/phone
                const enrolledIds = gymClass.enrolled.map(e => e.user);
                const members = await User.find({
                    _id: { $in: enrolledIds },
                    isActive: true,
                });

                for (const member of members) {
                    const reminderData = {
                        userName: member.name,
                        className: gymClass.name,
                        day: DAYS_ES[dayOfWeek],
                        time: gymClass.schedule.startTime,
                        trainer: gymClass.trainer?.name || 'Por confirmar',
                    };

                    // Email
                    await sendClassReminderEmail({ to: member.email, ...reminderData });

                    // SMS si tiene telefono
                    if (member.phone) {
                        await sendClassReminderSMS({
                            to: member.phone,
                            memberName: member.name,
                            className: gymClass.name,
                            time: gymClass.schedule.startTime,
                        });
                    }
                }
            }
            console.log('[CRON] Recordatorios enviados');
        } catch (err) {
            console.error('[CRON ERROR]', err.message);
        }
    }, { timezone: 'America/Argentina/Buenos_Aires' });
};

// Alerta de vencimiento de suscripcion — todos los dias a las 09:00
const scheduleExpiryAlerts = () => {
    cron.schedule('0 9 * * *', async () => {
        console.log('[CRON] Verificando suscripciones por vencer...');
        try {
            const in3Days = new Date();
            in3Days.setDate(in3Days.getDate() + 3);
            in3Days.setHours(23, 59, 59, 999);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const expiring = await Subscription.find({
                status: 'active',
                currentPeriodEnd: { $gte: today, $lte: in3Days },
            }).populate('member', 'name email');

            const PLAN_LABELS = { monthly: 'Mensual', quarterly: 'Trimestral', annual: 'Anual' };

            for (const sub of expiring) {
                if (!sub.member) continue;
                await sendSubscriptionExpiryEmail({
                    to: sub.member.email,
                    memberName: sub.member.name,
                    planName: PLAN_LABELS[sub.plan] || sub.plan,
                    expiryDate: new Date(sub.currentPeriodEnd).toLocaleDateString('es-AR'),
                });
                console.log(`[CRON] Alerta vencimiento enviada a ${sub.member.email}`);
            }
        } catch (err) {
            console.error('[CRON ERROR]', err.message);
        }
    }, { timezone: 'America/Argentina/Buenos_Aires' });
};

const initCronJobs = () => {
    scheduleClassReminders();
    scheduleExpiryAlerts();
    console.log('✅ Cron jobs iniciados');
};

module.exports = { initCronJobs };