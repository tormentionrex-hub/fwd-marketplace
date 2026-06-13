"use client";

import { useMemo, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import ProductCard from "@/components/features/cards/ProductCard";
import type { Complejidad, Prioridad, ProductoMarketplace, TipoProyecto } from "@/types/marketplace";
import AnimatedMarketplaceTitle from "@/components/AnimatedMarketplaceTitle";
import SelectFWD from "@/components/SelectFWD";
import { FwdIsotipo } from "@/components/ui/fwd-logo";
import ParticleBackground from "@/components/ParticleBackground";

/* ── Opciones de filtros ─────────────────────────── */
const TODO_TIPO      = "Todos los tipos";
const TODO_LENGUAJE  = "Todos los lenguajes";
const TODA_PRIORIDAD = "Prioridad";
const TODA_COMPLEJIDAD = "Complejidad";

const TIPOS: [string, ...string[]] = [
  TODO_TIPO, "Turismo", "Skills", "Resolución de problemas", "Automatizaciones",
];

const LENGUAJES: [string, ...string[]] = [
  TODO_LENGUAJE,
  "JavaScript", "TypeScript", "Ruby", "Python",
  "React", "Node.js", "Next.js", "SQL", "Go", "PHP", "Swift",
];

const PRIORIDADES: [string, ...string[]] = [TODA_PRIORIDAD, "Alta", "Media", "Baja"];
const COMPLEJIDADES: [string, ...string[]] = [TODA_COMPLEJIDAD, "Principiante", "Intermedio", "Avanzado"];
const ORDENES_OPCIONES: [string, ...string[]] = ["Más recientes", "Más populares", "Mejor valorados"];

interface Props {
  productos: ProductoMarketplace[];
  locale: string;
}

export default function MarketplaceExplorer({ productos, locale }: Props) {
  const [query,       setQuery]       = useState("");
  const [tipo,        setTipo]        = useState(TODO_TIPO);
  const [lenguaje,    setLenguaje]    = useState(TODO_LENGUAJE);
  const [prioridad,   setPrioridad]   = useState(TODA_PRIORIDAD);
  const [complejidad, setComplejidad] = useState(TODA_COMPLEJIDAD);
  const [orden,       setOrden]       = useState(ORDENES_OPCIONES[0]);
  const [pagina,      setPagina]      = useState(1);

  const POR_PAGINA = 6;

  const hasFilters =
    query !== "" ||
    tipo        !== TODO_TIPO ||
    lenguaje    !== TODO_LENGUAJE ||
    prioridad   !== TODA_PRIORIDAD ||
    complejidad !== TODA_COMPLEJIDAD;

  const clearFilters = () => {
    setQuery("");
    setTipo(TODO_TIPO); setLenguaje(TODO_LENGUAJE);
    setPrioridad(TODA_PRIORIDAD); setComplejidad(TODA_COMPLEJIDAD);
    setPagina(1);
  };

  const visibles = useMemo(() => {
    let lista = productos.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchTexto =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.autor.toLowerCase().includes(q);

      const matchTipo      = tipo === TODO_TIPO || !p.tipoProyecto || p.tipoProyecto === (tipo as TipoProyecto);
      const matchLenguaje  = lenguaje === TODO_LENGUAJE || (p.lenguajes ?? []).includes(lenguaje);
      const matchPrioridad = prioridad === TODA_PRIORIDAD || !p.prioridad || p.prioridad === (prioridad as Prioridad);
      const matchComplex   = complejidad === TODA_COMPLEJIDAD || !p.complejidad || p.complejidad === (complejidad as Complejidad);

      return matchTexto && matchTipo && matchLenguaje && matchPrioridad && matchComplex;
    });

    if (orden === "Mejor valorados") {
      lista = [...lista].sort((a, b) => b.calificacion - a.calificacion);
    } else if (orden === "Más populares") {
      lista = [...lista].sort(
        (a, b) =>
          Number(b.destacado ?? false) - Number(a.destacado ?? false) ||
          b.calificacion - a.calificacion,
      );
    }
    return lista;
  }, [productos, query, orden, tipo, lenguaje, prioridad, complejidad]);

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
        {/* Brillo radial */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(32,190,198,0.12) 0%, transparent 60%)" }}
        />
        {/* Isotipo derecha */}
        <div className="pointer-events-none absolute right-[-60px] top-1/2 -translate-y-1/2 opacity-20">
          <FwdIsotipo style={{ width: "420px", height: "auto" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Logo giratorio — esquina superior izquierda del contenido */}
          <div
            className="pointer-events-none absolute hidden lg:block"
            style={{
              left: "-45px",
              top: "-30px",
              animation: "spinLogo 18s linear infinite",
            }}
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
              placeholder="Buscar proyectos, tecnologías, empresas, nombres..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none transition-all backdrop-blur-sm"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#20BEC6";
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
            />
          </div>

          {/* Fila de filtros con SelectFWD */}
          <div className="flex flex-wrap gap-3 justify-center">
            <SelectFWD value={tipo}        onChange={setTipo}        options={TIPOS} />
            <SelectFWD value={lenguaje}    onChange={setLenguaje}    options={LENGUAJES} />
            <SelectFWD value={prioridad}   onChange={setPrioridad}   options={PRIORIDADES} />
            <SelectFWD value={complejidad} onChange={setComplejidad} options={COMPLEJIDADES} />
            <SelectFWD value={orden}       onChange={setOrden}       options={ORDENES_OPCIONES} />
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

        {/* Contador */}
        <p className="text-text-muted text-sm mb-8" id="marketplace-grid">
          {visibles.length} resultado{visibles.length !== 1 ? "s" : ""} encontrado{visibles.length !== 1 ? "s" : ""}
          {totalPaginas > 1 && <span className="ml-2 text-text-muted/60">· Página {pagina} de {totalPaginas}</span>}
        </p>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {paginados.map((producto, index) => (
            <ScrollReveal key={producto.id} delay={(index % 3) * 120}>
              <ProductCard producto={producto} locale={locale} />
            </ScrollReveal>
          ))}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">

            {/* Flecha anterior */}
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

            {/* Números */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => cambiarPagina(n)}
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 hover:scale-110 active:scale-95"
                style={
                  n === pagina
                    ? {
                        background: "linear-gradient(135deg, #20BEC6, #008FD5)",
                        color: "white",
                        boxShadow: "0 4px 20px rgba(32,190,198,0.5), 0 0 0 3px rgba(32,190,198,0.2)",
                      }
                    : {
                        background: "rgba(0,0,0,0.05)",
                        color: "#64748b",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }
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

            {/* Flecha siguiente */}
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
        {visibles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg
              className="w-16 h-16 mb-6 text-text-muted/30"
              fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-text-muted text-lg font-semibold mb-2">Sin resultados</p>
            <p className="text-text-muted/60 text-sm mb-6">Intentá ajustar los filtros de búsqueda</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:scale-105"
              style={{ background: "linear-gradient(90deg, #20BEC6, #008FD4)" }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

