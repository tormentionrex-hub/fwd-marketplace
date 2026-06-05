// Perfil público de un estudiante (Sefora · Página 04).
// URL: /es/perfil/jdoe  ->  params.username === "jdoe"
//
// Visible para cualquier persona SIN login. Los empresarios la consultan
// al revisar las ofertas recibidas en sus proyectos.

// Niveles posibles de una habilidad técnica.
type Nivel = "básico" | "intermedio" | "avanzado";

// Pinta la reputación promedio como 5 estrellas (rellenas / vacías).
function Estrellas({ valor }: { valor: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`Reputación ${valor} de 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < Math.round(valor) ? "text-fwd-amarillo" : "text-zinc-300"
          }
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm text-zinc-500">{valor.toFixed(1)}</span>
    </span>
  );
}

export default async function PerfilPublicoPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { username } = await params;

  // --- Datos de ejemplo. Aquí más adelante consultarás Supabase. ---
  const estudiante = {
    username,
    nombre: "Juan Pérez",
    correo: "juan.perez@ejemplo.com",
    mostrarCorreo: true, // El usuario decide si su correo es público
    fotoUrl: "", // Más adelante: imagen servida desde Cloudinary
    resumen:
      "Desarrollador web full-stack egresado de FWD Costa Rica. Me apasiona " +
      "construir productos accesibles con React y Next.js.",
    reputacion: 4.6,
    verificadoFwd: true,
    habilidades: [
      { nombre: "React", nivel: "avanzado" as Nivel },
      { nombre: "TypeScript", nivel: "intermedio" as Nivel },
      { nombre: "Node.js", nivel: "intermedio" as Nivel },
      { nombre: "SQL", nivel: "básico" as Nivel },
    ],
    proyectos: [
      {
        id: "p1",
        titulo: "Tienda en línea para artesanos",
        tecnologias: ["Next.js", "Supabase", "Stripe"],
        calificacion: 5,
        repoUrl: "https://github.com/ejemplo/tienda-artesanos",
        demoUrl: "https://tienda-artesanos.vercel.app",
      },
      {
        id: "p2",
        titulo: "Dashboard de métricas internas",
        tecnologias: ["React", "Tailwind CSS"],
        calificacion: 4,
        repoUrl: "https://github.com/ejemplo/dashboard-metricas",
        demoUrl: "",
      },
    ],
  };

  // Color del chip según el nivel de la habilidad.
  const colorNivel: Record<Nivel, string> = {
    básico: "border-fwd-turquesa/40 bg-fwd-turquesa/10 text-fwd-turquesa",
    intermedio: "border-fwd-azul/40 bg-fwd-azul/10 text-fwd-azul",
    avanzado: "border-fwd-morado/40 bg-fwd-morado/10 text-fwd-morado",
  };

  return (
    <section className="flex flex-col gap-10">
      {/* ---------- DATOS PERSONALES ---------- */}
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {/* Foto de perfil (placeholder con iniciales si no hay imagen) */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fwd-azul/10 text-2xl font-semibold text-fwd-azul">
          {estudiante.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={estudiante.fotoUrl}
              alt={`Foto de ${estudiante.nombre}`}
              className="h-full w-full object-cover"
            />
          ) : (
            estudiante.nombre
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {estudiante.nombre}
            </h1>
            {/* Indicador de verificación FWD Costa Rica */}
            {estudiante.verificadoFwd && (
              <span className="inline-flex items-center gap-1 rounded-full bg-fwd-magenta/10 px-3 py-1 text-xs font-semibold text-fwd-magenta">
                ✓ Verificado FWD Costa Rica
              </span>
            )}
          </div>

          {/* Correo solo si el usuario lo habilitó */}
          {estudiante.mostrarCorreo && (
            <p className="text-sm text-zinc-500">{estudiante.correo}</p>
          )}

          {/* Reputación promedio en estrellas */}
          <Estrellas valor={estudiante.reputacion} />
        </div>
      </header>

      {/* Resumen profesional */}
      <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
        {estudiante.resumen}
      </p>

      {/* ---------- HABILIDADES ---------- */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Habilidades técnicas</h2>
        <ul className="flex flex-wrap gap-2">
          {estudiante.habilidades.map((hab) => (
            <li
              key={hab.nombre}
              className={`rounded-full border px-3 py-1 text-sm ${colorNivel[hab.nivel]}`}
            >
              {hab.nombre}
              <span className="ml-1 opacity-70">· {hab.nivel}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- PORTAFOLIO ---------- */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Proyectos completados</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {estudiante.proyectos.map((proyecto) => (
            <li
              key={proyecto.id}
              className="flex flex-col gap-3 rounded-xl border border-black/[.08] p-5 dark:border-white/[.145]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{proyecto.titulo}</h3>
                {/* Calificación recibida en ese proyecto */}
                <span className="shrink-0 text-sm text-fwd-amarillo">
                  {"★".repeat(proyecto.calificacion)}
                </span>
              </div>

              {/* Tecnologías usadas */}
              <ul className="flex flex-wrap gap-1.5">
                {proyecto.tecnologias.map((tech) => (
                  <li
                    key={tech}
                    className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-white/[.06] dark:text-zinc-300"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              {/* Enlaces a repositorio Git y demo en vivo */}
              <div className="flex gap-4 text-sm">
                {proyecto.repoUrl && (
                  <a
                    href={proyecto.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fwd-azul hover:underline"
                  >
                    Repositorio →
                  </a>
                )}
                {proyecto.demoUrl && (
                  <a
                    href={proyecto.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fwd-azul hover:underline"
                  >
                    Demo en vivo →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
