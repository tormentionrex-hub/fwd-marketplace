import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudentCarousel from "@/components/StudentCarousel";
import HeroCarousel from "@/components/HeroCarousel";
import FloatingTriangles from "@/components/FloatingTriangles";
import WaveFunciona from "@/components/WaveFunciona";
import AnimatedProjectsTitle from "@/components/AnimatedProjectsTitle";
import AnimatedHeroTitle from "@/components/AnimatedHeroTitle";
import TiltCard from "@/components/TiltCard";
import AnimatedSubtitle from "@/components/AnimatedSubtitle";

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

/* ─── Page ───────────────────────────────────────── */

export default async function Home() {
  const h  = await getTranslations("Hero");
  const hw = await getTranslations("HowItWorks");
  const p  = await getTranslations("Projects");
  const f  = await getTranslations("Features");

  const pasosEmpresario = [hw("paso1Emp"), hw("paso2Emp"), hw("paso3Emp"), hw("paso4Emp")];
  const pasosEstudiante = [hw("paso1Est"), hw("paso2Est"), hw("paso3Est"), hw("paso4Est")];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <FloatingTriangles />
      <Navbar />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden flex-1 bg-[#0e1628]">
        <HeroCarousel />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 md:pt-36 md:pb-24">
          <div className="max-w-3xl">
            <span data-hero="badge" className="inline-flex items-center gap-2 text-fwd-turquoise text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="text-fwd-blue">▶▶</span> {h("badge")}
            </span>

            <AnimatedHeroTitle
              title1={h("title1")}
              titleHighlight={h("titleHighlight")}
              title2={h("title2")}
            />

            <p data-hero="desc" className="text-gray-200 text-xl md:text-2xl leading-relaxed mb-10 font-light">
              {h("desc")}
            </p>

            <div data-hero="cta" className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-[#FFCB05] text-fwd-navy font-bold px-8 py-4 rounded-xl transition-all duration-300 text-base hover:scale-105 hover:brightness-110 active:scale-95"
                style={{ boxShadow: "0 4px 25px #FFCB0566, 0 10px 40px #FFCB0533" }}
              >
                {h("ctaPublicar")} <span aria-hidden="true">▶</span>
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 border-2 border-[#FFCB05] text-[#FFCB05] font-bold px-8 py-4 rounded-xl transition-all duration-300 text-base hover:scale-105 hover:bg-[#FFCB05] hover:text-fwd-navy active:scale-95"
              >
                {h("ctaExplorar")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────── */}
      {/* Sin `relative`: si la sección se posiciona, su fondo pinta ENCIMA de la capa
          de FloatingTriangles (z-0) y la franja pierde la decoración. El div interno
          ya es `relative` y mantiene el contenido por encima. */}
      <section className="py-28 overflow-hidden" style={{ background: "#f7f6f4" }}>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <div data-reveal="heading" className="flex justify-center mb-4">
              <WaveFunciona />
            </div>
            <AnimatedSubtitle text="Un proceso simple para conectar ideas con talento." />
          </div>

          <div data-reveal="stagger" className="grid md:grid-cols-2 gap-6">

            {/* ── Empresario */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#008FD5] flex items-center justify-center shadow-sm flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
                  </svg>
                </div>
                <span className="font-heading font-black text-2xl text-[#008FD5]">{hw("empresario")}</span>
              </div>

              <ol className="flex flex-col gap-5 flex-1">
                {pasosEmpresario.map((texto, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#008FD5] text-[#008FD5] text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-base font-normal leading-snug">{texto}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="btn-empresa group relative flex items-center justify-center gap-3 w-full text-white font-bold py-4 rounded-xl overflow-hidden uppercase tracking-widest text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_#008FD566] active:scale-95"
                  style={{ background: "linear-gradient(90deg,#008FD5,#20BEC6)" }}
                >
                  <span className="relative z-10">{hw("ctaEmpresa")}</span>
                  <span className="relative z-10 text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700" />
                </Link>
              </div>
            </div>

            {/* ── Estudiante */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#662E91] flex items-center justify-center shadow-sm flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <span className="font-heading font-black text-2xl text-[#662E91]">{hw("estudiante")}</span>
              </div>

              <ol className="flex flex-col gap-5 flex-1">
                {pasosEstudiante.map((texto, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#662E91] text-[#662E91] text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-base font-normal leading-snug">{texto}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-8">
                <Link
                  href="/register-estudiante"
                  className="group relative flex items-center justify-center gap-3 w-full text-white font-bold py-4 rounded-xl overflow-hidden uppercase tracking-widest text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_#662E9166] active:scale-95"
                  style={{ background: "linear-gradient(90deg,#662E91,#ED008C)" }}
                >
                  <span className="relative z-10">{hw("ctaEstudiante")}</span>
                  <span className="relative z-10 text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700" />
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
              <p data-reveal="fade-left" className="text-[#20BEC7] text-xs font-semibold uppercase tracking-widest mb-2">{p("badge")}</p>
              <AnimatedProjectsTitle text={p("title")} />
            </div>
            <Link
              data-reveal="fade-right"
              href="/marketplace"
              className="hidden sm:inline-flex items-center gap-2 border border-white/20 hover:border-[#FFCB05] text-white hover:text-[#FFCB05] font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-200"
            >
              {p("verTodos")}
            </Link>
          </div>

          <div data-reveal="stagger" className="grid md:grid-cols-3 gap-6">
            {proyectos.map((proj) => (
              <Link key={proj.id} href="/proyectos" className="block">
                <article
                  className="rounded-3xl p-7 flex flex-col hover:scale-105 transition-transform duration-300 shadow-lg"
                  style={{ backgroundColor: proj.color }}
                >
                  <span className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">{proj.area}</span>
                  <h3 className="font-heading font-black text-white text-xl leading-snug mb-5 flex-1">{proj.titulo}</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {proj.tecnologias.map((tech) => (
                      <span key={tech} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{tech}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <span className="text-white/80 text-sm">por <span className="font-bold text-white">{proj.empresario}</span></span>
                    <span className="bg-[#FFCB05] text-[#0e1628] text-xs font-black px-3 py-1 rounded-full">{proj.diasRestantes}{p("restantes")}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link href="/marketplace" className="text-[#FFCB05] font-semibold text-sm">Ver todos los proyectos →</Link>
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ──────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal="stagger" className="grid md:grid-cols-3 gap-6">

            <TiltCard
              className="flex flex-col items-center text-center p-10 rounded-2xl shadow-lg bg-[#008FD5]"
              style={{ boxShadow: "0 10px 40px rgba(0,143,213,0.4)" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-5 relative z-20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="font-heading font-black text-white text-2xl mb-3 relative z-20">{f("rapidoTitle")}</h3>
              <p className="text-white/80 text-sm leading-relaxed relative z-20">{f("rapidoDesc")}</p>
            </TiltCard>

            <TiltCard
              className="flex flex-col items-center text-center p-10 rounded-2xl shadow-lg bg-[#ED008C]"
              style={{ boxShadow: "0 10px 40px rgba(237,0,140,0.4)" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-5 relative z-20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h3 className="font-heading font-black text-white text-2xl mb-3 relative z-20">{f("seguroTitle")}</h3>
              <p className="text-white/80 text-sm leading-relaxed relative z-20">{f("seguroDesc")}</p>
            </TiltCard>

            <TiltCard
              className="flex flex-col items-center text-center p-10 rounded-2xl shadow-lg"
              style={{ background: "linear-gradient(135deg,#662E91,#9B30D9)", boxShadow: "0 10px 40px rgba(102,46,145,0.4)" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-5 relative z-20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-heading font-black text-white text-2xl mb-3 relative z-20">{f("colaborativoTitle")}</h3>
              <p className="text-white/80 text-sm leading-relaxed relative z-20">{f("colaborativoDesc")}</p>
            </TiltCard>

          </div>
        </div>
      </section>

      {/* ── CAROUSEL ESTUDIANTES ─────────────────── */}
      <StudentCarousel />

      <Footer />
    </div>
  );
}
