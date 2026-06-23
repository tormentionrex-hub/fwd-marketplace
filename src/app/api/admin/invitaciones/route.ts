import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { registrarAuditoria } from '@/server/repositories/audit-log.repository';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

const APP_URL = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

// Helper to send email (dynamic import or mock if not configured)
async function enviarEmailInvitacionStaff(email: string, tipoStaff: string) {
  const registroUrl = `${APP_URL}/es/register-staff?email=${encodeURIComponent(email)}`;

  
  // We can write a custom mailer block or reuse the transporter
  const subject = 'FWD Marketplace - Invitacion de Staff';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #008fd4; margin-bottom: 16px;">¡Fuiste invitado al Staff de FWD Marketplace!</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hola,</p>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        El equipo de FWD Costa Rica te ha invitado a formar parte del staff como <strong>${tipoStaff === 'admin_general' ? 'Super Admin (General)' : 'Moderador'}</strong>.
      </p>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Haz clic en el enlace de abajo para completar tu registro e iniciar operaciones en la plataforma.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${registroUrl}" style="display: inline-block; background-color: #ec008c; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Completar Registro de Staff
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">FWD Costa Rica - Ecosistema Digital. Si no esperabas este correo, puedes ignorarlo.</p>
    </div>
  `;

  // Dynamic import of the transporter or send mail directly
  try {
    const port = Number(process.env.EMAIL_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"FWD Marketplace" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@fwd.cr'}>`,
      to: email,
      subject,
      html,
    });
  } catch (err) {
    console.error('[email-staff] Error sending staff invitation email:', err);
  }
}

// GET /api/admin/invitaciones
// Devuelve la lista de staff y de invitaciones pendientes. Solo staff (no moderadores).
export async function GET(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    return error('No autorizado', 401);
  }

  if (user.tipo_staff === 'moderador') {
    return error('No autorizado', 403);
  }

  try {
    const staffMembers = await db.usuarios.findMany({
      where: {
        roles: {
          nombre: 'staff'
        }
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        tipo_staff: true,
        creado: true,
        estado: true,
      },
      orderBy: { creado: 'desc' },
    });

    const pendingInvitations = await db.invitaciones_staff.findMany({
      where: { pending: true },
      orderBy: { solicitado: 'desc' },
    });

    return NextResponse.json({ staffMembers, pendingInvitations });
  } catch (e) {
    return errorInterno('admin/invitaciones/GET', e);
  }
}

// POST /api/admin/invitaciones
// Envía una invitación de staff. Solo staff (no moderadores).
// Body: { email: string, tipo_staff: 'admin_general' | 'moderador' }
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    return error('No autorizado', 401);
  }

  if (user.tipo_staff === 'moderador') {
    return error('No autorizado', 403);
  }

  let body: { email?: string; tipo_staff?: 'admin_general' | 'moderador' };
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const { email, tipo_staff } = body;
  if (!email || !tipo_staff) {
    return error('Datos incompletos', 400);
  }

  const emailNorm = email.trim().toLowerCase();
  if (tipo_staff !== 'admin_general' && tipo_staff !== 'moderador') {
    return error('Tipo de staff inválido', 400);
  }

  try {
    // 1. Verificar si ya existe usuario registrado con ese email
    const usuarioExistente = await db.usuarios.findUnique({
      where: { correo: emailNorm }
    });
    if (usuarioExistente) {
      return error('Este correo ya está registrado en la plataforma.', 409);
    }

    // 2. Verificar si hay invitación pendiente
    const invExistente = await db.invitaciones_staff.findUnique({
      where: { email: emailNorm }
    });
    if (invExistente && invExistente.pending) {
      return error('Ya existe una invitación pendiente para este correo.', 409);
    }

    // 3. Crear o actualizar la invitación
    await db.invitaciones_staff.upsert({
      where: { email: emailNorm },
      update: {
        tipo_staff,
        pending: true,
        solicitado: new Date(),
        resuelto: null,
        id_usuario: null,
      },
      create: {
        email: emailNorm,
        tipo_staff,
        pending: true,
      },
    });

    // 4. Registrar auditoría
    await registrarAuditoria(
      user.id,
      user.nombre,
      'invitar_staff',
      `Se envio invitacion de staff a ${emailNorm} como ${tipo_staff}`,
      { email: emailNorm, tipo_staff }
    );

    // 5. Enviar correo de invitación
    await enviarEmailInvitacionStaff(emailNorm, tipo_staff);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('admin/invitaciones/POST', e);
  }
}
