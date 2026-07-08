import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  obtenerMiCv,
  subirMiCv,
  eliminarMiCv,
} from '@/server/services/curriculum.service';

// GET /api/estudiante/cv — metadatos + URL firmada del CV del estudiante.
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }
  const cv = await obtenerMiCv(user.id);
  return NextResponse.json({ cv });
}

// POST /api/estudiante/cv — sube o reemplaza el CV (multipart, campo "archivo").
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 });
  }

  const archivo = formData.get('archivo') as File | null;
  if (!archivo) {
    return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const resultado = await subirMiCv(user.id, {
    nombre: archivo.name,
    tipo: archivo.type,
    size: archivo.size,
    buffer,
  });

  if (resultado === 'vacio') {
    return NextResponse.json({ error: 'El archivo está vacío' }, { status: 400 });
  }
  if (resultado === 'tipo_invalido') {
    return NextResponse.json({ error: 'Formato no permitido. Solo PDF, DOC o DOCX.' }, { status: 422 });
  }
  if (resultado === 'muy_grande') {
    return NextResponse.json({ error: 'El archivo supera el máximo de 10 MB.' }, { status: 422 });
  }
  if (resultado === 'error_storage') {
    return NextResponse.json({ error: 'No se pudo guardar el archivo. Intentá de nuevo.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cv: resultado.cv }, { status: 201 });
}

// DELETE /api/estudiante/cv — elimina el CV del estudiante.
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }
  const ok = await eliminarMiCv(user.id);
  if (!ok) return NextResponse.json({ error: 'No tenés un CV cargado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
