"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FwdIsotipo } from "@/components/ui/fwd-logo";
import AnimatedProjectsTitle from "@/components/AnimatedProjectsTitle";

/* ── Datos ───────────────────────────────────────── */
const PROYECTOS = [
  { id:"1", titulo:"Sistema de gestión de inventario con IA",   area:"Retail & Logística",  techs:["React","Node.js","PostgreSQL"],        empresario:"Carlos Mora",       dias:12, color:"#008FD5" },
  { id:"2", titulo:"Plataforma de pagos digitales para PYMES",  area:"Fintech",             techs:["Next.js","Stripe","Supabase"],          empresario:"Ana Jiménez",       dias:5,  color:"#ED008C" },
  { id:"3", titulo:"App móvil de telemedicina",                 area:"Salud & Bienestar",   techs:["React Native","Firebase","Python"],     empresario:"Dr. Luis Solano",   dias:20, color:"#662E91" },
  { id:"4", titulo:"Dashboard de análisis de ventas",           area:"Finanzas",            techs:["React","D3.js","Node.js"],              empresario:"María Rodríguez",   dias:8,  color:"#20BEC7" },
  { id:"5", titulo:"Automatización de procesos RH",             area:"Operaciones",         techs:["Python","FastAPI","PostgreSQL"],        empresario:"Roberto Chaves",    dias:15, color:"#FFCB05" },
  { id:"6", titulo:"E-commerce con recomendaciones IA",         area:"Mercadeo",            techs:["Next.js","Supabase","OpenAI"],          empresario:"Laura Vega",        dias:3,  color:"#F8901F" },
];

const AREAS  = ["All areas","Retail & Logística","Fintech","Salud & Bienestar","Tecnología","Mercadeo","Finanzas","Operaciones"];
const TECHS  = ["All technologies","React","Next.js","Node.js","Python","PostgreSQL","Supabase","Firebase","React Native"];

/* ── Page ────────────────────────────────────────── */
export default function ProyectosPage() {
  const [search,  setSearch]  = useState("");
  const [area,    setArea]    = useState("All areas");
  const [tech,    setTech]    = useState("All technologies");

  const filtrados = useMemo(() => PROYECTOS.filter((p) => {
    const matchSearch = p.titulo.toLowerCase().includes(search.toLowerCase()) || p.empresario.toLowerCase().includes(search.toLowerCase());
    const matchArea   = area === "All areas"        || p.area  === area;
    const matchTech   = tech === "All technologies" || p.techs.includes(tech);
    return matchSearch && matchArea && matchTech;
  }), [search, area, tech]);

  const clearFilters = () => { setSearch(""); setArea("All areas"); setTech("All technologies"); };
  const hasFilters   = search !== "" || area !== "All areas" || tech !== "All technologies";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── HERO HEADER + FILTROS ────────────────── */}
      <section
        className="relative pt-32 pb-16 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #0a2a4e 50%, #008FD4 100%)" }}
      >
        {/* Brillo radial decorativo */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(32,190,198,0.12) 0%, transparent 60%)" }} />

        {/* Isotipo decorativo derecha */}
        <div className="pointer-events-none absolute right-[-60px] top-1/2 -translate-y-1/2 opacity-20">
          <FwdIsotipo style={{ width: "420px", height: "auto" }} />
        </div>
        {/* Isotipo pequeño izquierda */}
        <div className="pointer-events-none absolute left-[-40px] bottom-[-20px] opacity-10">
          <FwdIsotipo style={{ width: "200px", height: "auto" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#20BEC7] text-xs font-semibold uppercase tracking-widest mb-4">
            ▶▶ IN PROGRESS
          </p>
          <AnimatedProjectsTitle text="Available Projects" className="text-center mb-4" />
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
            Find the perfect project that matches your skills
          </p>

          {/* Barra de búsqueda grande */}
          <div className="relative mb-4">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search projects, technologies, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/10 border border-white/20 text-white text-base placeholder-white/40 focus:outline-none focus:border-[#20BEC6] focus:bg-white/15 transition-all backdrop-blur-sm"
            />
          </div>

          {/* Filtros secundarios */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#20BEC6] transition-colors cursor-pointer backdrop-blur-sm"
            >
              {AREAS.map((a) => <option key={a} className="text-gray-800">{a}</option>)}
            </select>

            <select
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-[#20BEC6] transition-colors cursor-pointer backdrop-blur-sm"
            >
              {TECHS.map((t) => <option key={t} className="text-gray-800">{t}</option>)}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 rounded-xl border border-white/20 text-white/70 text-sm font-semibold hover:border-[#ED008C] hover:text-[#ED008C] transition-all duration-200 backdrop-blur-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── GRID ─────────────────────────────────── */}
      <section className="bg-white py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Contador */}
          <p className="text-gray-400 text-sm mb-8">
            {filtrados.length} project{filtrados.length !== 1 ? "s" : ""} found
          </p>

          {filtrados.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map((proj) => (
                <Link key={proj.id} href={`/proyectos/${proj.id}`} className="block">
                  <article
                    className="group relative rounded-3xl p-7 flex flex-col shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-[1.03] hover:brightness-110 hover:shadow-2xl h-full"
                    style={{ backgroundColor: proj.color, color: proj.color === "#FFCB05" ? "#0e1628" : "white" }}
                  >
                    {/* Shine sweep */}
                    <span className="pointer-events-none absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/15 skew-x-[-20deg] transition-transform duration-700 z-0" />
                    <span className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-white/0 group-hover:bg-white/40 transition-all duration-300 z-10" />

                    <span className="relative z-10 text-xs font-bold text-white/70 uppercase tracking-widest mb-3">{proj.area}</span>
                    <h3 className="relative z-10 font-heading font-black text-white text-xl leading-snug mb-5 flex-1">{proj.titulo}</h3>
                    <div className="relative z-10 flex flex-wrap gap-2 mb-6">
                      {proj.techs.map((t) => (
                        <span key={t} className="bg-white/20 group-hover:bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-300">{t}</span>
                      ))}
                    </div>
                    <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/20">
                      <span className="text-white/80 text-sm">por <span className="font-bold text-white">{proj.empresario}</span></span>
                      <span className="bg-[#FFCB05] group-hover:bg-white group-hover:scale-105 text-[#0e1628] text-xs font-black px-3 py-1 rounded-full transition-all duration-300">{proj.dias}d left</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            /* Estado vacío */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg className="w-16 h-16 text-white/20 mb-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <p className="text-white/50 text-lg font-semibold mb-2">No projects found</p>
              <p className="text-white/30 text-sm mb-6">Try adjusting your filters</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                style={{ background: "linear-gradient(90deg,#20BEC6,#008FD4)" }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
