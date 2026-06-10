import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { generarAvatar } from "@/lib/avatar";
import type {
  PerfilPublico,
  ProyectoPublico,
  SkillCategoria,
  SkillGrupo,
  SkillItem,
} from "@/types/perfil";

const COLORES = ["#008fd4", "#662d91", "#20bec6", "#f7901e", "#ec008c"];
const BLOQUEANTES = new Set(["pendiente", "rechazado", "en_revision", "en revisión"]);

function slugify(nombre: string): string {
  return nombre.trim().toLowerCase().replace(/\s+/g, "-");
}

// Mapea las categorías del catálogo (habilidades.categoria) a las del perfil.
function mapCategoria(cat: string | null): SkillCategoria {
  switch ((cat ?? "").toLowerCase()) {
    case "frontend":
      return "Frontend";
    case "backend":
      return "Backend";
    case "bases de datos":
      return "Bases de Datos";
    case "devops":
    case "cloud":
      return "Cloud";
    case "ia":
      return "IA";
    default:
      return "Herramientas";
  }
}

function nivelANumero(nivel: string | null): number {
  switch ((nivel ?? "").toLowerCase()) {
    case "avanzado":
      return 93;
    case "intermedio":
      return 72;
    default:
      return 45;
  }
}

/**
 * Perfil público del estudiante. Busca un estudiante real cuyo slug de nombre
 * coincida con `username` y construye el perfil con sus datos reales (los campos
 * que el editor de perfil modifica). Si no hay match, cae al perfil de ejemplo.
 */
export const getPerfilPublico = cache(async (username: string): Promise<PerfilPublico> => {
  // 1) Match liviano por slug del nombre (solo id + nombre).
  const estudiantes = await db.usuarios.findMany({
    where: { roles: { nombre: "estudiante" } },
    select: { id: true, nombre: true },
  });
  const match = estudiantes.find((u) => slugify(u.nombre) === username);
  if (!match) return perfilDemo(username);

  // 2) Datos completos SOLO del estudiante encontrado.
  const real = await db.usuarios.findUnique({
    where: { id: match.id },
    select: {
      id: true,
      nombre: true,
      correo: true,
      image_url: true,
      perfiles_estudiante: {
        select: {
          descripcion: true,
          titulo_profesional: true,
          estado_verificacion: true,
          reputacion: true,
          estudiantes_habilidades: {
            select: { nivel: true, habilidades: { select: { nombre: true, categoria: true } } },
          },
          portafolio_proyectos: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              tecnologias: true,
              fecha: true,
              repo_url: true,
              demo_url: true,
            },
          },
          evaluaciones: {
            select: {
              puntuacion: true,
              comentario: true,
              creado: true,
              proyectos: { select: { id: true, titulo: true } },
            },
          },
          ofertas: { select: { id: true } },
        },
      },
    },
  });
  if (!real || !real.perfiles_estudiante) return perfilDemo(username);

  const pe = real.perfiles_estudiante;

  // Habilidades agrupadas por categoría.
  const porCategoria = new Map<SkillCategoria, SkillItem[]>();
  for (const eh of pe.estudiantes_habilidades) {
    const cat = mapCategoria(eh.habilidades.categoria);
    const lista = porCategoria.get(cat) ?? [];
    lista.push({ nombre: eh.habilidades.nombre, nivel: nivelANumero(eh.nivel) });
    porCategoria.set(cat, lista);
  }
  const skills: SkillGrupo[] = [...porCategoria.entries()].map(([categoria, items]) => ({
    categoria,
    skills: items,
  }));

  // Proyectos: completados (evaluados) + portafolio manual.
  const completados: ProyectoPublico[] = pe.evaluaciones.map((e, i) => ({
    id: e.proyectos.id,
    titulo: e.proyectos.titulo,
    descripcion: e.comentario ?? "Proyecto completado dentro del ecosistema FWD.",
    tecnologias: [] as string[],
    fecha: e.creado.toISOString().slice(0, 10),
    estado: "Completado",
    calificacion: e.puntuacion,
    evaluaciones: 1,
    ...(e.comentario ? { comentario: e.comentario } : {}),
    color: COLORES[i % COLORES.length]!,
  }));

  const manuales: ProyectoPublico[] = pe.portafolio_proyectos.map((p, i) => ({
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion ?? "",
    tecnologias: (p.tecnologias ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    fecha: p.fecha ? p.fecha.toISOString().slice(0, 10) : "",
    estado: "Publicado",
    calificacion: 0,
    ...(p.repo_url ? { repoUrl: p.repo_url } : {}),
    ...(p.demo_url ? { demoUrl: p.demo_url } : {}),
    color: COLORES[(i + completados.length) % COLORES.length]!,
  }));

  const proyectos = [...completados, ...manuales];

  // Reputación: promedio real de evaluaciones, o el valor guardado.
  const totalEval = pe.evaluaciones.length;
  const sumaEval = pe.evaluaciones.reduce((s, e) => s + e.puntuacion, 0);
  const reputacion = totalEval > 0 ? Number((sumaEval / totalEval).toFixed(1)) : pe.reputacion ?? 0;

  const verificado = !BLOQUEANTES.has((pe.estado_verificacion ?? "").toLowerCase().trim());

  return {
    username,
    nombre: real.nombre,
    rol: pe.titulo_profesional ?? "Estudiante FWD",
    ubicacion: "Costa Rica",
    fotoUrl: real.image_url || generarAvatar(real.nombre),
    verificadoFwd: verificado,
    reputacion,
    evaluaciones: totalEval,
    satisfaccion: totalEval > 0 ? Math.round((reputacion / 5) * 100) : 0,
    proyectosCompletados: completados.length,
    resumen: pe.descripcion ?? "",
    especialidades: skills.flatMap((g) => g.skills.map((s) => s.nombre)).slice(0, 4),
    objetivos: "",
    intereses: [],
    mostrarContacto: Boolean(real.correo),
    contacto: { email: real.correo },
    skills,
    proyectos,
    estadisticas: {
      tecnologiasDominadas: pe.estudiantes_habilidades.length,
      empresasAtendidas: completados.length,
      participaciones: pe.ofertas.length,
    },
    timeline: [],
    certificaciones: [],
    logros: [],
  };
});

// ── Perfil de ejemplo (fallback cuando el username no corresponde a un
// estudiante real). Mantiene la demo con datos ilustrativos. ────────────────
function perfilDemo(username: string): PerfilPublico {
  const nombre =
    username
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ") || "Estudiante FWD";

  return {
    username,
    nombre,
    rol: "Desarrollador Full-Stack",
    ubicacion: "San José, Costa Rica",
    fotoUrl: generarAvatar(nombre),
    verificadoFwd: true,
    reputacion: 4.8,
    evaluaciones: 23,
    satisfaccion: 96,
    proyectosCompletados: 18,
    resumen:
      "Desarrollador full-stack egresado de FWD Costa Rica. Diseño y construyo productos digitales accesibles y escalables con React, Next.js y Node.js.",
    especialidades: ["Aplicaciones web", "APIs escalables", "Experiencia de usuario", "Cloud"],
    objetivos:
      "Liderar proyectos de producto end-to-end y aportar al ecosistema tecnológico costarricense.",
    intereses: ["Inteligencia Artificial", "Open Source", "Diseño de producto", "DevOps"],
    mostrarContacto: true,
    contacto: {
      email: "ejemplo@fwd.cr",
      linkedin: "https://www.linkedin.com/in/ejemplo",
      github: "https://github.com/ejemplo",
    },
    skills: [
      {
        categoria: "Frontend",
        skills: [
          { nombre: "React.js", nivel: 92 },
          { nombre: "Next.js", nivel: 88 },
          { nombre: "TypeScript", nivel: 84 },
        ],
      },
      {
        categoria: "Backend",
        skills: [
          { nombre: "Node.js", nivel: 82 },
          { nombre: "Express", nivel: 78 },
        ],
      },
    ],
    proyectos: [
      {
        id: "p1",
        titulo: "Tienda en línea para artesanos",
        descripcion: "E-commerce headless con pasarela de pagos y panel de administración.",
        tecnologias: ["Next.js", "Supabase", "Stripe"],
        fecha: "2026-03-01",
        estado: "Completado",
        calificacion: 5,
        evaluaciones: 12,
        color: "#008fd4",
      },
    ],
    estadisticas: {
      tecnologiasDominadas: 14,
      empresasAtendidas: 9,
      participaciones: 27,
    },
    timeline: [],
    certificaciones: [],
    logros: [],
  };
}
