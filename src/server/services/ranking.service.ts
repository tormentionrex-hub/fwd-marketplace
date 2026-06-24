import { db } from "@/lib/db";

export interface EstudianteRanking {
  id: string;
  nombre: string;
  imagen: string | null;
  edad: number | null;
  especialidad: string | null;
  lenguajePrincipal: string | null;
  puntuacion: number;
  totalCalificaciones: number;
}

export async function listarRankingEstudiantes(limite?: number): Promise<EstudianteRanking[]> {
  const filas = await db.perfiles_estudiante.findMany({
    where: { evaluaciones: { some: {} } },
    orderBy: { reputacion: "desc" },
    ...(limite != null ? { take: limite } : {}),
    select: {
      id_usuario: true,
      total_calificaciones: true,
      titulo_profesional: true,
      usuarios: {
        select: { nombre: true, image_url: true, edad: true },
      },
      estudiantes_habilidades: {
        take: 1,
        select: {
          habilidades: { select: { nombre: true } },
        },
      },
      evaluaciones: {
        select: { puntuacion: true },
      },
    },
  });

  return filas.map((e) => {
    const evs = e.evaluaciones;
    const avg = evs.length > 0
      ? evs.reduce((s, ev) => s + ev.puntuacion, 0) / evs.length
      : 0;
    const puntuacion = Math.round((avg / 5) * 100 * 10) / 10;

    return {
      id: e.id_usuario,
      nombre: e.usuarios.nombre,
      imagen: e.usuarios.image_url ?? null,
      edad: e.usuarios.edad ?? null,
      especialidad: e.titulo_profesional ?? null,
      lenguajePrincipal: e.estudiantes_habilidades[0]?.habilidades.nombre ?? null,
      puntuacion,
      totalCalificaciones: e.total_calificaciones,
    };
  });
}
