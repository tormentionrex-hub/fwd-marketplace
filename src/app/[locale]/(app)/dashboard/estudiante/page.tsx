import Link from "next/link";

// Dashboard del estudiante (Sefora · Página 08).
// URL: /es/dashboard/estudiante
//
// Solo accesible si el estudiante fue verificado como egresado FWD.
// Sin verificación se muestra una pantalla de estado pendiente.

// Estados posibles de una oferta enviada.
type EstadoOferta = "enviada" | "en_revision" | "adjudicada" | "no_seleccionada";

const etiquetaEstado: Record<EstadoOferta, string> = {
  enviada: "Enviada",
  en_revision: "En revisión",
  adjudicada: "Adjudicada",
  no_seleccionada: "No seleccionada",
};

const colorEstado: Record<EstadoOferta, string> = {
  enviada: "bg-fwd-azul/10 text-fwd-azul",
  en_revision: "bg-fwd-naranja/10 text-fwd-naranja",
  adjudicada: "bg-fwd-turquesa/10 text-fwd-turquesa",
  no_seleccionada: "bg-zinc-200 text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300",
};

export default async function DashboardEstudiantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // --- Datos de ejemplo. Aquí más adelante consultarás Supabase. ---
  const estudiante = {
    nombre: "Juan",
    verificado: true, // ¿Verificado como egresado FWD?
    totalOfertas: 12,
    proyectosCompletados: 4,
    calificacionPromedio: 4.6,
    reputacion: 4.6,
    proyectosActivos: 1,
  };

  const ofertas: { id: string; proyecto: string; estado: EstadoOferta }[] = [
    { id: "1", proyecto: "Plataforma de inventario para PYME", estado: "en_revision" },
    { id: "2", proyecto: "App de reservas para clínica dental", estado: "adjudicada" },
    { id: "3", proyecto: "Rediseño de sitio corporativo", estado: "no_seleccionada" },
    { id: "4", proyecto: "Bot de atención al cliente", estado: "enviada" },
  ];

  const notificaciones = [
    "Tu oferta en 'App de reservas' fue adjudicada 🎉",
    "El empresario revisó tu perfil",
    "Nuevo proyecto de TI que coincide con tus habilidades",
  ];

  const proyectoActivo = {
    id: "2",
    titulo: "App de reservas para clínica dental",
  };

  // --- Pantalla de estado pendiente si no está verificado ---
  if (!estudiante.verificado) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-fwd-naranja/30 bg-fwd-naranja/5 p-10 text-center">
        <h1 className="text-xl font-semibold">Verificación pendiente</h1>
        <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Tu cuenta aún no ha sido verificada como egresado de FWD Costa Rica.
          Una vez confirmada tu verificación, podrás acceder a tu dashboard y
          enviar ofertas a proyectos.
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Hola, {estudiante.nombre}
      </h1>

      {/* ---------- TARJETAS RESUMEN ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaResumen
          etiqueta="Ofertas enviadas"
          valor={estudiante.totalOfertas}
        />
        <TarjetaResumen
          etiqueta="Proyectos completados"
          valor={estudiante.proyectosCompletados}
          detalle={`★ ${estudiante.calificacionPromedio.toFixed(1)} promedio`}
        />
        <TarjetaResumen
          etiqueta="Reputación"
          valor={`${estudiante.reputacion.toFixed(1)} / 5`}
          detalle="★★★★★"
        />
        <TarjetaResumen
          etiqueta="Proyectos activos"
          valor={estudiante.proyectosActivos}
        />
      </div>

      {/* Acceso rápido al proyecto activo + explorar proyectos */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/${locale}/marketplace`}
          className="inline-flex h-11 items-center justify-center rounded-full bg-fwd-azul px-6 font-medium text-white transition-colors hover:opacity-90"
        >
          Explorar proyectos disponibles
        </Link>
        {proyectoActivo && (
          <Link
            href={`/${locale}/proyectos/${proyectoActivo.id}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-fwd-azul px-6 font-medium text-fwd-azul transition-colors hover:bg-fwd-azul/5"
          >
            Ir a mi proyecto activo
          </Link>
        )}
      </div>

      {/* ---------- CONTENIDO PRINCIPAL ---------- */}
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Lista de mis ofertas */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Mis ofertas</h2>
          <ul className="flex flex-col gap-2">
            {ofertas.map((oferta) => (
              <li
                key={oferta.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
              >
                <Link
                  href={`/${locale}/proyectos/${oferta.id}`}
                  className="truncate text-sm hover:underline"
                >
                  {oferta.proyecto}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${colorEstado[oferta.estado]}`}
                >
                  {etiquetaEstado[oferta.estado]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notificaciones recientes sin leer */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          <ul className="flex flex-col gap-2">
            {notificaciones.map((nota, i) => (
              <li
                key={i}
                className="rounded-lg border border-black/[.08] px-4 py-3 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-300"
              >
                {nota}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// Tarjeta de resumen reutilizable de la parte superior del dashboard.
function TarjetaResumen({
  etiqueta,
  valor,
  detalle,
}: {
  etiqueta: string;
  valor: string | number;
  detalle?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-black/[.08] p-5 dark:border-white/[.145]">
      <span className="text-sm text-zinc-500">{etiqueta}</span>
      <span className="text-2xl font-semibold">{valor}</span>
      {detalle && <span className="text-xs text-fwd-amarillo">{detalle}</span>}
    </div>
  );
}
