import nodemailer from 'nodemailer';

const TO_EMAIL = process.env.NOTIFICATION_EMAIL || 'janine.diaz@slepllanquihue.cl';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Banco Escolar Colegual <notificaciones@bancocolegual.cl>';

let smtpTransporter = null;

function getToEmail() {
  const envEmail = process.env.NOTIFICATION_EMAIL;
  if (!envEmail) return 'janine.diaz@slepllanquihue.cl';
  return envEmail.trim().replace(/^["']|["']$/g, '');
}

export function getResolvedGmailPass() {
  const raw =
    process.env.GMAIL_APP_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD;
  if (!raw || !raw.trim()) return null;
  return raw.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
}

export function getResolvedGmailUser() {
  const direct =
    process.env.GMAIL_USER ||
    process.env.GMAIL_EMAIL ||
    process.env.GMAIL_ADDRESS ||
    process.env.GMAIL_CORREO ||
    process.env.GMAIL;
  if (direct && direct.trim()) return direct.trim().replace(/^["']|["']$/g, '');

  const smtp =
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.EMAIL ||
    process.env.USER_EMAIL ||
    process.env.CORREO ||
    process.env.CORREO_USER;
  if (smtp && smtp.trim()) return smtp.trim().replace(/^["']|["']$/g, '');

  // Si tiene clave de app configurada pero no definió usuario emisor, recurrir a NOTIFICATION_EMAIL
  const pass = getResolvedGmailPass();
  if (pass) {
    const notify = process.env.NOTIFICATION_EMAIL || 'janine.diaz@slepllanquihue.cl';
    return notify.trim().replace(/^["']|["']$/g, '');
  }

  return null;
}

export function getResolvedResendKey() {
  const raw =
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.RESEND_APIKEY ||
    process.env.RESEND_TOKEN;
  if (!raw || !raw.trim()) return null;
  return raw.trim().replace(/^["']|["']$/g, '');
}

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : null;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = getResolvedGmailUser();
  const pass = getResolvedGmailPass();

  if (host && user && pass) {
    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    return smtpTransporter;
  }

  // Soporte directo para cuentas de Google (Gmail y Google Workspace como @slepllanquihue.cl)
  if (user && pass) {
    smtpTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
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
  const targetTo = getToEmail();
  const resendApiKey = getResolvedResendKey();
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
          to: [targetTo],
          subject,
          html,
          text: text || subject
        })
      });

      if (!response.ok) {
        const errData = await response.text();
        console.error('[Mailer Resend] Error en respuesta de Resend:', response.status, errData);
        return { success: false, error: errData, provider: 'Resend' };
      }

      const data = await response.json();
      console.log(`[Mailer Resend] ✉️ Correo enviado exitosamente a ${targetTo} (ID: ${data.id})`);
      return { success: true, id: data.id, provider: 'Resend' };
    } catch (err) {
      console.error('[Mailer Resend] Error enviando correo:', err.message);
      return { success: false, error: err.message, provider: 'Resend' };
    }
  }

  // 2. Opción: Servidor SMTP / Gmail mediante Nodemailer
  if (transporter) {
    try {
      const gmailUser = getResolvedGmailUser();
      const fromHeader = gmailUser ? `"Banco Escolar Colegual" <${gmailUser}>` : FROM_EMAIL;
      const info = await transporter.sendMail({
        from: fromHeader,
        to: targetTo,
        subject,
        html,
        text: text || subject
      });
      console.log(`[Mailer SMTP] ✉️ Correo enviado exitosamente a ${targetTo} (MsgId: ${info.messageId})`);
      return { success: true, messageId: info.messageId, provider: 'SMTP/Gmail' };
    } catch (err) {
      console.error('[Mailer SMTP] Error enviando correo vía SMTP:', err.message);
      let helpfulMsg = err.message;
      if (err.message.includes('ENETUNREACH') || err.message.includes('ETIMEDOUT') || err.message.includes('465') || err.message.includes('587')) {
        helpfulMsg = 'Render bloquea los puertos tradicionales de correo (465/587) para evitar spam. La solución definitiva y gratuita es usar Resend (HTTP vía puerto 443): crea una cuenta en resend.com y agrega RESEND_API_KEY en Render.';
      }
      return { success: false, error: helpfulMsg, provider: 'SMTP/Gmail' };
    }
  }

  // 3. Si no hay credenciales configuradas en Render, registrar en log informativo
  console.log(`[Mailer Demo] 📬 [SIMULACIÓN] Correo para: ${targetTo}`);
  console.log(`              Asunto: ${subject}`);
  console.log(`              (Para habilitar el envío real en producción, configura RESEND_API_KEY o GMAIL_USER/GMAIL_APP_PASS en Render)`);
  return { simulated: true, to: targetTo, subject, message: 'Simulado (sin credenciales en Render)' };
}

export function getMailerStatus() {
  const resendApiKey = getResolvedResendKey();
  const gmailUser = getResolvedGmailUser();
  const gmailPass = getResolvedGmailPass();
  const smtpHost = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : null;
  const toEmail = getToEmail();

  const isConfigured = !!(resendApiKey || (gmailUser && gmailPass) || (smtpHost && gmailUser && gmailPass));

  return {
    configured: isConfigured,
    method: resendApiKey ? 'Resend API' : (gmailUser ? 'Gmail SMTP' : (smtpHost ? 'Custom SMTP' : 'Ninguno (Modo Simulación)')),
    targetEmail: toEmail,
    senderEmail: gmailUser || null,
    gmailAccount: gmailUser ? `${gmailUser.substring(0, 3)}***@${gmailUser.split('@')[1] || 'gmail.com'}` : null,
    hasResendKey: !!resendApiKey,
    hasGmailPass: !!gmailPass,
    hasGmailUser: !!(process.env.GMAIL_USER || process.env.SMTP_USER || process.env.EMAIL_USER)
  };
}

export async function testEmailConnection() {
  const status = getMailerStatus();
  if (!status.configured) {
    return {
      success: false,
      status,
      error: 'No hay credenciales de correo configuradas en Render. Debes agregar GMAIL_USER y GMAIL_APP_PASS (o RESEND_API_KEY).'
    };
  }

  const subject = '🔔 Prueba de Notificación - Banco Escolar Colegual';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #065f46; margin-top: 0;">🎉 ¡Conexión Exitosa con Banco Colegual!</h2>
      <p style="color: #334155; font-size: 15px;">Este es un correo de prueba automático para confirmar que el sistema de notificaciones está 100% activo.</p>
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>Destinatario:</strong> ${status.targetEmail}</p>
        <p style="margin: 4px 0;"><strong>Método:</strong> ${status.method}</p>
        <p style="margin: 4px 0;"><strong>Fecha y Hora:</strong> ${new Date().toLocaleString('es-CL')}</p>
      </div>
      <p style="color: #64748b; font-size: 13px;">A partir de ahora, cada asignación de puntos o canje de premios te enviará una notificación institucional como esta.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <div style="font-size: 12px; color: #94a3b8; text-align: center;">
        🌟 Recurso realizado por Janine Díaz Calixto - Coordinación de la Vida Escolar<br/>
        Escuela Rural Colegual (RBD 7967, Llanquihue)
      </div>
    </div>
  `;

  const res = await sendEmail({ subject, html, text: 'Prueba de correo Banco Colegual exitosa.' });
  return { ...res, status };
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
