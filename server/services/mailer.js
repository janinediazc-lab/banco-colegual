import nodemailer from 'nodemailer';

const TO_EMAIL = process.env.NOTIFICATION_EMAIL || 'janine.diaz@slepllanquihue.cl';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Banco Escolar Colegual <notificaciones@bancocolegual.cl>';

let smtpTransporter = null;

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    return smtpTransporter;
  }

  // Soporte directo para Gmail si se provee GMAIL_USER y GMAIL_APP_PASS
  const gmailUser = process.env.GMAIL_USER || (user && user.includes('@gmail.com') ? user : null);
  const gmailPass = process.env.GMAIL_APP_PASS || pass;

  if (gmailUser && gmailPass) {
    smtpTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass }
    });
    return smtpTransporter;
  }

  return null;
}

/**
 * Envía un correo electrónico utilizando Resend API (HTTP REST) o Nodemailer (SMTP).
 * Es completamente asíncrono y no bloquea el servidor si el servicio de correo tiene demoras.
 */
export async function sendEmail({ subject, html, text }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const transporter = getSmtpTransporter();

  // 1. Prioridad: Resend API (HTTP REST, sin puertos SMTP bloqueados)
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Banco Escolar Colegual <onboarding@resend.dev>',
          to: [TO_EMAIL],
          subject,
          html,
          text: text || subject
        })
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error('[Mailer Resend] Error en respuesta de Resend:', response.status, errData);
        return { success: false, error: errData };
      }

      const data = await response.json();
      console.log(`[Mailer Resend] ✉️ Correo enviado exitosamente a ${TO_EMAIL} (ID: ${data.id})`);
      return { success: true, id: data.id };
    } catch (err) {
      console.error('[Mailer Resend] Error enviando correo:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Opción: Servidor SMTP / Gmail mediante Nodemailer
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        subject,
        html,
        text: text || subject
      });
      console.log(`[Mailer SMTP] ✉️ Correo enviado exitosamente a ${TO_EMAIL} (MsgId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[Mailer SMTP] Error enviando correo vía SMTP:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. Si no hay credenciales configuradas en Render, registrar en log informativo
  console.log(`[Mailer Demo] 📬 [SIMULACIÓN] Correo para: ${TO_EMAIL}`);
  console.log(`              Asunto: ${subject}`);
  console.log(`              (Para habilitar el envío real en producción, configura RESEND_API_KEY o SMTP_USER/SMTP_PASS en Render)`);
  return { simulated: true, to: TO_EMAIL, subject };
}

/**
 * Plantilla HTML formal e institucional para notificaciones de abono de puntos
 */
export function formatTransactionEmail({ student, teacher, amount, reason, newBalance, type, dateStr }) {
  const isPositive = amount > 0;
  const isRedeem = type === 'CANJE';
  const badgeColor = isRedeem ? '#8b5cf6' : (isPositive ? '#059669' : '#dc2626');
  const badgeText = isRedeem ? `🎁 Canje: -${Math.abs(amount)} CC` : (isPositive ? `🪙 +${amount} ColegualCoins` : `⚠️ -${Math.abs(amount)} CC`);
  const title = isRedeem ? 'Canje de Recompensa Escolar' : (isPositive ? 'Nuevo Abono de Puntos Registrado' : 'Descuento de Puntos Registrado');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
      .header { background: linear-gradient(135deg, #064e3b 0%, #047857 100%); color: #ffffff; padding: 24px 28px; text-align: center; }
      .header h1 { margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.02em; }
      .header p { margin: 4px 0 0 0; font-size: 12px; color: #a7f3d0; }
      .content { padding: 28px; }
      .badge-row { text-align: center; margin-bottom: 20px; }
      .badge { display: inline-block; background-color: ${badgeColor}; color: #ffffff; padding: 8px 18px; border-radius: 99px; font-weight: 800; font-size: 15px; letter-spacing: 0.02em; }
      .card-details { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px; }
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; }
      .detail-row:last-child { border-bottom: none; }
      .label { color: #64748b; font-weight: 600; }
      .value { color: #0f172a; font-weight: 700; text-align: right; }
      .value.highlight { color: #064e3b; font-size: 15px; }
      .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 11.5px; color: #64748b; line-height: 1.5; }
      .footer strong { color: #064e3b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🏛️ BANCO ESCOLAR COLEGUAL</h1>
        <p>Escuela Rural Colegual • RBD 7967 • Llanquihue, Los Lagos</p>
      </div>
      <div class="content">
        <div class="badge-row">
          <span class="badge">${badgeText}</span>
        </div>
        <p style="font-size: 14px; color: #334155; margin-top: 0; text-align: center;">
          Se ha registrado una asignación de puntos en la plataforma del banco escolar:
        </p>
        <div class="card-details">
          <div class="detail-row">
            <span class="label">Estudiante:</span>
            <span class="value">${student.nombre_display || student.nombre_completo}</span>
          </div>
          <div class="detail-row">
            <span class="label">Curso:</span>
            <span class="value">${student.curso}</span>
          </div>
          <div class="detail-row">
            <span class="label">RUN:</span>
            <span class="value">${student.run}</span>
          </div>
          <div class="detail-row">
            <span class="label">Docente / Funcionario:</span>
            <span class="value">${teacher || 'Funcionario Colegual'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Motivo pedagógico:</span>
            <span class="value">${reason || 'Reconocimiento escolar'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Nuevo saldo disponible:</span>
            <span class="value highlight">🪙 ${newBalance} ColegualCoins</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha y Hora:</span>
            <span class="value">${dateStr}</span>
          </div>
        </div>
      </div>
      <div class="footer">
        Esta es una notificación automática enviada a la <strong>Coordinadora de Vida Escolar (Janine Díaz Calixto)</strong>.<br>
        Sistema de Recompensas Pedagógicas • Escuela Rural Colegual
      </div>
    </div>
  </body>
  </html>
  `;

  const subject = isRedeem 
    ? `🎁 [Banco Colegual] Canje: ${student.nombre_display} (${student.curso}) - ${Math.abs(amount)} CC`
    : `🪙 [Banco Colegual] Abono de puntos: +${amount} CC a ${student.nombre_display} (${student.curso})`;

  return { subject, html };
}

/**
 * Plantilla para bonos masivos a todo un curso
 */
export function formatBatchEmail({ courseName, teacher, amount, reason, studentCount, dateStr }) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
      .header { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; padding: 24px 28px; text-align: center; }
      .header h1 { margin: 0; font-size: 19px; font-weight: 800; }
      .header p { margin: 4px 0 0 0; font-size: 12px; color: #fef08a; }
      .content { padding: 28px; }
      .badge-row { text-align: center; margin-bottom: 20px; }
      .badge { display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 8px 18px; border-radius: 99px; font-weight: 800; font-size: 15px; }
      .card-details { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px; }
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13.5px; }
      .detail-row:last-child { border-bottom: none; }
      .label { color: #64748b; font-weight: 600; }
      .value { color: #0f172a; font-weight: 700; text-align: right; }
      .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 11.5px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🌟 BONO GRUPAL DE CURSO • BANCO COLEGUAL</h1>
        <p>Escuela Rural Colegual • RBD 7967 • Llanquihue</p>
      </div>
      <div class="content">
        <div class="badge-row">
          <span class="badge">🌟 Bono Grupal: +${amount} CC por Alumno</span>
        </div>
        <div class="card-details">
          <div class="detail-row">
            <span class="label">Curso Beneficiado:</span>
            <span class="value">${courseName}</span>
          </div>
          <div class="detail-row">
            <span class="label">Estudiantes que recibieron bono:</span>
            <span class="value">${studentCount} alumnos</span>
          </div>
          <div class="detail-row">
            <span class="label">Docente Responsable:</span>
            <span class="value">${teacher}</span>
          </div>
          <div class="detail-row">
            <span class="label">Motivo:</span>
            <span class="value">${reason}</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha y Hora:</span>
            <span class="value">${dateStr}</span>
          </div>
        </div>
      </div>
      <div class="footer">
        Notificación automática para la <strong>Coordinadora de Vida Escolar (Janine Díaz Calixto)</strong>.
      </div>
    </div>
  </body>
  </html>
  `;

  const subject = `🌟 [Banco Colegual] Bono Grupal: +${amount} CC para ${courseName} (${studentCount} alumnos)`;
  return { subject, html };
}
