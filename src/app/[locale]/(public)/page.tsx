import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudentCarousel from "@/components/StudentCarousel";
import HeroCarousel from "@/components/HeroCarousel";

/* ─── Hardcoded data ─────────────────────────────── */

const proyectos = [
  {
    id: 1,
    titulo: "Sistema de gestión de inventario con IA",
    area: "Retail & Logística",
    tecnologias: ["React", "Node.js", "PostgreSQL"],
    empresario: "Carlos Mora",
    diasRestantes: 12,
    color: "#008FD5",
  },
  {
    id: 2,
    titulo: "Plataforma de pagos digitales para PYMES",
    area: "Fintech",
    tecnologias: ["Next.js", "Stripe", "Supabase"],
    empresario: "Ana Jiménez",
    diasRestantes: 5,
    color: "#ED008C",
  },
  {
    id: 3,
    titulo: "App móvil de telemedicina",
    area: "Salud & Bienestar",
    tecnologias: ["React Native", "Firebase", "Python"],
    empresario: "Dr. Luis Solano",
    diasRestantes: 20,
    color: "#662E91",
  },
];

const pasosEmpresario = [
  "Describís tu idea al agente IA",
  "El agente genera los requerimientos",
  "Publicás el proyecto",
  "Recibís prototipos y elegís el mejor",
];

const pasosEstudiante = [
  "Explorás proyectos disponibles",
  "Enviás tu propuesta y prototipo",
  "Si te eligen, desarrollás la solución",
  "Ganás reputación y experiencia real",
];

/* ─── Page ───────────────────────────────────────── */

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden flex-1">
        <HeroCarousel />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 md:pt-36 md:pb-24">
          <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-fwd-turquoise text-xs font-semibold uppercase tracking-widest mb-6">
                <span className="text-fwd-blue">▶▶</span> Plataforma de
                innovación · FWD Costa Rica
              </span>

              <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
                Conectamos empresarios con{" "}
                <span className="text-[#ED008C]">talento tecnológico</span> de
                FWD Costa Rica
              </h1>

              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 font-light">
                Publicá tu proyecto, recibí prototipos de estudiantes
                verificados y elegí la mejor solución. Sin riesgo, con
                resultados reales.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-[#FFCB05] text-fwd-navy font-bold px-8 py-4 rounded-xl transition-all duration-300 text-base hover:scale-105 hover:brightness-110 active:scale-95"
                  style={{ boxShadow: "0 4px 25px #FFCB0566, 0 10px 40px #FFCB0533" }}
                >
                  Publicar un proyecto <span aria-hidden="true">▶</span>
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#FFCB05] text-[#FFCB05] font-bold px-8 py-4 rounded-xl transition-all duration-300 text-base hover:scale-105 hover:bg-[#FFCB05] hover:text-fwd-navy active:scale-95"
                >
                  Explorar proyectos
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-heading font-black text-5xl md:text-6xl text-fwd-navy mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-gray-500 text-xl max-w-xl mx-auto">
              Un proceso simple para conectar ideas con talento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* ── Empresario */}
            <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 flex flex-col">
              {/* Badge + icon */}
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[#008FD5] flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                    <line x1="10" y1="14" x2="14" y2="14" />
                  </svg>
                </div>
                <span className="font-heading font-black text-2xl text-fwd-navy tracking-tight">
                  Empresario
                </span>
              </div>

              {/* Steps */}
              <ol className="flex flex-col gap-6 flex-1">
                {pasosEmpresario.map((texto, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#008FD5] text-white text-sm font-black flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 font-medium text-base pt-1.5 leading-snug">{texto}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-10">
                <Link
                  href="/register?tipo=empresa"
                  className="block w-full text-center bg-[#008FD5] hover:bg-[#008FD5]/90 text-white font-black py-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-base tracking-wide"
                >
                  Empezar como Empresa
                </Link>
              </div>
            </div>

            {/* ── Estudiante */}
            <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 flex flex-col">
              {/* Badge + icon */}
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[#662E91] flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <span className="font-heading font-black text-2xl text-fwd-navy tracking-tight">
                  Estudiante
                </span>
              </div>

              {/* Steps */}
              <ol className="flex flex-col gap-6 flex-1">
                {pasosEstudiante.map((texto, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#662E91] text-white text-sm font-black flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 font-medium text-base pt-1.5 leading-snug">{texto}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-10">
                <Link
                  href="/register?tipo=estudiante"
                  className="block w-full text-center bg-[#662E91] hover:bg-[#662E91]/90 text-white font-black py-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-base tracking-wide"
                >
                  Empezar como Estudiante
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PROYECTOS RECIENTES ───────────────────── */}
      <section className="bg-[#0e1628] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between mb-14">
            <div>
              <p className="text-[#20BEC7] text-xs font-semibold uppercase tracking-widest mb-2">
                En curso
              </p>
              <h2 className="font-heading font-black text-4xl md:text-5xl text-white">
                Proyectos disponibles
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="hidden sm:inline-flex items-center gap-2 border border-white/20 hover:border-[#FFCB05] text-white hover:text-[#FFCB05] font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-200"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {proyectos.map((p) => (
              <article
                key={p.id}
                className="rounded-3xl p-7 flex flex-col hover:scale-105 transition-transform duration-300 shadow-lg"
                style={{ backgroundColor: p.color }}
              >
                {/* Área */}
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">
                  {p.area}
                </span>

                {/* Título */}
                <h3 className="font-heading font-black text-white text-xl leading-snug mb-5 flex-1">
                  {p.titulo}
                </h3>

                {/* Tech chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tecnologias.map((tech) => (
                    <span
                      key={tech}
                      className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-white/80 text-sm">
                    por <span className="font-bold text-white">{p.empresario}</span>
                  </span>
                  <span className="bg-[#FFCB05] text-[#0e1628] text-xs font-black px-3 py-1 rounded-full">
                    {p.diasRestantes}d restantes
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link href="/marketplace" className="text-[#FFCB05] font-semibold text-sm">
              Ver todos los proyectos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ──────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">

            {/* Rápido */}
            <div className="flex flex-col items-center text-center p-10 rounded-2xl hover:scale-105 transition-transform duration-300 shadow-md bg-[#008FD5]">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="font-heading font-black text-white text-2xl mb-3">Rápido</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                De la idea al prototipo en días, no meses.
              </p>
            </div>

            {/* Seguro */}
            <div className="flex flex-col items-center text-center p-10 rounded-2xl hover:scale-105 transition-transform duration-300 shadow-md bg-[#ED008C]">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h3 className="font-heading font-black text-white text-2xl mb-3">Seguro</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Contratos inteligentes y revisión de IA.
              </p>
            </div>

            {/* Colaborativo */}
            <div className="flex flex-col items-center text-center p-10 rounded-2xl hover:scale-105 transition-transform duration-300 shadow-md bg-[#662E91]">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-heading font-black text-white text-2xl mb-3">Colaborativo</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Talento joven guiado por expertos locales.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── CAROUSEL ESTUDIANTES ─────────────────── */}
      <StudentCarousel />

      <Footer />
    </div>
  );
}
