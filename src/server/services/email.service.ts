import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// Servicio de correo (SMTP vía nodemailer). Usa EMAIL_USER / EMAIL_PASS /
// EMAIL_FROM del .env. Host/puerto opcionales (por defecto Gmail SMTP).
// Si faltan credenciales, NO envía y solo registra en consola — el flujo de
// recuperación nunca se rompe por un fallo de correo.

const FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@fwd.cr";

// ¿El valor es real (no vacío ni placeholder tipo "XXXX")?
function esReal(v: string | undefined): boolean {
  const t = (v || "").trim();
  return t.length > 0 && !/^x+$/i.test(t);
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

async function enviar(to: string, subject: string, html: string) {
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
        body: JSON.stringify({ from: fromResend(), to, subject, html }),
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
    await t.sendMail({ from: FROM, to, subject, html });
    console.info("[email] enviado vía SMTP");
  } catch (err) {
    console.error("[email] Error SMTP:", err);
  }
}

// ---- Plantilla base de marca ----
function plantilla(titulo: string, cuerpo: string): string {
  return `
  <div style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="height:6px;background:linear-gradient(100deg,#008FD4,#662D91,#EC008C);"></div>
      <div style="padding:32px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:bold;letter-spacing:2px;color:#008FD4;text-transform:uppercase;">FWD Marketplace</p>
        <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a;">${titulo}</h1>
        ${cuerpo}
      </div>
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;color:#64748b;">FWD · Costa Rica · Ecosistema digital</p>
      </div>
    </div>
  </div>`;
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
  await enviar(correo, "Recuperación de Contraseña", plantilla("Recuperación de Contraseña", cuerpo));
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
  await enviar(correo, "Contraseña Actualizada", plantilla("Contraseña Actualizada", cuerpo));
}
