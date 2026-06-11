import 'server-only';
import sgMail from '@sendgrid/mail';

// Envío de emails transaccionales via SendGrid (@sendgrid/mail).
//
// Configuración en .env:
//   SENDGRID_API_KEY=SG.xxxx   ← obtené una en https://sendgrid.com
//   SENDGRID_FROM_EMAIL=no-reply@tudominio.com  (Single Sender verificado)
//
// Si SENDGRID_API_KEY no está configurada, el envío se simula por consola
// (útil en desarrollo sin cuenta SendGrid).

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL ?? 'no-reply@fwd.cr',
  name: 'FWD Marketplace',
};
const APP_URL = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

const sendgridKey = process.env.SENDGRID_API_KEY;
if (sendgridKey) {
  sgMail.setApiKey(sendgridKey);
}

async function enviarEmail(to: string, subject: string, html: string): Promise<void> {
  if (!sendgridKey) {
    // Modo desarrollo: simulación por consola
    console.log('\n──────────────── EMAIL SIMULADO ────────────────');
    console.log(`Para:    ${to}`);
    console.log(`Asunto:  ${subject}`);
    console.log('────────────────────────────────────────────────\n');
    return;
  }

  try {
    await sgMail.send({ to, from: FROM, subject, html });
  } catch (err) {
    // No lanzamos el error para no romper el flujo de negocio si el email falla
    console.error('[EMAIL ERROR] No se pudo enviar con SendGrid:', err);
  }
}

// Email de invitación que envía el admin para que el estudiante se registre
export async function enviarEmailInvitacion(email: string): Promise<void> {
  const registroUrl = `${APP_URL}/es/register-estudiante`;
  await enviarEmail(
    email,
    '¡Fuiste invitado a FWD Marketplace!',
    `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#4f46e5">¡Tenés una invitación!</h2>
      <p>El equipo de <strong>FWD Marketplace</strong> te invitó a unirte a la plataforma.</p>
      <p>Hacé clic en el botón para completar tu registro con este correo (<strong>${email}</strong>).</p>
      <a href="${registroUrl}"
         style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:16px;font-weight:600">
        Completar registro
      </a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#9ca3af;font-size:13px">Si no esperabas esta invitación, podés ignorar este correo.</p>
    </div>
    `
  );
}

// Email que recibe el estudiante al enviar la solicitud de acceso
export async function enviarEmailCuentaPendiente(
  email: string,
  nombre: string
): Promise<void> {
  await enviarEmail(
    email,
    'Solicitud de acceso recibida — FWD Marketplace',
    `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#4f46e5">¡Hola, ${nombre}!</h2>
      <p>Recibimos tu solicitud de acceso a <strong>FWD Marketplace</strong>.</p>
      <p>Un administrador revisará tu solicitud en breve. Recibirás un correo de confirmación cuando sea aprobada.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#9ca3af;font-size:13px">Si no solicitaste acceso, ignorá este correo.</p>
    </div>
    `
  );
}

// Email que recibe el estudiante cuando el admin aprueba su cuenta
export async function enviarEmailCuentaAprobada(
  email: string,
  nombre: string
): Promise<void> {
  await enviarEmail(
    email,
    '¡Tu cuenta fue aprobada! — FWD Marketplace',
    `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#4f46e5">¡Bienvenido, ${nombre}!</h2>
      <p>Tu cuenta en <strong>FWD Marketplace</strong> fue <strong>aprobada</strong> por el administrador.</p>
      <p>Ya podés iniciar sesión con tu correo y contraseña.</p>
      <a href="${APP_URL}/es/login"
         style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:16px;font-weight:600">
        Iniciar sesión
      </a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#9ca3af;font-size:13px">FWD Marketplace — marketplace de proyectos universitarios</p>
    </div>
    `
  );
}
