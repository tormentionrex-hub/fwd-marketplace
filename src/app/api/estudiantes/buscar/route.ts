import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/server/auth/get-user';
import { parsearPreferencias } from '@/server/services/preferencias-estudiante.service';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (q.length < 2) {
    return NextResponse.json({ estudiantes: [] });
  }

  // Buscar perfiles_estudiante por nombre de usuario. Traemos algunos de más
  // porque luego filtramos por privacidad (perfilVisible).
  const estudiantes = await db.perfiles_estudiante.findMany({
    where: {
      id_usuario: { not: user.id }, // No buscarse a sí mismo
      usuarios: {
        nombre: {
          contains: q,
          mode: 'insensitive',
        },
      },
    },
    take: 30,
    select: {
      id_usuario: true,
      preferencias: true,
      usuarios: {
        select: {
          nombre: true,
          image_url: true,
        },
      },
    },
  });

  // Respeta la privacidad del estudiante: oculta a quienes desactivaron
  // "Perfil visible para empresas". Por defecto (perfilVisible true) sí aparecen.
  const resultados = estudiantes
    .filter((e) => parsearPreferencias(e.preferencias).priv.perfilVisible !== false)
    .slice(0, 10)
    .map((e) => ({
      id: e.id_usuario,
      nombre: e.usuarios?.nombre ?? 'Estudiante',
      fotoUrl: e.usuarios?.image_url ?? null,
    }));

  return NextResponse.json({ estudiantes: resultados });
}
