import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  enviarSolicitud,
  listarTodasLasSolicitudes,
} from '@/server/services/solicitud-mensaje.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/solicitudes — envía una solicitud de contacto (puede ser de estudiante -> empresario o viceversa).
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: {
    idDestino?: string;
    idEstudiante?: string;
    idEmpresario?: string;
    asunto?: string;
    mensaje?: string;
    idProyecto?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const idDestino = (body.idDestino ?? body.idEstudiante ?? body.idEmpresario ?? '').trim();
  const asunto = (body.asunto ?? '').trim();
  const mensaje = (body.mensaje ?? '').trim();
  const idProyecto = body.idProyecto?.trim() ? body.idProyecto.trim() : null;

  if (!UUID_RE.test(idDestino)) {
    return NextResponse.json({ error: 'Destinatario inválido' }, { status: 400 });
  }
  if (!asunto || asunto.length > 200) {
    return NextResponse.json({ error: 'El asunto es obligatorio (máx. 200 caracteres)' }, { status: 400 });
  }
  if (!mensaje) {
    return NextResponse.json({ error: 'El mensaje es obligatorio' }, { status: 400 });
  }
  if (idProyecto && !UUID_RE.test(idProyecto)) {
    return NextResponse.json({ error: 'Proyecto inválido' }, { status: 400 });
  }

  let idEstudiante: string;
  let idEmpresario: string;
  let iniciador: string;

  if (user.roles.nombre === 'empresario') {
    idEstudiante = idDestino;
    idEmpresario = user.id;
    iniciador = 'empresario';
  } else if (user.roles.nombre === 'estudiante') {
    idEstudiante = user.id;
    idEmpresario = idDestino;
    iniciador = 'estudiante';
  } else {
    return NextResponse.json({ error: 'Rol no permitido para enviar solicitudes' }, { status: 403 });
  }

  const resultado = await enviarSolicitud({
    idEmpresario,
    idEstudiante,
    idProyecto,
    asunto: asunto.slice(0, 200),
    mensaje,
    iniciador,
  });

  if (resultado === 'duplicada') {
    return NextResponse.json(
      { error: 'Ya tenés una solicitud pendiente con este usuario.' },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, id: resultado.id }, { status: 201 });
}

// GET /api/solicitudes — lista las solicitudes recibidas por el usuario.
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { recibidas, enviadas } = await listarTodasLasSolicitudes(user.id);
  return NextResponse.json({ solicitudes: recibidas, recibidas, enviadas });
}
