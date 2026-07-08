import Link from "next/link";
import Footer from "@/components/Footer";
import HomeButton from "@/components/HomeButton";
import SettingsPanel from "@/components/SettingsPanel";
import ParticleBackground from "@/components/ParticleBackground";
import PostularPanel from "@/components/features/marketplace/PostularPanel";
import CarruselImagenes from "@/components/features/marketplace/CarruselImagenes";
import {
  IconBriefcase,
  IconMapPin,
  IconCalendar,
  IconUsers,
  IconBolt,
  IconCpu,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconShieldCheck,
  IconFile,
  IconExternalLink,
  IconClock,
  IconRocket,
  IconGraduation,
  IconTarget,
} from "@/components/ui/icons";
import { obtenerDetalleVacante, obtenerDatosSidebarVacante } from "@/server/services/vacante.service";
import {
  formatearSalario,
  labelModalidad,
  labelTipoEmpleo,
  labelNivel,
} from "@/lib/vacante-format";
import { tiempoRelativo } from "@/lib/tiempo";

const COLOR_POR_AREA: Record<string, string> = {
  "Tecnología": "#008FD4", "Educación": "#662D91", "Servicios": "#20BEC6",
  "Marketing": "#008FD4", "Emprendimiento": "#F7901E", "Innovación": "#EC008C",
  "Logística": "#20BEC6", "Comercio": "#F7901E", "Finanzas": "#008FD4",
  "Gastronomía": "#EC008C", "Recursos Humanos": "#662D91", "Salud": "#20BEC6",
  "Turismo": "#008FD4", "Operaciones": "#F7901E", "Mercadeo": "#EC008C",
};
const COLORES_FWD = ["#008FD4", "#662D91", "#EC008C", "#20BEC6", "#F7901E"];
function colorVacante(id: string, area: string | null): string {
  if (area && COLOR_POR_AREA[area]) return COLOR_POR_AREA[area]!;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % COLORES_FWD.length;
  return COLORES_FWD[h]!;
}

// Divide un texto en ítems (por saltos de línea o viñetas). Si hay más de uno,
// la sección se muestra como lista; si es un solo párrafo, como texto corrido.
function comoLista(texto: string): string[] {
  return texto
    .split(/\r?\n|(?:^|\s)[•·]\s/)
    .map((l) => l.replace(/^\s*[-*•·]\s*/, "").trim())
    .filter((l) => l.length > 0);
}

export default async function VacanteDetallePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const vacante = await obtenerDetalleVacante(id);

  if (!vacante) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <ParticleBackground />
        <IconBriefcase width={56} height={56} className="text-text-muted/40" />
        <h1 className="font-heading text-2xl font-black text-text">Vacante no encontrada</h1>
        <p className="text-text-muted">Puede que haya sido cerrada o eliminada.</p>
        <Link href={`/${locale}/marketplace/vacantes`} className="mt-2 rounded-full bg-fwd-blue px-6 py-3 text-sm font-bold text-white">
          Ver todas las vacantes
        </Link>
      </div>
    );
  }

  const { totalPostulaciones, similares } = await obtenerDatosSidebarVacante(vacante.id, vacante.area);

  const color = colorVacante(vacante.id, vacante.area);
  const empresa = vacante.empresario.nombreEmpresa ?? vacante.empresario.nombre;
  const fotoEmpresa = vacante.empresario.fotoUrl;
  const salario = formatearSalario(vacante);
  const modalidad = labelModalidad(vacante.modalidad);
  const tipoEmpleo = labelTipoEmpleo(vacante.tipoEmpleo);
  const nivel = labelNivel(vacante.nivelExperiencia);

  const ahora = Date.now();
  const vencida = vacante.fechaCierre !== null && new Date(vacante.fechaCierre).getTime() < ahora;
  const bloqueada = vacante.estado !== "abierta" || vencida;

  const cierreTexto = vacante.fechaCierre
    ? new Date(vacante.fechaCierre).toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const diasParaCierre = vacante.fechaCierre
    ? Math.ceil((new Date(vacante.fechaCierre).getTime() - ahora) / 86_400_000)
    : null;
  const publicadaHace = tiempoRelativo(vacante.publicado);

  // Chips de resumen rápido (hero).
  const chips = [modalidad, tipoEmpleo, nivel, vacante.ubicacion].filter(Boolean) as string[];

  // Tarjetas de datos clave (grid).
  const claves: { icon: React.ReactNode; label: string; value: string }[] = [];
  if (tipoEmpleo) claves.push({ icon: <IconCalendar width={18} height={18} />, label: "Tipo de empleo", value: tipoEmpleo });
  if (nivel) claves.push({ icon: <IconGraduation width={18} height={18} />, label: "Experiencia", value: nivel });
  if (modalidad) claves.push({ icon: <IconBriefcase width={18} height={18} />, label: "Modalidad", value: modalidad });
  if (vacante.ubicacion) claves.push({ icon: <IconMapPin width={18} height={18} />, label: "Ubicación", value: vacante.ubicacion });

  // Detalles del sidebar.
  const detalles: { label: string; value: string }[] = [];
  if (vacante.area) detalles.push({ label: "Área", value: vacante.area });
  if (tipoEmpleo) detalles.push({ label: "Tipo de empleo", value: tipoEmpleo });
  if (modalidad) detalles.push({ label: "Modalidad", value: modalidad });
  if (nivel) detalles.push({ label: "Experiencia", value: nivel });
  if (vacante.ubicacion) detalles.push({ label: "Ubicación", value: vacante.ubicacion });
  detalles.push({ label: "Plazas", value: String(vacante.plazas) });
  if (publicadaHace) detalles.push({ label: "Publicada", value: publicadaHace });
  if (cierreTexto) detalles.push({ label: "Cierra", value: cierreTexto });

  return (
    <div className="relative flex flex-col">
      <HomeButton />
      <div className="fixed right-40 top-5 z-50">
        <SettingsPanel />
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-10" style={{ background: `linear-gradient(135deg, #0e1628 0%, ${color}22 60%, ${color} 130%)` }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <ParticleBackground />
        </div>
        <div className="relative mx-auto max-w-5xl px-6">
          <Link href={`/${locale}/marketplace/vacantes`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white">
            <IconArrowLeft width={16} height={16} />
            Volver a vacantes
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {vacante.area && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">{vacante.area}</span>
            )}
            <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white">
              {bloqueada ? "Cerrada" : "Abierta"}
            </span>
            {publicadaHace && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
                <IconClock width={12} height={12} /> Publicada {publicadaHace}
              </span>
            )}
          </div>
          <h1 className="mt-4 font-heading text-3xl font-black leading-tight text-white sm:text-4xl">{vacante.titulo}</h1>
          <div className="mt-4 flex items-center gap-3">
            {fotoEmpresa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoEmpresa} alt={empresa} className="h-11 w-11 rounded-full object-cover shadow-md ring-2 ring-white/40" />
            ) : (
              <span className="grid h-11 w-11 place-items-center rounded-full text-lg font-black text-white shadow-md" style={{ background: color }}>
                {empresa.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <Link href={`/${locale}/empresa/${vacante.empresario.id}`} className="font-bold text-white hover:underline">
                {empresa}
              </Link>
              {vacante.empresario.sector && <p className="text-sm text-white/60">{vacante.empresario.sector}</p>}
            </div>
          </div>

          {/* Chips de resumen rápido */}
          {chips.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/15">
                  {c}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/15">
                <IconUsers width={12} height={12} /> {vacante.plazas} {vacante.plazas === 1 ? "plaza" : "plazas"}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Contenido */}
      <div className="relative overflow-hidden bg-bg">
        <ParticleBackground />
        <div className="relative z-10 mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
          {/* Columna principal */}
          <div className="flex flex-col gap-8">
            {/* Callout de carrera */}
            <div className="flex items-start gap-4 rounded-2xl p-5" style={{ background: `${color}0f`, border: `1px solid ${color}33` }}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${color}1f`, color }}>
                <IconRocket width={22} height={22} />
              </span>
              <div>
                <h3 className="font-heading font-black text-text">Da el siguiente paso en tu carrera</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Una empresa real, un puesto real y un equipo que quiere conocer tu talento. Postulate y empezá a crecer profesionalmente.
                </p>
              </div>
            </div>

            {/* Datos clave */}
            {claves.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {claves.map((c, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-surface p-4 text-center">
                    <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}15`, color }}>
                      {c.icon}
                    </span>
                    <p className="text-[11px] uppercase tracking-wide text-text-muted">{c.label}</p>
                    <p className="mt-0.5 text-sm font-bold text-text">{c.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Galería */}
            {vacante.imagenes.length > 0 && (
              <CarruselImagenes imagenes={vacante.imagenes} titulo={vacante.titulo} />
            )}

            {/* Salario */}
            {salario && (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${color}15`, color }}>
                  <IconBolt width={22} height={22} />
                </span>
                <div>
                  <p className="text-xs text-text-muted">Salario</p>
                  <p className="text-lg font-black" style={{ color }}>{salario}</p>
                </div>
              </div>
            )}

            <Seccion titulo="Descripción del puesto">
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">{vacante.descripcion}</p>
            </Seccion>

            {vacante.responsabilidades && (
              <Seccion titulo="Responsabilidades">
                <ListaOParrafo texto={vacante.responsabilidades} color={color} />
              </Seccion>
            )}

            {vacante.requisitos && (
              <Seccion titulo="Requisitos">
                <ListaOParrafo texto={vacante.requisitos} color={color} icon="target" />
              </Seccion>
            )}

            {vacante.beneficios && (
              <Seccion titulo="Beneficios">
                <ListaOParrafo texto={vacante.beneficios} color={color} />
              </Seccion>
            )}

            {vacante.tecnologias.length > 0 && (
              <Seccion titulo="Tecnologías y habilidades">
                <div className="flex flex-wrap gap-2">
                  {vacante.tecnologias.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                      style={{ borderColor: `${color}30`, background: `${color}10`, color }}>
                      <IconCpu width={12} height={12} className="opacity-70" />
                      {t}
                    </span>
                  ))}
                </div>
              </Seccion>
            )}

            {/* Documentos adjuntos */}
            {vacante.documentos.length > 0 && (
              <Seccion titulo="Documentos de la vacante">
                <div className="flex flex-col gap-2.5">
                  {vacante.documentos.map((doc) => (
                    <a
                      key={doc.url}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 transition-colors hover:border-fwd-azul/40"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${color}15`, color }}>
                        <IconFile width={17} height={17} />
                      </span>
                      <span className="flex-1 truncate text-sm font-semibold text-text">{doc.nombre}</span>
                      <IconExternalLink width={15} height={15} className="shrink-0 text-text-muted transition-colors group-hover:text-fwd-azul" />
                    </a>
                  ))}
                </div>
              </Seccion>
            )}

            {/* Sobre la empresa */}
            <Seccion titulo="Sobre la empresa">
              <div className="flex items-start gap-4">
                {fotoEmpresa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoEmpresa} alt={empresa} className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-black text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                    {empresa.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading font-black text-text">{empresa}</span>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                      <IconShieldCheck width={10} height={10} /> Verificada
                    </span>
                  </div>
                  {vacante.empresario.sector && <p className="text-xs text-text-muted">{vacante.empresario.sector}</p>}
                  {vacante.empresaDescripcion && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-muted line-clamp-4">{vacante.empresaDescripcion}</p>
                  )}
                  <Link href={`/${locale}/empresa/${vacante.empresario.id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color }}>
                    Ver perfil de la empresa
                    <IconArrowRight width={14} height={14} />
                  </Link>
                </div>
              </div>
            </Seccion>

            {/* Proceso de postulación */}
            <Seccion titulo="Cómo postularte">
              <ol className="flex flex-col gap-4">
                {[
                  "Revisá los requisitos y responsabilidades para confirmar que encajás con el puesto.",
                  "Presioná \"Postularme\", escribí un mensaje de presentación y adjuntá tu CV si querés.",
                  "La empresa revisa tu perfil y te contacta si avanzás en el proceso de selección.",
                ].map((paso, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black text-white" style={{ background: color }}>
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-text-muted">{paso}</p>
                  </li>
                ))}
              </ol>
            </Seccion>
          </div>

          {/* Sidebar sticky */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
            {/* Postular */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              {salario && (
                <div className="mb-4 border-b border-border pb-4">
                  <p className="text-xs text-text-muted">Salario</p>
                  <p className="text-lg font-black" style={{ color }}>{salario}</p>
                </div>
              )}
              <PostularPanel locale={locale} vacanteId={vacante.id} bloqueada={bloqueada} color={color} />
              {!bloqueada && diasParaCierre !== null && diasParaCierre >= 0 && (
                <p className="mt-3 text-center text-xs text-text-muted">
                  {diasParaCierre === 0 ? "Cierra hoy" : `Cierra en ${diasParaCierre} día${diasParaCierre !== 1 ? "s" : ""}`}
                </p>
              )}
            </div>

            {/* Actividad */}
            <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(32,190,198,0.25)" }}>
              <div className="px-5 py-3" style={{ background: "linear-gradient(135deg, rgba(32,190,198,0.12), rgba(32,190,198,0.04))" }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#20BEC6]">Actividad</p>
              </div>
              <div className="flex items-center gap-3 bg-surface px-5 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "rgba(32,190,198,0.12)", color: "#20BEC6" }}>
                  <IconUsers width={18} height={18} />
                </span>
                <div>
                  <p className="text-lg font-black leading-none text-text">{totalPostulaciones}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {totalPostulaciones === 1 ? "persona ya se postuló" : "personas ya se postularon"}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-3 font-heading text-sm font-black text-text">Detalles</h3>
              <ul className="flex flex-col gap-2.5">
                {detalles.map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 border-t border-border pt-2.5 text-sm first:border-0 first:pt-0">
                    <span className="text-text-muted">{d.label}</span>
                    <span className="text-right font-semibold text-text">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vacantes similares */}
            {similares.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="px-5 py-3" style={{ background: "linear-gradient(135deg, rgba(102,45,145,0.12), rgba(102,45,145,0.04))" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#662D91]">Vacantes similares</p>
                </div>
                <div className="flex flex-col gap-2 bg-surface px-4 py-3">
                  {similares.map((s) => (
                    <Link
                      key={s.id}
                      href={`/${locale}/marketplace/vacantes/${s.id}`}
                      className="group flex items-start gap-3 rounded-xl border border-border px-3 py-2.5 transition-all duration-200 hover:scale-[1.01]"
                      style={{ background: "var(--surface-2)" }}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${colorVacante(s.id, s.area)}, ${colorVacante(s.id, s.area)}bb)` }}>
                        {s.empresa.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-text transition-colors group-hover:text-fwd-azul">{s.titulo}</p>
                        <p className="mt-0.5 text-[10px] text-text-muted">{s.empresa}</p>
                        {s.salario && <p className="mt-1 text-[10px] font-semibold" style={{ color: colorVacante(s.id, s.area) }}>{s.salario}</p>}
                      </div>
                      <IconArrowRight width={13} height={13} className="mt-1 shrink-0 opacity-40 transition-opacity group-hover:opacity-80" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Postulá con confianza */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-2 flex items-center gap-2">
                <IconShieldCheck width={16} height={16} style={{ color: "#10b981" }} />
                <h3 className="font-heading text-sm font-black text-text">Postulá con confianza</h3>
              </div>
              <ul className="flex flex-col gap-2 text-xs text-text-muted">
                <li className="flex items-start gap-2"><IconCheck width={13} height={13} className="mt-0.5 shrink-0 text-emerald-500" /> Empresas verificadas por FWD Costa Rica.</li>
                <li className="flex items-start gap-2"><IconCheck width={13} height={13} className="mt-0.5 shrink-0 text-emerald-500" /> Tus datos solo se comparten al postularte.</li>
                <li className="flex items-start gap-2"><IconCheck width={13} height={13} className="mt-0.5 shrink-0 text-emerald-500" /> Seguí el estado desde &ldquo;Mis postulaciones&rdquo;.</li>
              </ul>
            </div>

            {/* Ver todas */}
            <Link
              href={`/${locale}/marketplace/vacantes`}
              className="group flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <IconArrowLeft width={14} height={14} />
              Ver todas las vacantes
            </Link>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-3 font-heading text-lg font-black text-text">{titulo}</h2>
      {children}
    </section>
  );
}

// Muestra el texto como lista con íconos si tiene varias líneas; si no, párrafo.
function ListaOParrafo({ texto, color, icon = "check" }: { texto: string; color: string; icon?: "check" | "target" }) {
  const items = comoLista(texto);
  if (items.length <= 1) {
    return <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">{texto}</p>;
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted">
          <span className="mt-0.5 shrink-0" style={{ color }}>
            {icon === "target" ? <IconTarget width={15} height={15} /> : <IconCheck width={15} height={15} />}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
