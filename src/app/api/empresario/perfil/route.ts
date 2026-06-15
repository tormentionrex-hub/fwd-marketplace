import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/server/auth/get-user';
import { guardarPerfilEmpresario } from '@/server/services/perfil-empresario.service';

const bodySchema = z.object({
  nombre: z.string().optional(),
  nombreEmpresa: z.string().optional(),
  fotoUrl: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
});

// PUT /api/empresario/perfil — guarda nombre, empresa, foto, descripcion y sector.
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json({ error: 'Solo los empresarios' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 });
  }

  const d = parsed.data;
  const resultado = await guardarPerfilEmpresario(user.id, {
    ...(d.nombre !== undefined && { nombre: d.nombre }),
    ...(d.nombreEmpresa !== undefined && { nombreEmpresa: d.nombreEmpresa }),
    ...(d.fotoUrl !== undefined && { fotoUrl: d.fotoUrl }),
    ...(d.descripcion !== undefined && { descripcion: d.descripcion }),
    ...(d.sector !== undefined && { sector: d.sector }),
  });

  if (resultado === 'datos_invalidos') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 });
  }
  if (resultado === 'no_existe') {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
