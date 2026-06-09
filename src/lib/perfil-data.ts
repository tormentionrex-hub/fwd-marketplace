import type { PerfilPublico } from "@/types/perfil";

// Genera un perfil de ejemplo. Más adelante vendrá de Supabase por username.
export function getPerfilPublico(username: string): PerfilPublico {
  const nombre = username
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

  return {
    username,
    nombre: nombre || "Yarled Vargas",
    rol: "Desarrollador Full-Stack",
    ubicacion: "San José, Costa Rica",
    fotoUrl: "",
    verificadoFwd: true,
    reputacion: 4.8,
    evaluaciones: 23,
    satisfaccion: 96,
    proyectosCompletados: 18,
    resumen:
      "Desarrollador full-stack egresado de FWD Costa Rica. Diseño y construyo productos digitales accesibles y escalables con React, Next.js y Node.js. Me apasiona transformar ideas en experiencias reales que impulsan negocios.",
    especialidades: ["Aplicaciones web", "APIs escalables", "Experiencia de usuario", "Cloud"],
    objetivos:
      "Liderar proyectos de producto end-to-end y aportar al ecosistema tecnológico costarricense.",
    intereses: ["Inteligencia Artificial", "Open Source", "Diseño de producto", "DevOps"],
    mostrarContacto: true,
    contacto: {
      email: "yarled.vargas@ejemplo.com",
      linkedin: "https://www.linkedin.com/in/ejemplo",
      github: "https://github.com/ejemplo",
      portafolio: "https://yarledvargas.dev",
    },
    skills: [
      {
        categoria: "Frontend",
        skills: [
          { nombre: "React.js", nivel: 92 },
          { nombre: "Next.js", nivel: 88 },
          { nombre: "TypeScript", nivel: 84 },
          { nombre: "Tailwind CSS", nivel: 90 },
        ],
      },
      {
        categoria: "Backend",
        skills: [
          { nombre: "Node.js", nivel: 82 },
          { nombre: "Express", nivel: 78 },
          { nombre: "GraphQL", nivel: 70 },
        ],
      },
      {
        categoria: "Bases de Datos",
        skills: [
          { nombre: "PostgreSQL", nivel: 80 },
          { nombre: "MySQL", nivel: 75 },
          { nombre: "Supabase", nivel: 85 },
        ],
      },
      {
        categoria: "Cloud",
        skills: [
          { nombre: "AWS", nivel: 68 },
          { nombre: "Vercel", nivel: 90 },
          { nombre: "Docker", nivel: 72 },
        ],
      },
    ],
    proyectos: [
      {
        id: "p1",
        titulo: "Tienda en línea para artesanos",
        descripcion:
          "E-commerce headless con pasarela de pagos, panel de administración y métricas en tiempo real.",
        tecnologias: ["Next.js", "Supabase", "Stripe", "Tailwind"],
        fecha: "Mar 2026",
        estado: "Completado",
        calificacion: 5,
        evaluaciones: 12,
        comentario: "Excelente trabajo, entregó antes del plazo y con calidad impecable.",
        repoUrl: "https://github.com/ejemplo/tienda-artesanos",
        demoUrl: "https://tienda-artesanos.vercel.app",
        color: "#008fd4",
      },
      {
        id: "p2",
        titulo: "Dashboard de métricas internas",
        descripcion:
          "Panel analítico con visualizaciones interactivas y reportes exportables para un equipo de ventas.",
        tecnologias: ["React", "Node.js", "PostgreSQL"],
        fecha: "Ene 2026",
        estado: "Completado",
        calificacion: 4.5,
        evaluaciones: 8,
        comentario: "Muy profesional y proactivo durante todo el proyecto.",
        repoUrl: "https://github.com/ejemplo/dashboard-metricas",
        color: "#662d91",
      },
      {
        id: "p3",
        titulo: "App de reservas para clínica",
        descripcion:
          "Aplicación de agendamiento con notificaciones, calendario y gestión de pacientes.",
        tecnologias: ["Next.js", "Prisma", "Docker"],
        fecha: "Nov 2025",
        estado: "Completado",
        calificacion: 4.8,
        evaluaciones: 5,
        demoUrl: "https://clinica-reservas.vercel.app",
        color: "#20bec6",
      },
    ],
    estadisticas: {
      tecnologiasDominadas: 14,
      empresasAtendidas: 9,
      participaciones: 27,
    },
    timeline: [
      { fecha: "Mar 2026", titulo: "Tienda para artesanos", descripcion: "Proyecto completado con calificación 5★.", tipo: "proyecto" },
      { fecha: "Feb 2026", titulo: "AWS Cloud Practitioner", descripcion: "Certificación obtenida.", tipo: "certificacion" },
      { fecha: "Ene 2026", titulo: "Top Freelancer del mes", descripcion: "Reconocimiento de la comunidad FWD.", tipo: "logro" },
      { fecha: "Oct 2025", titulo: "Verificado por FWD", descripcion: "Cuenta verificada como egresado.", tipo: "verificacion" },
    ],
    certificaciones: [
      { nombre: "AWS Cloud Practitioner", institucion: "Amazon Web Services", fecha: "2026", color: "#f7901e" },
      { nombre: "Full-Stack Web Development", institucion: "FWD Costa Rica", fecha: "2025", color: "#008fd4" },
      { nombre: "Scrum Fundamentals", institucion: "Scrum.org", fecha: "2025", color: "#662d91" },
    ],
    logros: [
      { titulo: "Top Freelancer", emoji: "🏆", color: "#ffcb05" },
      { titulo: "5 Proyectos Excelentes", emoji: "⭐", color: "#20bec6" },
      { titulo: "Innovador", emoji: "🚀", color: "#ec008c" },
      { titulo: "Mentor", emoji: "💡", color: "#662d91" },
    ],
  };
}
