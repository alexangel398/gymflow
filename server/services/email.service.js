const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Template base
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 520px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
    .header { background: linear-gradient(135deg, #1B4F72, #2E86C1); padding: 28px 32px; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .body h2 { color: #1B4F72; margin: 0 0 16px; font-size: 20px; }
    .body p { color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0 0 12px; }
    .card { background: #f8fafc; border-left: 4px solid #2E86C1; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .card p { margin: 4px 0; font-size: 14px; color: #4a5568; }
    .card strong { color: #1B4F72; }
    .btn { display: inline-block; background: #2E86C1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 16px 0; }
    .footer { background: #f1f5f9; padding: 16px 32px; text-align: center; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-blue  { background: #dbeafe; color: #1e40af; }
    .badge-orange{ background: #fed7aa; color: #9a3412; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GymFlow</h1>
      <p>Sistema de Gestion de Gimnasio</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>Este email fue enviado automaticamente por GymFlow · No respondas este mensaje</p>
    </div>
  </div>
</body>
</html>
`;

// Funcion generica de envio
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: `"GymFlow" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

// — Templates especificos —

const sendWelcomeEmail = ({ to, name }) =>
  sendEmail({
    to,
    subject: '👋 Bienvenido a GymFlow',
    html: baseTemplate(`
      <h2>¡Bienvenido, ${name}!</h2>
      <p>Tu cuenta en GymFlow fue creada exitosamente. Ya podes empezar a disfrutar de todos los beneficios.</p>
      <div class="card">
        <p>✅ <strong>Inscribite a clases</strong> desde el calendario semanal</p>
        <p>📋 <strong>Accede a tus planes</strong> de entrenamiento y dieta</p>
        <p>📱 <strong>Genera tu QR</strong> para registrar asistencia</p>
        <p>💳 <strong>Gestioná tu suscripcion</strong> desde el panel de pagos</p>
      </div>
      <p>Si tenes alguna consulta, contacta al administrador del gimnasio.</p>
    `),
  });

const sendEnrollmentEmail = ({ to, userName, className, day, time, trainer }) =>
  sendEmail({
    to,
    subject: `✅ Inscripcion confirmada — ${className}`,
    html: baseTemplate(`
      <h2>¡Inscripcion confirmada!</h2>
      <p>Hola <strong>${userName}</strong>, te inscribiste exitosamente en:</p>
      <div class="card">
        <p><strong style="font-size:16px">${className}</strong></p>
        <p>📅 ${day}</p>
        <p>🕐 ${time}</p>
        <p>👤 Entrenador: ${trainer}</p>
      </div>
      <p>Recordá llegar 5 minutos antes y traer tu QR de asistencia.</p>
    `),
  });

const sendClassReminderEmail = ({ to, userName, className, day, time, trainer }) =>
  sendEmail({
    to,
    subject: `⏰ Recordatorio — ${className} manana`,
    html: baseTemplate(`
      <h2>Te esperamos manana</h2>
      <p>Hola <strong>${userName}</strong>, te recordamos que manana tenes clase:</p>
      <div class="card">
        <p><strong style="font-size:16px">${className}</strong></p>
        <p>📅 ${day}</p>
        <p>🕐 ${time}</p>
        <p>👤 Entrenador: ${trainer}</p>
      </div>
      <p>No olvides traer tu <strong>codigo QR</strong> desde la seccion Asistencia de la app.</p>
    `),
  });
  

const sendPlanAssignedEmail = ({ to, memberName, trainerName, planTitle, planType }) =>
  sendEmail({
    to,
    subject: `📋 Nuevo plan asignado — ${planTitle}`,
    html: baseTemplate(`
      <h2>Nuevo plan asignado</h2>
      <p>Hola <strong>${memberName}</strong>, tu entrenador <strong>${trainerName}</strong> te asigno un nuevo plan:</p>
      <div class="card">
        <p><strong style="font-size:16px">${planTitle}</strong></p>
        <p>📋 Tipo: ${planType}</p>
        <p>👤 Entrenador: ${trainerName}</p>
      </div>
      <p>Podes ver el detalle completo en la seccion <strong>Mis Planes</strong> de GymFlow.</p>
    `),
  });

const sendPaymentReceiptEmail = ({ to, memberName, planName, amount, periodEnd }) =>
  sendEmail({
    to,
    subject: '💳 Recibo de pago — GymFlow',
    html: baseTemplate(`
      <h2>Pago confirmado</h2>
      <p>Hola <strong>${memberName}</strong>, tu pago fue procesado exitosamente.</p>
      <div class="card">
        <p>📋 Plan: <strong>${planName}</strong></p>
        <p>💰 Monto: <strong>${amount}</strong></p>
        <p>📅 Valido hasta: <strong>${periodEnd}</strong></p>
        <p><span class="badge badge-green">✅ PAGADO</span></p>
      </div>
      <p>Gracias por confiar en GymFlow. ¡A entrenar!</p>
    `),
  });

const sendSubscriptionExpiryEmail = ({ to, memberName, planName, expiryDate }) =>
  sendEmail({
    to,
    subject: '⚠️ Tu suscripcion vence pronto — GymFlow',
    html: baseTemplate(`
      <h2>Tu suscripcion vence pronto</h2>
      <p>Hola <strong>${memberName}</strong>, te avisamos que tu suscripcion vence el <strong>${expiryDate}</strong>.</p>
      <div class="card">
        <p>📋 Plan: <strong>${planName}</strong></p>
        <p>📅 Fecha de vencimiento: <strong>${expiryDate}</strong></p>
        <p><span class="badge badge-orange">⚠️ PROXIMO A VENCER</span></p>
      </div>
      <p>Renova tu plan para seguir disfrutando de todos los beneficios sin interrupciones.</p>
    `),
  });

module.exports = {
  sendWelcomeEmail,
  sendEnrollmentEmail,
  sendClassReminderEmail,
  sendPlanAssignedEmail,
  sendPaymentReceiptEmail,
  sendSubscriptionExpiryEmail,
};