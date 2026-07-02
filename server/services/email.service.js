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

const sendEnrollmentEmail = async ({ to, userName, className, day, time, trainer }) => {
  // En desarrollo solo logueamos si no hay SMTP configurado
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL] Inscripción de ${userName} en ${className} — ${to}`);
    return;
  }

  await transporter.sendMail({
    from: `"GymFlow" <${process.env.SMTP_USER}>`,
    to,
    subject: `✅ Inscripción confirmada — ${className}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#1B4F72;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">GymFlow</h1>
        </div>
        <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px">
          <h2 style="color:#1B4F72">¡Inscripción confirmada!</h2>
          <p style="color:#4a5568">Hola <strong>${userName}</strong>,</p>
          <p style="color:#4a5568">Te inscribiste exitosamente en:</p>
          <div style="background:#fff;border-left:4px solid #2E86C1;padding:16px;border-radius:4px;margin:16px 0">
            <p style="margin:0;font-size:18px;font-weight:bold;color:#1B4F72">${className}</p>
            <p style="margin:4px 0;color:#718096">📅 ${day}</p>
            <p style="margin:4px 0;color:#718096">🕐 ${time}</p>
            <p style="margin:4px 0;color:#718096">👤 ${trainer}</p>
          </div>
          <p style="color:#718096;font-size:13px">Si necesitás cancelar tu inscripción, podés hacerlo desde el portal.</p>
        </div>
      </div>
    `,
  });
};

const sendPlanAssignedEmail = async ({ to, memberName, trainerName, planTitle, planType }) => {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL] Plan "${planTitle}" asignado a ${memberName} — ${to}`);
    return;
  }

  await transporter.sendMail({
    from: `"GymFlow" <${process.env.SMTP_USER}>`,
    to,
    subject: `📋 Nuevo plan asignado — ${planTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#1B4F72;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">GymFlow</h1>
        </div>
        <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px">
          <h2 style="color:#1B4F72">¡Nuevo plan asignado!</h2>
          <p style="color:#4a5568">Hola <strong>${memberName}</strong>,</p>
          <p style="color:#4a5568">Tu entrenador <strong>${trainerName}</strong> te asignó un nuevo plan:</p>
          <div style="background:#fff;border-left:4px solid #27AE60;padding:16px;border-radius:4px;margin:16px 0">
            <p style="margin:0;font-size:18px;font-weight:bold;color:#1B4F72">${planTitle}</p>
            <p style="margin:4px 0;color:#718096">📋 Tipo: ${planType}</p>
            <p style="margin:4px 0;color:#718096">👤 Entrenador: ${trainerName}</p>
          </div>
          <p style="color:#718096;font-size:13px">Podés ver el detalle completo en tu portal GymFlow.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendEnrollmentEmail, sendPlanAssignedEmail };