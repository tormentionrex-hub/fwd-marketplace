"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import ProyectoCard from "@/components/features/marketplace/ProyectoCard";
import type { ProyectoMarketplace } from "@/types/marketplace";
import AnimatedMarketplaceTitle from "@/components/AnimatedMarketplaceTitle";
import SelectFWD from "@/components/SelectFWD";
import TechFilterDropdown from "@/components/features/marketplace/TechFilterDropdown";
import CategoriaFilterDropdown from "@/components/features/marketplace/CategoriaFilterDropdown";
import CategoriesSection, { CATEGORIAS_CONFIG } from "@/components/features/marketplace/CategoriesSection";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/motion";
import { FwdIsotipo } from "@/components/ui/fwd-logo";
import ParticleBackground from "@/components/ParticleBackground";

const TODO_AREA     = "Todas las áreas";
const TODA_TECH     = "Todas las tecnologías";
const TODA_FECHA    = "Cualquier fecha";
const TODA_DURACION = "Cualquier duración";
const TODA_CATEGORIA = "Todas las categorías";

const ORDENES:   [string, ...string[]] = ["Más recientes", "Más antiguos", "Más relevantes"];
const FECHAS:    [string, ...string[]] = ["Cualquier fecha", "Esta semana", "Este mes", "Últimos 3 meses"];
const DURACIONES:[string, ...string[]] = ["Cualquier duración", "Corto (≤7 días)", "Medio (8–30 días)", "Largo (>30 días)"];

type CategoriaChip = { label: string; keywords: string[] };

const CATEGORIAS_CHIPS: CategoriaChip[] = [
  { label: "Turismo",           keywords: ["turismo", "viaje", "hotel", "hospedaje", "destino", "tour"] },
  { label: "Skills",            keywords: ["habilidad", "skill", "capacitación", "aprendizaje", "formación", "entrenamiento"] },
  { label: "Automatización",    keywords: ["automatización", "automatizar", "bot", "script", "workflow", "rpa", "proceso"] },
  { label: "Tecnología",        keywords: ["tecnología", "software", "app", "sistema", "plataforma", "digital", "tech"] },
  { label: "Educación",         keywords: ["educación", "educativo", "enseñanza", "curso", "universidad", "escuela", "aprendizaje"] },
  { label: "Servicios",         keywords: ["servicio", "consultoría", "soporte", "outsourcing", "atención"] },
  { label: "Marketing",         keywords: ["marketing", "publicidad", "branding", "seo", "campaña", "redes sociales", "contenido"] },
  { label: "Emprendimiento",    keywords: ["emprendimiento", "startup", "negocio", "empresa", "pyme"] },
  { label: "Innovación",        keywords: ["innovación", "investigación", "disruptivo", "i+d", "experimental"] },
  { label: "Solución de problemas", keywords: ["solución", "resolver", "problema", "optimización", "eficiencia", "mejora"] },
  { label: "JavaScript",        keywords: ["javascript", "js", "typescript", "ts", "node", "react", "vue", "angular", "next"] },
  { label: "Python",            keywords: ["python", "django", "flask", "fastapi"] },
  { label: "Ruby",              keywords: ["ruby", "rails"] },
];

type ResultadoSemantico = { id: string; similitud: number };

interface Props {
  proyectos: ProyectoMarketplace[];
  locale: string;
}

function matchCategoria(p: ProyectoMarketplace, cat: string): boolean {
  const def = CATEGORIAS_CHIPS.find((c) => c.label === cat);
  if (!def) return true;
  const texto   = `${p.titulo} ${p.descripcion} ${p.areaNegocio ?? ""}`.toLowerCase();
  const tecText = p.tecnologias.join(" ").toLowerCase();
  return def.keywords.some((kw) => texto.includes(kw) || tecText.includes(kw));
}

function matchFecha(p: ProyectoMarketplace, fecha: string): boolean {
  if (fecha === TODA_FECHA || !p.publicado) return true;
  const diff = Date.now() - new Date(p.publicado).getTime();
  const dia  = 86_400_000;
  if (fecha === "Esta semana")       return diff <= 7  * dia;
  if (fecha === "Este mes")          return diff <= 30 * dia;
  if (fecha === "Últimos 3 meses")   return diff <= 90 * dia;
  return true;
}

function matchDuracion(p: ProyectoMarketplace, duracion: string): boolean {
  if (duracion === TODA_DURACION || p.plazoDias == null) return true;
  if (duracion === "Corto (≤7 días)")     return p.plazoDias <= 7;
  if (duracion === "Medio (8–30 días)")   return p.plazoDias >= 8 && p.plazoDias <= 30;
  if (duracion === "Largo (>30 días)")    return p.plazoDias > 30;
  return true;
}

export default function MarketplaceExplorer({ proyectos, locale }: Props) {
  const [query,    setQuery]    = useState("");
  const [area,     setArea]     = useState(TODO_AREA);
  const [tech,     setTech]     = useState(TODA_TECH);
  const [orden,    setOrden]    = useState(ORDENES[0]);
  const [fecha,    setFecha]    = useState(TODA_FECHA);
  const [duracion, setDuracion] = useState(TODA_DURACION);
  const [categoria, setCategoria] = useState(TODA_CATEGORIA);
  const [soloIA,   setSoloIA]   = useState(false);
  const [pagina,   setPagina]   = useState(1);

  const [semanticos,    setSemanticos]    = useState<ResultadoSemantico[]>([]);
  const [buscandoIA,    setBuscandoIA]    = useState(false);
  const [modoSemantico, setModoSemantico] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const POR_PAGINA = 6;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setSemanticos([]); setModoSemantico(false); setBuscandoIA(false);
      return;
    }
    setBuscandoIA(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/marketplace/buscar?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = (await res.json()) as { resultados: ResultadoSemantico[] };
          setSemanticos(data.resultados);
          setModoSemantico(true);
          setOrden("Más relevantes");
        }
      } catch {
        setModoSemantico(false); setSemanticos([]);
      } finally {
        setBuscandoIA(false);
      }
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const areasOpciones = useMemo<[string, ...string[]]>(() => {
    const set = new Set<string>();
    proyectos.forEach((p) => { if (p.areaNegocio) set.add(p.areaNegocio); });
    return [TODO_AREA, ...Array.from(set).sort()];
  }, [proyectos]);

  const techOpciones = useMemo<[string, ...string[]]>(() => {
    const set = new Set<string>();
    proyectos.forEach((p) => p.tecnologias.forEach((t) => set.add(t)));
    return [TODA_TECH, ...Array.from(set).sort()];
  }, [proyectos]);

  const hasFilters =
    query !== "" ||
    area !== TODO_AREA ||
    tech !== TODA_TECH ||
    fecha !== TODA_FECHA ||
    duracion !== TODA_DURACION ||
    categoria !== TODA_CATEGORIA ||
    soloIA;

  const activeFilterCount = [
    area !== TODO_AREA,
    tech !== TODA_TECH,
    fecha !== TODA_FECHA,
    duracion !== TODA_DURACION,
    categoria !== TODA_CATEGORIA,
    soloIA,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setQuery(""); setArea(TODO_AREA); setTech(TODA_TECH);
    setOrden(ORDENES[0]); setPagina(1); setSoloIA(false);
    setSemanticos([]); setModoSemantico(false);
    setFecha(TODA_FECHA); setDuracion(TODA_DURACION); setCategoria(TODA_CATEGORIA);
  };

  const similitudPor = useMemo(() => {
    const map = new Map<string, number>();
    semanticos.forEach((r) => map.set(r.id, r.similitud));
    return map;
  }, [semanticos]);

  const visibles = useMemo(() => {
    let lista: ProyectoMarketplace[];

    if (modoSemantico && semanticos.length > 0) {
      const ids = new Set(semanticos.map((r) => r.id));
      lista = proyectos.filter((p) => ids.has(p.id));
    } else {
      const q = query.trim().toLowerCase();
      lista = proyectos.filter((p) => {
        if (!q) return true;
        return (
          p.titulo.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          (p.empresario.nombreEmpresa ?? "").toLowerCase().includes(q) ||
          p.empresario.nombre.toLowerCase().includes(q) ||
          (p.areaNegocio ?? "").toLowerCase().includes(q) ||
          p.tecnologias.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    lista = lista.filter((p) => {
      const matchArea = area === TODO_AREA || p.areaNegocio === area;
      const matchTech = tech === TODA_TECH  || p.tecnologias.includes(tech);
      const matchCat  = categoria === TODA_CATEGORIA || matchCategoria(p, categoria);
      const matchF    = matchFecha(p, fecha);
      const matchD    = matchDuracion(p, duracion);
      const matchIA   = !soloIA || p.usaIA;
      return matchArea && matchTech && matchCat && matchF && matchD && matchIA;
    });

    if (orden === "Más relevantes" && modoSemantico) {
      lista = [...lista].sort((a, b) => (similitudPor.get(b.id) ?? 0) - (similitudPor.get(a.id) ?? 0));
    } else if (orden === "Más antiguos") {
      lista = [...lista].sort((a, b) => (a.publicado ?? "").localeCompare(b.publicado ?? ""));
    }

    return lista;
  }, [proyectos, query, area, tech, orden, modoSemantico, semanticos, similitudPor, categoria, fecha, duracion, soloIA]);

  const totalPaginas = Math.ceil(visibles.length / POR_PAGINA);
  const paginados    = visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // Conteo real de proyectos por categoria (sobre todos los proyectos, sin filtros activos)
  const categoriaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIAS_CONFIG) {
      counts[cat.nombre] = proyectos.filter((p) => matchCategoria(p, cat.nombre)).length;
    }
    return counts;
  }, [proyectos]);

  const cambiarPagina = (p: number) => {
    setPagina(p);
    document.getElementById("marketplace-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* ══ HERO ══ */}
      <section
        className="relative pt-32 pb-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #0a2a4e 40%, #1a0a3e 70%, #662D91 100%)" }}
      >
        {/* Radial glows multicolor */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 80% 30%, rgba(237,0,140,0.28) 0%, transparent 55%)" }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 50% at 10% 70%, rgba(32,190,198,0.22) 0%, transparent 55%)" }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 40% 35% at 50% 0%, rgba(0,143,212,0.18) 0%, transparent 55%)" }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 30% 40% at 0% 20%, rgba(102,45,145,0.2) 0%, transparent 50%)" }} />

        {/* Particles */}
        <ParticleBackground />

        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.07] overflow-hidden">
          <FwdIsotipo style={{ width: "380px", height: "auto" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo giratorio */}
          <div
            className="pointer-events-none absolute hidden lg:block"
            style={{ left: "-45px", top: "-30px", animation: "spinLogo 18s linear infinite" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/imagenes/Comunidad icon-01.png"
              alt=""
              width={170}
              height={170}
              style={{ width: 170, height: 170, objectFit: "contain" }}
            />
          </div>

          <style>{`
            @keyframes spinLogo { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>

          <p className="text-[#20BEC7] text-xs font-semibold uppercase tracking-widest mb-4">
            &#9658;&#9658; MARKETPLACE FWD
          </p>

          <AnimatedMarketplaceTitle text="Explora el Marketplace" className="text-center mb-4" />

          <p className="text-lg max-w-xl mx-auto mb-10 flex flex-wrap justify-center gap-x-2">
            {["Descubre","proyectos,","servicios","y","oportunidades","que","se","adaptan","a","tus","habilidades"].map((word, i) => (
              <span
                key={i}
                className="inline-block cursor-default transition-all duration-200 hover:-translate-y-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => {
                  const colors = ["#20BEC6","#ED008C","#662D91","#008FD5","#FFCB05","#F7901E"];
                  (e.currentTarget as HTMLElement).style.color = colors[i % colors.length] ?? "#20BEC6";
                  (e.currentTarget as HTMLElement).style.textShadow = `0 0 20px ${colors[i % colors.length]}88`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                  (e.currentTarget as HTMLElement).style.textShadow = "none";
                }}
              >
                {word}
              </span>
            ))}
          </p>

          {/* ── Barra de búsqueda ── */}
          <div className="relative mb-5">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Busca por título, área, tecnología o empresa..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPagina(1); }}
              className="w-full pl-14 pr-6 py-5 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none transition-all backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#20BEC6"; e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            />
            {buscandoIA && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#20BEC6]" style={{ fontSize: 12, fontWeight: 600 }}>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Buscando
              </div>
            )}
            {modoSemantico && !buscandoIA && (
              <div
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#20BEC6]"
                style={{ fontSize: 11, fontWeight: 700, background: "rgba(32,190,198,0.15)", border: "1px solid rgba(32,190,198,0.4)", padding: "3px 10px", borderRadius: 20, letterSpacing: "0.4px" }}
              >
                IA activa
              </div>
            )}
          </div>

          {/* ── Filtros — Fila 1: filtros principales ── */}
          <div className="flex flex-wrap gap-3 justify-center items-center">
            <CategoriaFilterDropdown value={categoria} onChange={(v) => { setCategoria(v); setPagina(1); }} />
            {areasOpciones.length > 1 && (
              <SelectFWD value={area} onChange={(v) => { setArea(v); setPagina(1); }} options={areasOpciones} />
            )}
            {techOpciones.length > 1 && (
              <TechFilterDropdown value={tech} onChange={(v) => { setTech(v); setPagina(1); }} options={techOpciones} />
            )}
            {/* Toggle Usa IA */}
            <button
              onClick={() => { setSoloIA((v) => !v); setPagina(1); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
              style={{
                background: soloIA ? "linear-gradient(135deg, rgba(102,45,145,0.5), rgba(237,0,140,0.4))" : "rgba(255,255,255,0.1)",
                border: soloIA ? "1px solid #ED008C" : "1px solid rgba(255,255,255,0.2)",
                color: soloIA ? "#fff" : "rgba(255,255,255,0.6)",
                boxShadow: soloIA ? "0 0 16px rgba(237,0,140,0.3)" : "none",
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Usa IA
            </button>
          </div>

          {/* ── Filtros — Fila 2: fecha, duración, ordenar y limpiar ── */}
          <div className="flex flex-wrap gap-3 justify-center items-center mt-3">
            <SelectFWD value={fecha}    onChange={(v) => { setFecha(v);    setPagina(1); }} options={FECHAS}    />
            <SelectFWD value={duracion} onChange={(v) => { setDuracion(v); setPagina(1); }} options={DURACIONES} />

            {/* Divisor visual */}
            <div className="hidden sm:block w-px h-8 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />

            <SelectFWD
              value={orden}
              onChange={(v) => { setOrden(v); setPagina(1); }}
              options={modoSemantico ? ORDENES : (ORDENES.slice(0, 2) as [string, ...string[]])}
            />

            {/* Limpiar con badge de conteo */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/70 text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ED008C"; e.currentTarget.style.color = "#ED008C"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-black text-white" style={{ background: "#ED008C" }}>
                    {activeFilterCount}
                  </span>
                )}
                Limpiar
              </button>
            )}
          </div>
        </div>

      </section>

      {/* ══ CONTENIDO ══ */}
      <div
        className="relative overflow-hidden bg-surface"
      >
        <div className="absolute inset-0 z-0">
          <ParticleBackground />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 sm:px-8">

          <div className="flex items-center gap-3 mb-8" id="marketplace-grid">
            <p className="text-text-muted text-sm">
              {visibles.length} proyecto{visibles.length !== 1 ? "s" : ""} encontrado{visibles.length !== 1 ? "s" : ""}
              {totalPaginas > 1 && (
                <span className="ml-2 text-text-muted/60">· Página {pagina} de {totalPaginas}</span>
              )}
            </p>
            {categoria !== TODA_CATEGORIA && (
              <span
                style={{ fontSize: 11, fontWeight: 700, color: "#ED008C", background: "rgba(237,0,140,0.08)", border: "1px solid rgba(237,0,140,0.2)", padding: "2px 10px", borderRadius: 20 }}
              >
                {categoria}
              </span>
            )}
            {modoSemantico && !buscandoIA && (
              <span
                style={{ fontSize: 11, fontWeight: 700, color: "#20BEC6", background: "rgba(32,190,198,0.08)", border: "1px solid rgba(32,190,198,0.2)", padding: "2px 10px", borderRadius: 20 }}
              >
                Ordenados por relevancia semantica
              </span>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paginados.map((proyecto, index) => (
              <ScrollReveal key={proyecto.id} delay={(index % 3) * 120}>
                <ProyectoCard proyecto={proyecto} locale={locale} />
              </ScrollReveal>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-14">
              <button
                onClick={() => cambiarPagina(pagina - 1)}
                disabled={pagina === 1}
                aria-label="Anterior"
                className="group relative w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #1a0a40, #662D91)" }}
              >
                <svg className="w-4 h-4 text-white transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => cambiarPagina(n)}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 hover:scale-110 active:scale-95"
                  style={
                    n === pagina
                      ? { background: "linear-gradient(135deg, #20BEC6, #008FD5)", color: "white", boxShadow: "0 4px 20px rgba(32,190,198,0.5), 0 0 0 3px rgba(32,190,198,0.2)" }
                      : { background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                  }
                  onMouseEnter={(e) => {
                    if (n !== pagina) {
                      (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #20BEC622, #008FD522)";
                      (e.currentTarget as HTMLElement).style.color = "#008FD5";
                      (e.currentTarget as HTMLElement).style.borderColor = "#20BEC6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (n !== pagina) {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    }
                  }}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => cambiarPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                aria-label="Siguiente"
                className="group relative w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #662D91, #ED008C)" }}
              >
                <svg className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Estado vacío */}
          {visibles.length === 0 && !buscandoIA && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg className="w-16 h-16 mb-6 text-text-muted/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                {proyectos.length === 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                )}
              </svg>
              {proyectos.length === 0 ? (
                <>
                  <p className="text-text-muted text-lg font-semibold mb-2">Aun no hay proyectos publicados</p>
                  <p className="text-text-muted/60 text-sm">Los empresarios estan preparando sus proyectos. Volvé pronto.</p>
                </>
              ) : (
                <>
                  <p className="text-text-muted text-lg font-semibold mb-2">Sin resultados</p>
                  <p className="text-text-muted/60 text-sm mb-6">
                    {modoSemantico
                      ? "No encontramos proyectos semanticamente similares. Intenta con otras palabras."
                      : "Intentá ajustar los filtros o limpiarlos para ver todos los proyectos."}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:scale-105"
                    style={{ background: "linear-gradient(90deg, #20BEC6, #008FD4)" }}
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}

          {/* Skeleton mientras busca IA */}
          {buscandoIA && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{ height: 320, background: "var(--surface-2)", animation: "pulse 1.5s ease-in-out infinite" }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ CATEGORIAS ══ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-surface" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(32,190,198,0.13) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 55% at 100% 0%, rgba(102,45,145,0.10) 0%, transparent 60%)",
              "radial-gradient(ellipse 45% 40% at 50% 100%, rgba(237,0,140,0.09) 0%, transparent 55%)",
              "radial-gradient(ellipse 35% 30% at 100% 100%, rgba(0,143,213,0.08) 0%, transparent 50%)",
            ].join(", "),
          }}
        />
        <ParticleBackground />
        <div className="relative z-10 mx-auto w-full max-w-7xl space-y-20 px-6 py-12 sm:px-8">
          <section>
            <Reveal>
              <SectionHeading
                eyebrow="Categorias Populares"
                title="Explora por area de interes"
                description="Hace clic en una categoria para filtrar los proyectos disponibles."
              />
            </Reveal>
            <div className="mt-8">
              <CategoriesSection
                counts={categoriaCounts}
                selected={categoria}
                onSelect={(v) => { setCategoria(v); setPagina(1); }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
