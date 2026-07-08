"use client";

import React, { useMemo, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import VacanteCard from "@/components/features/marketplace/VacanteCard";
import MarketplaceTabs from "@/components/features/marketplace/MarketplaceTabs";
import SelectFWD from "@/components/SelectFWD";
import TechFilterDropdown from "@/components/features/marketplace/TechFilterDropdown";
import AnimatedMarketplaceTitle from "@/components/AnimatedMarketplaceTitle";
import { FwdIsotipo } from "@/components/ui/fwd-logo";
import ParticleBackground from "@/components/ParticleBackground";
import type { VacanteMarketplace } from "@/types/vacante";
import { TIPO_EMPLEO_LABEL, type TipoEmpleo } from "@/types/vacante";
import { MODALIDAD_LABEL, type Modalidad } from "@/lib/empleabilidad";

const TODA_AREA = "Todas las áreas";
const TODA_TECH = "Todas las tecnologías";
const TODA_MODALIDAD = "Cualquier modalidad";
const TODO_TIPO = "Cualquier tipo";
const ORDENES: [string, ...string[]] = ["Más recientes", "Más antiguas"];

interface Props {
  vacantes: VacanteMarketplace[];
  locale: string;
}

export default function VacantesExplorer({ vacantes, locale }: Props) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState(TODA_AREA);
  const [tech, setTech] = useState(TODA_TECH);
  const [modalidad, setModalidad] = useState(TODA_MODALIDAD);
  const [tipo, setTipo] = useState(TODO_TIPO);
  const [orden, setOrden] = useState(ORDENES[0]);
  const [pagina, setPagina] = useState(1);

  const POR_PAGINA = 6;

  const areasOpciones = useMemo<[string, ...string[]]>(() => {
    const set = new Set<string>();
    vacantes.forEach((v) => { if (v.area) set.add(v.area); });
    return [TODA_AREA, ...Array.from(set).sort()];
  }, [vacantes]);

  const techOpciones = useMemo<[string, ...string[]]>(() => {
    const set = new Set<string>();
    vacantes.forEach((v) => v.tecnologias.forEach((t) => set.add(t)));
    return [TODA_TECH, ...Array.from(set).sort()];
  }, [vacantes]);

  const modalidadesOpciones = useMemo<[string, ...string[]]>(() => {
    const set = new Set<string>();
    vacantes.forEach((v) => { if (v.modalidad) set.add(MODALIDAD_LABEL[v.modalidad as Modalidad] ?? v.modalidad); });
    return [TODA_MODALIDAD, ...Array.from(set).sort()];
  }, [vacantes]);

  const tiposOpciones = useMemo<[string, ...string[]]>(() => {
    const set = new Set<string>();
    vacantes.forEach((v) => { if (v.tipoEmpleo) set.add(TIPO_EMPLEO_LABEL[v.tipoEmpleo as TipoEmpleo] ?? v.tipoEmpleo); });
    return [TODO_TIPO, ...Array.from(set).sort()];
  }, [vacantes]);

  const hasFilters =
    query !== "" || area !== TODA_AREA || tech !== TODA_TECH ||
    modalidad !== TODA_MODALIDAD || tipo !== TODO_TIPO;

  const clearFilters = () => {
    setQuery(""); setArea(TODA_AREA); setTech(TODA_TECH);
    setModalidad(TODA_MODALIDAD); setTipo(TODO_TIPO); setOrden(ORDENES[0]); setPagina(1);
  };

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    let lista = vacantes.filter((v) => {
      const matchQ = !q ||
        v.titulo.toLowerCase().includes(q) ||
        v.descripcion.toLowerCase().includes(q) ||
        (v.empresario.nombreEmpresa ?? "").toLowerCase().includes(q) ||
        v.empresario.nombre.toLowerCase().includes(q) ||
        (v.area ?? "").toLowerCase().includes(q) ||
        v.tecnologias.some((t) => t.toLowerCase().includes(q));
      const matchArea = area === TODA_AREA || v.area === area;
      const matchTech = tech === TODA_TECH || v.tecnologias.includes(tech);
      const modLabel = v.modalidad ? (MODALIDAD_LABEL[v.modalidad as Modalidad] ?? v.modalidad) : null;
      const matchMod = modalidad === TODA_MODALIDAD || modLabel === modalidad;
      const tipoLabel = v.tipoEmpleo ? (TIPO_EMPLEO_LABEL[v.tipoEmpleo as TipoEmpleo] ?? v.tipoEmpleo) : null;
      const matchTipo = tipo === TODO_TIPO || tipoLabel === tipo;
      return matchQ && matchArea && matchTech && matchMod && matchTipo;
    });

    if (orden === "Más antiguas") {
      lista = [...lista].sort((a, b) => (a.publicado ?? "").localeCompare(b.publicado ?? ""));
    } else {
      lista = [...lista].sort((a, b) => (b.publicado ?? "").localeCompare(a.publicado ?? ""));
    }
    return lista;
  }, [vacantes, query, area, tech, modalidad, tipo, orden]);

  const totalPaginas = Math.ceil(visibles.length / POR_PAGINA);
  const paginados = visibles.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const cambiarPagina = (p: number) => {
    setPagina(p);
    document.getElementById("vacantes-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* ══ HERO ══ */}
      <section
        className="relative pt-32 pb-6"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #0a2a4e 50%, #008FD4 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(247,144,30,0.12) 0%, transparent 60%)" }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10">
            <FwdIsotipo style={{ width: "340px", height: "auto" }} />
          </div>
          <ParticleBackground />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#F7901E] text-xs font-semibold uppercase tracking-widest mb-4">
            &#9658;&#9658; VACANTES FWD
          </p>

          <AnimatedMarketplaceTitle text="Vacantes de empleo" className="text-center mb-4" />

          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
            Encontrá oportunidades laborales en las empresas de la comunidad FWD
          </p>

          {/* Búsqueda */}
          <div className="relative mb-5">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Busca por puesto, empresa, área o tecnología..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPagina(1); }}
              className="w-full pl-14 pr-6 py-5 rounded-2xl text-white text-base placeholder-white/40 focus:outline-none transition-all backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#F7901E"; e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            />
          </div>

          {/* Selector Proyectos / Vacantes */}
          <MarketplaceTabs locale={locale} activo="vacantes" />

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 justify-center">
            {areasOpciones.length > 1 && (
              <SelectFWD value={area} onChange={(v) => { setArea(v); setPagina(1); }} options={areasOpciones} />
            )}
            {modalidadesOpciones.length > 1 && (
              <SelectFWD value={modalidad} onChange={(v) => { setModalidad(v); setPagina(1); }} options={modalidadesOpciones} />
            )}
            {tiposOpciones.length > 1 && (
              <SelectFWD value={tipo} onChange={(v) => { setTipo(v); setPagina(1); }} options={tiposOpciones} />
            )}
            {techOpciones.length > 1 && (
              <TechFilterDropdown value={tech} onChange={(v) => { setTech(v); setPagina(1); }} options={techOpciones} />
            )}
            <SelectFWD value={orden} onChange={(v) => { setOrden(v); setPagina(1); }} options={ORDENES} />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 rounded-xl text-white/70 text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F7901E"; e.currentTarget.style.color = "#F7901E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
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
          <div className="flex items-center gap-3 mb-8" id="vacantes-grid">
            <p className="text-text-muted text-sm">
              {visibles.length} vacante{visibles.length !== 1 ? "s" : ""} abierta{visibles.length !== 1 ? "s" : ""}
              {totalPaginas > 1 && (
                <span className="ml-2 text-text-muted/60">· Página {pagina} de {totalPaginas}</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paginados.map((vacante, index) => (
              <ScrollReveal key={vacante.id} delay={(index % 3) * 120}>
                <VacanteCard vacante={vacante} locale={locale} />
              </ScrollReveal>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-14">
              <button
                onClick={() => cambiarPagina(pagina - 1)}
                disabled={pagina === 1}
                aria-label="Anterior"
                className="group relative w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #1a0a40, #662D91)" }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
                      ? { background: "linear-gradient(135deg, #F7901E, #EC008C)", color: "white", boxShadow: "0 4px 20px rgba(247,144,30,0.5)" }
                      : { background: "rgba(0,0,0,0.05)", color: "#64748b", border: "1px solid rgba(0,0,0,0.08)" }
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => cambiarPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                aria-label="Siguiente"
                className="group relative w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #662D91, #EC008C)" }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Estado vacío */}
          {visibles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg className="w-16 h-16 mb-6 text-text-muted/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" />
              </svg>
              {vacantes.length === 0 ? (
                <>
                  <p className="text-text-muted text-lg font-semibold mb-2">Aún no hay vacantes abiertas</p>
                  <p className="text-text-muted/60 text-sm">Las empresas están preparando sus ofertas de empleo. Volvé pronto.</p>
                </>
              ) : (
                <>
                  <p className="text-text-muted text-lg font-semibold mb-2">Sin resultados</p>
                  <p className="text-text-muted/60 text-sm mb-6">Intentá ajustar los filtros o limpiarlos para ver todas las vacantes.</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:scale-105"
                    style={{ background: "linear-gradient(90deg, #F7901E, #EC008C)" }}
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
