"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import ProyectoCard from "@/components/features/marketplace/ProyectoCard";
import type { ProyectoMarketplace } from "@/types/marketplace";
import AnimatedMarketplaceTitle from "@/components/AnimatedMarketplaceTitle";
import SelectFWD from "@/components/SelectFWD";
import { FwdIsotipo } from "@/components/ui/fwd-logo";
import ParticleBackground from "@/components/ParticleBackground";

const TODO_AREA = "Todas las áreas";
const TODA_TECH = "Todas las tecnologías";
const ORDENES: [string, ...string[]] = ["Más recientes", "Más antiguos", "Más relevantes"];

type ResultadoSemantico = { id: string; similitud: number };

interface Props {
  proyectos: ProyectoMarketplace[];
  locale: string;
}

export default function MarketplaceExplorer({ proyectos, locale }: Props) {
  const [query,  setQuery]  = useState("");
  const [area,   setArea]   = useState(TODO_AREA);
  const [tech,   setTech]   = useState(TODA_TECH);
  const [orden,  setOrden]  = useState(ORDENES[0]);
  const [pagina, setPagina] = useState(1);

  // Estado de búsqueda semántica
  const [semanticos, setSemanticos]     = useState<ResultadoSemantico[]>([]);
  const [buscandoIA, setBuscandoIA]     = useState(false);
  const [modoSemantico, setModoSemantico] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const POR_PAGINA = 6;

  // Dispara búsqueda semántica con debounce cuando la query cambia.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setSemanticos([]);
      setModoSemantico(false);
      setBuscandoIA(false);
      return;
    }

    setBuscandoIA(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/marketplace/buscar?q=${encodeURIComponent(query.trim())}`,
        );
        if (res.ok) {
          const data = (await res.json()) as { resultados: ResultadoSemantico[] };
          setSemanticos(data.resultados);
          setModoSemantico(true);
          // Al activar modo semántico, cambia el orden a "Más relevantes"
          setOrden("Más relevantes");
        }
      } catch {
        // Si falla la búsqueda semántica, cae al filtro de texto local
        setModoSemantico(false);
        setSemanticos([]);
      } finally {
        setBuscandoIA(false);
      }
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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

  const hasFilters = query !== "" || area !== TODO_AREA || tech !== TODA_TECH;

  const clearFilters = () => {
    setQuery(""); setArea(TODO_AREA); setTech(TODA_TECH);
    setOrden(ORDENES[0]); setPagina(1);
    setSemanticos([]); setModoSemantico(false);
  };

  // Índice de similitud semántica para acceso O(1)
  const similitudPor = useMemo(() => {
    const map = new Map<string, number>();
    semanticos.forEach((r) => map.set(r.id, r.similitud));
    return map;
  }, [semanticos]);

  const visibles = useMemo(() => {
    // Candidatos: si hay resultados semánticos, solo esos; si no, todos
    let lista: ProyectoMarketplace[];

    if (modoSemantico && semanticos.length > 0) {
      // Filtra proyectos que tienen resultado semántico
      const ids = new Set(semanticos.map((r) => r.id));
      lista = proyectos.filter((p) => ids.has(p.id));
    } else {
      // Modo texto local (fallback o sin query)
      const q = query.trim().toLowerCase();
      lista = proyectos.filter((p) => {
        const matchTexto =
          !q ||
          p.titulo.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          (p.empresario.nombreEmpresa ?? "").toLowerCase().includes(q) ||
          p.empresario.nombre.toLowerCase().includes(q) ||
          (p.areaNegocio ?? "").toLowerCase().includes(q) ||
          p.tecnologias.some((t) => t.toLowerCase().includes(q));
        return matchTexto;
      });
    }

    // Filtros de área y tecnología siempre aplican
    lista = lista.filter((p) => {
      const matchArea = area === TODO_AREA || p.areaNegocio === area;
      const matchTech = tech === TODA_TECH || p.tecnologias.includes(tech);
      return matchArea && matchTech;
    });

    // Ordenamiento
    if (orden === "Más relevantes" && modoSemantico) {
      lista = [...lista].sort(
        (a, b) => (similitudPor.get(b.id) ?? 0) - (similitudPor.get(a.id) ?? 0),
      );
    } else if (orden === "Más antiguos") {
      lista = [...lista].sort((a, b) =>
        (a.publicado ?? "").localeCompare(b.publicado ?? ""),
      );
    }
    // "Más recientes" ya viene ordenado del servidor (orderBy publicado desc)

    return lista;
  }, [proyectos, query, area, tech, orden, modoSemantico, semanticos, similitudPor]);

  const totalPaginas = Math.ceil(visibles.length / POR_PAGINA);
  const paginados    = visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const cambiarPagina = (p: number) => {
    setPagina(p);
    document.getElementById("marketplace-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* ══ HERO OSCURO ══ */}
      <section
        className="relative pt-32 pb-16"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #0a2a4e 50%, #008FD4 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(32,190,198,0.12) 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute right-[-60px] top-1/2 -translate-y-1/2 opacity-20">
          <FwdIsotipo style={{ width: "420px", height: "auto" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
            @keyframes spinLogo {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
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

          {/* Barra de búsqueda */}
          <div className="relative mb-4">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Busca por título, área, tecnología o empresa..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPagina(1); }}
              className="w-full pl-14 pr-6 py-5 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none transition-all backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#20BEC6";
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
            />
            {/* Indicador de búsqueda semántica en curso */}
            {buscandoIA && (
              <div
                className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#20BEC6]"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Buscando
              </div>
            )}
            {/* Badge de modo semántico activo */}
            {modoSemantico && !buscandoIA && (
              <div
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#20BEC6]"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "rgba(32,190,198,0.15)",
                  border: "1px solid rgba(32,190,198,0.4)",
                  padding: "3px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.4px",
                }}
              >
                IA activa
              </div>
            )}
          </div>

          {/* Filtros dinámicos */}
          <div className="flex flex-wrap gap-3 justify-center">
            {areasOpciones.length > 1 && (
              <SelectFWD value={area}  onChange={(v) => { setArea(v);  setPagina(1); }} options={areasOpciones} />
            )}
            {techOpciones.length > 1 && (
              <SelectFWD value={tech}  onChange={(v) => { setTech(v);  setPagina(1); }} options={techOpciones} />
            )}
            <SelectFWD
              value={orden}
              onChange={(v) => { setOrden(v); setPagina(1); }}
              options={modoSemantico ? ORDENES : (ORDENES.slice(0, 2) as [string, ...string[]])}
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 rounded-xl text-white/70 text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ED008C";
                  e.currentTarget.style.color = "#ED008C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ══ CONTENIDO ══ */}
      <div className="relative overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 sm:px-8">

          <div className="flex items-center gap-3 mb-8" id="marketplace-grid">
            <p className="text-text-muted text-sm">
              {visibles.length} proyecto{visibles.length !== 1 ? "s" : ""} encontrado{visibles.length !== 1 ? "s" : ""}
              {totalPaginas > 1 && (
                <span className="ml-2 text-text-muted/60">· Página {pagina} de {totalPaginas}</span>
              )}
            </p>
            {modoSemantico && !buscandoIA && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#20BEC6",
                  background: "rgba(32,190,198,0.08)",
                  border: "1px solid rgba(32,190,198,0.2)",
                  padding: "2px 10px",
                  borderRadius: 20,
                }}
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
                      : { background: "rgba(0,0,0,0.05)", color: "#64748b", border: "1px solid rgba(0,0,0,0.08)" }
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
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
                      (e.currentTarget as HTMLElement).style.color = "#64748b";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.08)";
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
              <svg
                className="w-16 h-16 mb-6 text-text-muted/30"
                fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
              >
                {proyectos.length === 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
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
                      : "Intentá ajustar los filtros de búsqueda"}
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
                  style={{ height: 320, background: "rgba(0,0,0,0.04)", animation: "pulse 1.5s ease-in-out infinite" }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
