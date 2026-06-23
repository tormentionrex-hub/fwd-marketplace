import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';
import {
  listarTecnologias,
  crearTecnologia,
  actualizarTecnologia,
  listarHabilidades,
  crearHabilidad,
  actualizarHabilidad,
  listarCategoriasNegocio,
  crearCategoriaNegocio,
  actualizarCategoriaNegocio,
} from '@/server/repositories/catalog.repository';
import { registrarAuditoria } from '@/server/repositories/audit-log.repository';

// GET /api/admin/catalogos
// Devuelve las tecnologías, habilidades y categorías de negocio. Solo staff.
export async function GET(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    return error('No autorizado', 401);
  }

  try {
    const [tecnologiasRaw, habilidadesRaw, categoriasRaw] = await Promise.all([
      listarTecnologias(),
      listarHabilidades(),
      listarCategoriasNegocio(),
    ]);

    // Convert BigInt IDs to numbers for JSON serialization
    const tecnologias = tecnologiasRaw.map(t => ({ ...t, id: Number(t.id) }));
    const habilidades = habilidadesRaw.map(h => ({ ...h, id: Number(h.id) }));
    const categorias_negocio = categoriasRaw.map(c => ({ ...c, id: Number(c.id) }));

    return NextResponse.json({ tecnologias, habilidades, categorias_negocio });
  } catch (e) {
    return errorInterno('admin/catalogos/GET', e);
  }
}

// POST /api/admin/catalogos
// Crea un elemento en tecnologías, habilidades o categorías. Solo staff.
// Body: { tipo: 'tecnologia' | 'habilidad' | 'categoria_negocio', nombre: string, categoria?: string }
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    return error('No autorizado', 401);
  }

  // Moderadores no pueden alterar los catálogos del sistema
  if (user.staffSubRole === 'moderador') {
    return error('Sin permiso para modificar catálogos', 403);
  }

  let body: { tipo?: 'tecnologia' | 'habilidad' | 'categoria_negocio'; nombre?: string; categoria?: string };
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const { tipo, nombre, categoria } = body;
  if (!tipo || !nombre || nombre.trim().length === 0) {
    return error('Datos incompletos', 400);
  }

  try {
    let result: { id: bigint | number };
    if (tipo === 'tecnologia') {
      result = await crearTecnologia(nombre.trim());
    } else if (tipo === 'habilidad') {
      result = await crearHabilidad(nombre.trim(), categoria?.trim() || null);
    } else if (tipo === 'categoria_negocio') {
      result = await crearCategoriaNegocio(nombre.trim());
    } else {
      return error('Tipo de catálogo inválido', 400);
    }

    // Convert BigInt ID for JSON response
    const createdId = Number(result.id);

    // Registrar auditoría
    await registrarAuditoria(
      user.id,
      user.nombre,
      'crear_catalogo',
      `Se agrego el elemento "${nombre.trim()}" al catalogo "${tipo}"`,
      { tipo, nombre: nombre.trim(), createdId }
    );

    return NextResponse.json({ ok: true, id: createdId });
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2002') {
      return error('Ya existe un elemento registrado con ese nombre.', 409);
    }
    return errorInterno('admin/catalogos/POST', e);
  }
}

// PATCH /api/admin/catalogos
// Actualiza o activa/desactiva un elemento del catálogo. Solo staff.
// Body: { tipo: 'tecnologia' | 'habilidad' | 'categoria_negocio', id: number, nombre: string, activa: boolean, categoria?: string }
export async function PATCH(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    return error('No autorizado', 401);
  }

  // Moderadores no pueden alterar los catálogos del sistema
  if (user.staffSubRole === 'moderador') {
    return error('Sin permiso para modificar catálogos', 403);
  }

  let body: {
    tipo?: 'tecnologia' | 'habilidad' | 'categoria_negocio';
    id?: number;
    nombre?: string;
    activa?: boolean;
    categoria?: string;
  };
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const { tipo, id, nombre, activa, categoria } = body;
  if (!tipo || id === undefined || !nombre || nombre.trim().length === 0 || activa === undefined) {
    return error('Datos incompletos', 400);
  }

  try {
    if (tipo === 'tecnologia') {
      await actualizarTecnologia(id, nombre.trim(), activa);
    } else if (tipo === 'habilidad') {
      await actualizarHabilidad(id, nombre.trim(), categoria?.trim() || null, activa);
    } else if (tipo === 'categoria_negocio') {
      await actualizarCategoriaNegocio(id, nombre.trim(), activa);
    } else {
      return error('Tipo de catálogo inválido', 400);
    }

    // Registrar auditoría
    await registrarAuditoria(
      user.id,
      user.nombre,
      'actualizar_catalogo',
      `Se modifico el elemento ID ${id} en el catalogo "${tipo}" (Activa: ${activa})`,
      { tipo, id, nombre: nombre.trim(), activa }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'P2002') {
      return error('Ya existe un elemento registrado con ese nombre.', 409);
    }
    return errorInterno('admin/catalogos/PATCH', e);
  }
}
