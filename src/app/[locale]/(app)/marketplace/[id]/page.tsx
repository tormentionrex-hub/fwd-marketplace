import Link from "next/link";
import { IconArrowLeft, IconBriefcase, IconClock, IconCpu } from "@/components/ui/icons";
import { obtenerDetalleProyecto } from "@/server/services/proyecto.service";
import ParticleBackground from "@/components/ParticleBackground";
import HomeButton from "@/components/HomeButton";
import SettingsPanel from "@/components/SettingsPanel";
import { FwdIsotipo } from "@/components/ui/fwd-logo";
import CarruselImagenes from "@/components/features/marketplace/CarruselImagenes";
import GaleriaImagenes from "@/components/features/marketplace/GaleriaImagenes";

// Calidad automática para imágenes de Cloudinary: sin pérdida visual perceptible.
function cdnCalidad(url: string, ancho = 1200): string {
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/q_") || url.includes("/upload/f_")) return url;
  return url.replace("/upload/", `/upload/q_auto,f_auto,c_limit,w_${ancho}/`);
}

const COLOR_POR_AREA: Record<string, string> = {
  "Tecnología":       "#008FD4",
  "Educación":        "#662D91",
  "Servicios":        "#20BEC6",
  "Marketing":        "#008FD4",
  "Emprendimiento":   "#F7901E",
  "Innovación":       "#EC008C",
  "Logística":        "#20BEC6",
  "Comercio":         "#F7901E",
  "Finanzas":         "#008FD4",
  "Gastronomía":      "#EC008C",
  "Recursos Humanos": "#662D91",
  "Salud":            "#20BEC6",
  "Turismo":          "#008FD4",
  "Operaciones":      "#F7901E",
  "Mercadeo":         "#EC008C",
};

function areaColor(area: string): string {
  return COLOR_POR_AREA[area] ?? "#008FD4";
}

export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const proyecto = await obtenerDetalleProyecto(id);

  if (!proyecto) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #0a2a4e 60%, #008FD4 100%)" }}>
        <ParticleBackground />
        <HomeButton />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-heading font-black text-3xl text-white mb-3">Proyecto no encontrado</h1>
          <p className="text-white/60 mb-8">El proyecto que buscas no está disponible.</p>
          <Link
            href={`/${locale}/marketplace`}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-bold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #20BEC6, #008FD4)", boxShadow: "0 4px 20px rgba(32,190,198,0.4)" }}
          >
            <IconArrowLeft width={16} height={16} />
            Volver al marketplace
          </Link>
        </div>
      </div>
    );
  }

  const color = areaColor(proyecto.area);
  const empresa = proyecto.empresario.nombre;
  const estaAbierto = proyecto.estado === "abierto";
  const portada = proyecto.imagenes?.[0] ?? null;

  return (
    <div className="flex flex-col min-h-screen">
      <HomeButton />
      <div className="fixed right-40 top-5 z-50">
        <SettingsPanel />
      </div>

      {/* ══ HERO ══ */}
      <section
        className="relative overflow-hidden pt-28 pb-16"
        style={
          portada
            ? { background: "#0e1628" }
            : { background: `linear-gradient(135deg, #0e1628 0%, #0a2a4e 45%, ${color}cc 100%)` }
        }
      >
        {/* Imagen de portada como fondo (si existe) */}
        {portada && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cdnCalidad(portada, 1400)}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.5 }}
            />
            {/* Overlay oscuro para legibilidad */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(135deg, rgba(14,22,40,0.92) 0%, rgba(10,42,78,0.78) 45%, ${color}88 100%)`,
              }}
            />
          </>
        )}

        {/* Glows (solo sin portada o como refuerzo) */}
        {!portada && (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 75% 40%, ${color}35 0%, transparent 60%)` }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(102,45,145,0.25) 0%, transparent 55%)" }}
            />
          </>
        )}

        {/* FWD Isotipo decorativo */}
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.07] overflow-hidden">
          <FwdIsotipo style={{ width: "380px", height: "auto" }} />
        </div>

        {/* Particles solo cuando no hay portada */}
        {!portada && <ParticleBackground />}

        <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8">
          {/* Volver */}
          <Link
            href={`/${locale}/marketplace`}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/60 transition-all duration-200 hover:text-white hover:bg-white/10 mb-8"
          >
            <IconArrowLeft width={15} height={15} />
            Volver al marketplace
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white"
              style={{
                background: estaAbierto ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.15)",
                border: estaAbierto ? "1px solid rgba(16,185,129,0.5)" : "1px solid rgba(239,68,68,0.4)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: estaAbierto ? "#10b981" : "#ef4444", boxShadow: estaAbierto ? "0 0 6px #10b981" : "none" }}
              />
              {estaAbierto ? "Abierto" : proyecto.estado === "cerrado" ? "Cerrado" : proyecto.estado}
            </span>
            {proyecto.area && proyecto.area !== "General" && (
              <span
                className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white"
                style={{ background: `${color}25`, border: `1px solid ${color}60` }}
              >
                {proyecto.area}
              </span>
            )}
          </div>

          {/* Título */}
          <div className="relative mb-6">
            <style>{`
              @keyframes shimmerText {
                0%   { background-position: -200% center; }
                100% { background-position: 200% center; }
              }
              .title-shimmer {
                background: linear-gradient(90deg, #ffffff 0%, #ffffff 35%, ${color} 50%, #ffffff 65%, #ffffff 100%);
                background-size: 200% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: shimmerText 5s linear infinite;
              }
            `}</style>
            <h1 className="title-shimmer font-heading font-black text-3xl leading-tight sm:text-4xl lg:text-5xl">
              {proyecto.titulo}
            </h1>
          </div>

          {/* Descripción resumida */}
          <p className="text-white/65 text-base leading-relaxed max-w-2xl">
            {proyecto.descripcion.slice(0, 200)}{proyecto.descripcion.length > 200 ? "…" : ""}
          </p>

          {/* Chips rápidos */}
          <div className="flex flex-wrap gap-3 mt-8">
            {proyecto.fechaLimite && (
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/80"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <IconClock width={14} height={14} className="text-[#F7901E]" />
                {proyecto.vencido ? "Convocatoria vencida" : `${proyecto.diasRestantes} día${proyecto.diasRestantes !== 1 ? "s" : ""} restantes`}
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/80"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <IconBriefcase width={14} height={14} style={{ color }} />
              {empresa}
            </div>
            {proyecto.tecnologias.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/80"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <IconCpu width={14} height={14} style={{ color }} />
                {proyecto.tecnologias.length} tecnología{proyecto.tecnologias.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: "linear-gradient(to top, var(--surface), transparent)" }} />
      </section>

      {/* ══ CONTENIDO ══ */}
      <div className="relative flex-1 bg-surface overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <ParticleBackground />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: [
              `radial-gradient(ellipse 50% 40% at 0% 0%, ${color}0d 0%, transparent 55%)`,
              "radial-gradient(ellipse 40% 35% at 100% 100%, rgba(102,45,145,0.06) 0%, transparent 50%)",
            ].join(", "),
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">

            {/* ── Columna principal ── */}
            <div className="flex flex-col gap-10">

              {/* Carrusel de imagenes (solo si hay) */}
              {proyecto.imagenes && proyecto.imagenes.length > 0 && (
                <CarruselImagenes imagenes={proyecto.imagenes} titulo={proyecto.titulo} />
              )}

              {/* Descripción completa */}
              <div
                className="rounded-2xl p-7"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(180deg, ${color}, ${color}80)` }}
                  />
                  <h2 className="font-heading font-black text-lg text-text">Descripcion del proyecto</h2>
                </div>
                <p className="text-text-muted leading-relaxed text-base whitespace-pre-line">
                  {proyecto.descripcion}
                </p>
              </div>

              {/* Tecnologías */}
              {proyecto.tecnologias.length > 0 && (
                <div
                  className="rounded-2xl p-7"
                  style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className="w-1 h-6 rounded-full flex-shrink-0"
                      style={{ background: "linear-gradient(180deg, #662D91, #ED008C)" }}
                    />
                    <h2 className="font-heading font-black text-lg text-text">Tecnologias requeridas</h2>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {proyecto.tecnologias.map((tech, i) => {
                      const techColors = ["#008FD4", "#662D91", "#20BEC6", "#F7901E", "#EC008C"];
                      const tc = techColors[i % techColors.length]!;
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 hover:scale-105"
                          style={{
                            background: `${tc}12`,
                            border: `1px solid ${tc}35`,
                            color: tc,
                            boxShadow: `0 2px 8px ${tc}15`,
                          }}
                        >
                          <IconCpu width={13} height={13} className="opacity-80" />
                          {tech}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="flex flex-col gap-5">

              {/* Empresa */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${color}30`, boxShadow: `0 4px 24px ${color}12` }}
              >
                <div
                  className="px-5 py-4"
                  style={{ background: `linear-gradient(135deg, ${color}22, ${color}10)` }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
                    Empresa convocante
                  </p>
                </div>
                <div className="px-5 py-4 bg-surface">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-14 w-14 place-items-center rounded-2xl font-black text-white text-xl shrink-0 shadow-md"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
                    >
                      {empresa.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-heading font-black text-text text-base truncate">{empresa}</p>
                      <p className="text-xs text-text-muted mt-0.5">{proyecto.empresario.sector}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plazo */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                <div
                  className="px-5 py-4"
                  style={{ background: "linear-gradient(135deg, rgba(247,144,30,0.12), rgba(237,0,140,0.06))" }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#F7901E]">
                    Plazo
                  </p>
                </div>
                <div className="px-5 py-4 bg-surface">
                  {proyecto.fechaLimite ? (
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-10 w-10 place-items-center rounded-xl shrink-0"
                        style={{ background: "rgba(247,144,30,0.12)", color: "#F7901E" }}
                      >
                        <IconClock width={18} height={18} />
                      </span>
                      <div>
                        <p className="font-bold text-text text-sm">
                          {proyecto.vencido ? "Convocatoria vencida" : `${proyecto.diasRestantes} día${proyecto.diasRestantes !== 1 ? "s" : ""} restantes`}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(proyecto.fechaLimite).toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-text-muted">
                      <span
                        className="grid h-10 w-10 place-items-center rounded-xl shrink-0"
                        style={{ background: "rgba(100,116,139,0.1)" }}
                      >
                        <IconBriefcase width={18} height={18} />
                      </span>
                      <p className="text-sm font-medium">Sin fecha limite definida</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA postularse */}
              {estaAbierto && (
                <a
                  href={`/${locale}/dashboard/estudiante`}
                  className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 py-4 text-base font-black text-white transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                    boxShadow: `0 6px 28px ${color}45`,
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]" />
                  <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="relative z-10">Postularme a este proyecto</span>
                </a>
              )}

              {/* Ver más proyectos */}
              <Link
                href={`/${locale}/marketplace`}
                className="group flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                <IconArrowLeft width={15} height={15} />
                Ver mas proyectos
              </Link>

              {/* Galería de imágenes del proyecto (solo si hay imágenes) */}
              {proyecto.imagenes && proyecto.imagenes.length > 0 && (
                <div>
                  <p
                    className="mb-2 text-[10px] font-black uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Imagenes del proyecto
                  </p>
                  <GaleriaImagenes imagenes={proyecto.imagenes} />
                </div>
              )}

              {/* Mini badge FWD */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <span
                  className="text-[10px] font-black tracking-[0.25em] uppercase"
                  style={{
                    background: "linear-gradient(90deg, #20BEC6, #008FD5, #662D91, #ED008C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  FWD Marketplace
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
