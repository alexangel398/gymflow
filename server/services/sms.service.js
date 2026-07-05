let twilioClient = null;

const getTwilioClient = () => {
    if (!twilioClient && process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
        const twilio = require('twilio');
        twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    }
    return twilioClient;
};

const sendSMS = async ({ to, message }) => {
    const client = getTwilioClient();

    if (!client) {
        console.log(`[SMS] To: ${to} | Message: ${message}`);
        return;
    }

    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE,
            to,
        });
        console.log(`[SMS] Enviado a ${to}`);
    } catch (err) {
        console.error(`[SMS ERROR] ${err.message}`);
    }
};

const sendClassReminderSMS = ({ to, memberName, className, time }) =>
    sendSMS({
        to,
        message: `GymFlow: Hola ${memberName}! Recordatorio: manana tenes "${className}" a las ${time}hs. Traje tu QR de asistencia. ¡Nos vemos!`,
    });

const sendWelcomeSMS = ({ to, memberName }) =>
    sendSMS({
        to,
        message: `GymFlow: ¡Bienvenido ${memberName}! Tu cuenta fue creada exitosamente. Ingresa a la app para explorar clases y planes.`,
    });

module.exports = { sendSMS, sendClassReminderSMS, sendWelcomeSMS };