import { NextResponse } from "next/server";
import { error, errorInterno, parsearBody } from "@/server/http/responder";
import { verificarInvitacionSchema } from "@/server/validation/auth.schema";
import { buscarUsuarioPorCorreo } from "@/server/repositories/usuario.repository";
import {
  buscarInvitacionPendientePorEmail,
  crearSolicitud,
} from "@/server/repositories/pending-verification.repository";
import { enviarEmailSolicitudEspera } from "@/lib/email";

// POST /api/solicitar-acceso
// Recibe un correo, valida si ya existe y guarda la solicitud de invitación en pending_verifications.
// Envía un correo de confirmación informando de la lista de espera (máx. 24h).
export async function POST(request: Request) {
  const parseo = await parsearBody(request, verificarInvitacionSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { email } = parseo.data;

  try {
    // 1. Verificar si ya existe un usuario registrado con este correo
    const usuarioExistente = await buscarUsuarioPorCorreo(email);
    if (usuarioExistente) {
      return error("Este correo ya está registrado en la plataforma.", 400);
    }

    // 2. Verificar si ya existe una invitación o solicitud para este correo
    const existente = await buscarInvitacionPendientePorEmail(email);
    if (existente) {
      if (existente.pending) {
        return NextResponse.json({
          ok: true,
          yaPendiente: true,
          mensaje: "Tu solicitud ya está en lista de espera.",
        });
      } else if (existente.id_usuario) {
        return error("Este correo ya está registrado.", 400);
      } else {
        return error(
          "Tu invitación ya fue aprobada. Por favor, revisa tu correo para completar el registro.",
          400
        );
      }
    }

    // 3. Crear la solicitud en pending_verifications con tipo 'solicitud'
    await crearSolicitud(email);

    // 4. Enviar correo de confirmación de espera
    await enviarEmailSolicitudEspera(email);

    return NextResponse.json({
      ok: true,
      yaPendiente: false,
      mensaje: "Solicitud registrada con éxito.",
    });
  } catch (e) {
    return errorInterno("solicitar-acceso/POST", e);
  }
}
