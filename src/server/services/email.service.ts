import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// Servicio de correo (SMTP vía nodemailer). Usa EMAIL_USER / EMAIL_PASS /
// EMAIL_FROM del .env. Host/puerto opcionales (por defecto Gmail SMTP).
// Si faltan credenciales, NO envía y solo registra en consola — el flujo de
// recuperación nunca se rompe por un fallo de correo.

// ¿El valor es real (no vacío ni placeholder tipo "XXXX")?
function esReal(v: string | undefined): boolean {
  const t = (v || "").trim();
  return t.length > 0 && !/^x+$/i.test(t);
}

// Nombre visible del remitente (mejora la confianza y reduce spam).
const NOMBRE_REMITENTE = "FWD Marketplace";

// Remitente SMTP: EMAIL_FROM solo si es real y tiene "@"; si no, el EMAIL_USER
// autenticado. Siempre con nombre visible. NUNCA usa el placeholder "XXXX".
function fromSmtp(): string {
  const f = (process.env.EMAIL_FROM || "").trim();
  if (esReal(f) && /@/.test(f)) {
    // Si ya trae nombre ("Nombre <correo>") lo respetamos; si es solo el correo,
    // le anteponemos el nombre de marca.
    return /</.test(f) ? f : `${NOMBRE_REMITENTE} <${f}>`;
  }
  const user = (process.env.EMAIL_USER || "").trim();
  if (esReal(user)) return `${NOMBRE_REMITENTE} <${user}>`;
  return `${NOMBRE_REMITENTE} <no-reply@fwd.cr>`;
}

// Remitente válido para Resend: usa EMAIL_FROM si es real; si no, el remitente
// de pruebas de Resend (onboarding@resend.dev), que envía a tu propio correo.
function fromResend(): string {
  const f = (process.env.EMAIL_FROM || "").trim();
  if (esReal(f) && /@/.test(f)) return f;
  return "FWD Marketplace <onboarding@resend.dev>";
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!esReal(user) || !esReal(pass)) return null;

  const port = Number(process.env.EMAIL_PORT || 587);
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

interface OpcionesCorreo {
  to: string;
  subject: string;
  html: string;
  /** Versión texto plano (multipart/alternative) — clave para no caer en spam. */
  text: string;
  /** Dirección a la que se responde (p. ej. el remitente del formulario). */
  replyTo?: string;
}

async function enviar({ to, subject, html, text, replyTo }: OpcionesCorreo) {
  // 1) Resend (API HTTP, sin dependencias): la opción más simple.
  const resendKey = process.env.RESEND_API_KEY;
  if (esReal(resendKey)) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromResend(),
          to,
          subject,
          html,
          text,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      if (!res.ok) {
        console.error("[email] Resend error:", res.status, await res.text().catch(() => ""));
      } else {
        console.info("[email] enviado vía Resend");
      }
    } catch (err) {
      console.error("[email] Resend falló:", err);
    }
    return;
  }

  // 2) SMTP (nodemailer) — p. ej. Gmail con contraseña de aplicación.
  const t = getTransporter();
  if (!t) {
    console.warn(
      `[email] Sin proveedor configurado (RESEND_API_KEY o EMAIL_USER/EMAIL_PASS reales) — correo omitido: "${subject}" -> ${to}`,
    );
    return;
  }
  try {
    await t.sendMail({
      from: fromSmtp(),
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    console.info("[email] enviado vía SMTP");
  } catch (err) {
    console.error("[email] Error SMTP:", err);
  }
}

// URL pública del logo (Gmail/Outlook cargan imágenes remotas de forma
// confiable; las imágenes embebidas por CID son inconsistentes en Gmail web).
// Prioridad: EMAIL_LOGO_URL → logo en Supabase Storage (bucket público) →
// vacío (la plantilla usa un texto de marca como respaldo).
function logoUrl(): string {
  const override = (process.env.EMAIL_LOGO_URL || "").trim();
  if (esReal(override) && /^https?:\/\//.test(override)) return override;

  const supa = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  if (/^https?:\/\//.test(supa)) {
    return `${supa.replace(/\/$/, "")}/storage/v1/object/public/prototipos/branding/fwd-marketplace.png`;
  }
  return "";
}

// Escapa texto del usuario para insertarlo de forma segura en el HTML.
function escaparHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---- Plantilla base de marca (HTML a prueba de balas, basado en tablas) ----
// Usa tablas + estilos inline (lo único que Gmail/Outlook renderizan de forma
// consistente). El logo se carga por URL pública; si no hay URL, cae a un
// wordmark de texto que siempre se ve.
function plantilla(titulo: string, cuerpo: string): string {
  const logo = logoUrl();
  const cabecera = logo
    ? `<img src="${logo}" alt="FWD Marketplace" width="180" style="display:block;width:180px;max-width:80%;height:auto;border:0;outline:none;text-decoration:none;" />`
    : `<span style="font-size:26px;font-weight:bold;letter-spacing:1px;color:#008FD4;">FWD <span style="color:#662D91;">Marketplace</span></span>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f7;">
    <tr>
      <td align="center" style="padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <!-- Barra de acento -->
          <tr><td style="height:6px;line-height:6px;font-size:0;background-color:#662D91;">&nbsp;</td></tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:28px 32px 8px 32px;">
              ${cabecera}
            </td>
          </tr>
          <!-- Titulo -->
          <tr>
            <td align="center" style="padding:8px 32px 0 32px;">
              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">${titulo}</h1>
            </td>
          </tr>
          <!-- Cuerpo -->
          <tr>
            <td style="padding:16px 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
              ${cuerpo}
            </td>
          </tr>
          <!-- Pie -->
          <tr>
            <td align="center" style="padding:16px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#64748b;font-family:Arial,Helvetica,sans-serif;">FWD &middot; Costa Rica &middot; Ecosistema digital</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function enviarCodigoOtp(correo: string, codigo: string): Promise<void> {
  const cuerpo = `
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Hola,</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
      Hemos recibido una solicitud para restablecer tu contraseña.
    </p>
    <p style="margin:0 0 8px;color:#475569;font-size:15px;">Tu código de recuperación es:</p>
    <div style="margin:0 0 16px;text-align:center;">
      <span style="display:inline-block;padding:14px 24px;border-radius:12px;background:#008FD4;color:#fff;font-size:32px;font-weight:bold;letter-spacing:8px;">${codigo}</span>
    </div>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;">Este código expirará en <strong>15 minutos</strong>.</p>
    <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    <p style="margin:0;color:#475569;font-size:14px;">Saludos,<br/>Equipo de Soporte</p>`;
  const text =
    `Recuperación de contraseña — FWD Marketplace\n\n` +
    `Hemos recibido una solicitud para restablecer tu contraseña.\n` +
    `Tu código de recuperación es: ${codigo}\n` +
    `Este código expirará en 15 minutos.\n\n` +
    `Si no solicitaste este cambio, puedes ignorar este mensaje.\n\n` +
    `Equipo de Soporte — FWD Costa Rica`;
  await enviar({
    to: correo,
    subject: "Recuperación de Contraseña",
    html: plantilla("Recuperación de Contraseña", cuerpo),
    text,
  });
}

export async function enviarConfirmacionCambio(correo: string, fechaHora: string): Promise<void> {
  const cuerpo = `
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Hola,</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
      Te confirmamos que tu contraseña ha sido modificada correctamente.
    </p>
    <div style="margin:0 0 16px;padding:14px 16px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;">
      <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6;">
        Si no realizaste este cambio, comunícate inmediatamente con soporte.
      </p>
    </div>
    <p style="margin:0 0 16px;color:#94a3b8;font-size:12px;">Fecha del cambio: ${fechaHora} (hora de Costa Rica).</p>
    <p style="margin:0;color:#475569;font-size:14px;">Saludos,<br/>Equipo de Seguridad</p>`;
  const text =
    `Contraseña actualizada — FWD Marketplace\n\n` +
    `Te confirmamos que tu contraseña ha sido modificada correctamente.\n` +
    `Si no realizaste este cambio, comunicate inmediatamente con soporte.\n\n` +
    `Fecha del cambio: ${fechaHora} (hora de Costa Rica).\n\n` +
    `Equipo de Seguridad — FWD Costa Rica`;
  await enviar({
    to: correo,
    subject: "Contraseña Actualizada",
    html: plantilla("Contraseña Actualizada", cuerpo),
    text,
  });
}

// Envía un mensaje del formulario de contacto ("Hablemos") al buzón de FWD,
// con plantilla de marca y logo. `remitente` es el correo que la persona
// escribió; `mensaje` es el texto del formulario.
export async function enviarMensajeContacto(
  destino: string,
  remitente: string,
  mensaje: string,
): Promise<void> {
  const cuerpo = `
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;text-align:center;">
      Recibiste un nuevo mensaje desde el formulario <strong>Hablemos</strong> de la web.
    </p>
    <div style="margin:0 0 16px;padding:14px 16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Correo del remitente</p>
      <p style="margin:0;color:#0f172a;font-size:15px;font-weight:bold;">${escaparHtml(remitente)}</p>
    </div>
    <div style="margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#ffffff;border:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Mensaje</p>
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escaparHtml(mensaje)}</p>
    </div>
    <div style="margin:0 0 8px;text-align:center;">
      <a href="mailto:${escaparHtml(remitente)}"
         style="display:inline-block;padding:12px 28px;border-radius:12px;background:#008FD4;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">
        Responder
      </a>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;">
      O simplemente respondé este correo: la respuesta llega a ${escaparHtml(remitente)}.
    </p>`;
  const text =
    `Nuevo mensaje de contacto — FWD Marketplace\n\n` +
    `Correo del remitente: ${remitente}\n\n` +
    `Mensaje:\n${mensaje}\n\n` +
    `Respondé este correo para contestarle directamente a ${remitente}.`;
  await enviar({
    to: destino,
    subject: `Nuevo mensaje de contacto de ${remitente}`,
    html: plantilla("Nuevo mensaje de contacto", cuerpo),
    text,
    replyTo: remitente,
  });
}

// Correo de confirmación que recibe LA PERSONA que llenó el formulario
// "Hablemos": agradecimiento de marca con logo y copia de su mensaje.
export async function enviarConfirmacionContacto(
  visitante: string,
  mensaje: string,
): Promise<void> {
  const cuerpo = `
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;text-align:center;">
      ¡Gracias por escribirnos! Recibimos tu mensaje y nuestro equipo te responderá muy pronto.
    </p>
    <div style="margin:0 0 20px;padding:14px 16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Esto fue lo que nos enviaste</p>
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escaparHtml(mensaje)}</p>
    </div>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;line-height:1.6;text-align:center;">
      Mientras tanto, podés seguirnos y conocer más sobre el ecosistema FWD.
    </p>
    <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;">
      Si no enviaste este mensaje, podés ignorar este correo.
    </p>`;
  const text =
    `¡Gracias por escribirnos! — FWD Marketplace\n\n` +
    `Recibimos tu mensaje y nuestro equipo te responderá muy pronto.\n\n` +
    `Esto fue lo que nos enviaste:\n${mensaje}\n\n` +
    `Si no enviaste este mensaje, podés ignorar este correo.\n\n` +
    `Equipo FWD — Costa Rica`;
  await enviar({
    to: visitante,
    subject: "¡Gracias por contactarnos! — FWD Marketplace",
    html: plantilla("¡Gracias por contactarnos!", cuerpo),
    text,
  });
}
