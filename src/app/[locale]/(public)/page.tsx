import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getUser } from "@/server/auth/get-user";
import { rutaPorRol } from "@/server/auth/rutas";
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
import WhatsAppButton from "@/components/WhatsAppButton";
import ExplorarMarketplaceBtn from "@/components/ExplorarMarketplaceBtn";
import { EmpresarioCard } from "@/components/features/home/EmpresarioCard";
import { EstudianteCard } from "@/components/features/home/EstudianteCard";
import { ProyectosRecientes } from "@/components/features/home/ProyectosRecientes";
import { listarProyectosParaMarketplace } from "@/server/services/proyecto.service";
import { RankingSeccion } from "@/components/features/ranking/RankingSeccion";
import { listarRankingEstudiantes } from "@/server/services/ranking.service";

/* ─── Page ───────────────────────────────────────── */

export default async function Home() {
  const h  = await getTranslations("Hero");
  const hw = await getTranslations("HowItWorks");
  const f  = await getTranslations("Features");

  const user = await getUser();
  const dashboardHref = user ? rutaPorRol(user.roles.nombre) : null;

  const pasosEmpresario = [hw("paso1Emp"), hw("paso2Emp"), hw("paso3Emp"), hw("paso4Emp")];
  const pasosEstudiante = [hw("paso1Est"), hw("paso2Est"), hw("paso3Est"), hw("paso4Est")];

  const proyectosRecientes = await listarProyectosParaMarketplace();

  const rankingData = await listarRankingEstudiantes(16);
  const hayMasRanking = rankingData.length > 15;
  const rankingEstudiantes = rankingData.slice(0, 15);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <FloatingTriangles />
      <Navbar dashboardHref={dashboardHref} />

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
              <ExplorarMarketplaceBtn />
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────── */}
      {/* Sin `relative`: si la sección se posiciona, su fondo pinta ENCIMA de la capa
          de FloatingTriangles (z-0) y la franja pierde la decoración. El div interno
          ya es `relative` y mantiene el contenido por encima. */}
      <section className="py-28 overflow-hidden bg-surface">

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

<div className="text-center mb-16">
            <div data-reveal="heading" className="flex justify-center mb-4">
              <WaveFunciona />
            </div>
            <AnimatedSubtitle text="Un proceso simple para conectar ideas con talento." />
          </div>

          <div data-reveal="stagger" className="grid md:grid-cols-2 gap-6">
            <EmpresarioCard
              pasos={pasosEmpresario}
              titulo={hw("empresario")}
              ctaLabel={dashboardHref ? "Continuar" : hw("ctaEmpresa")}
              ctaHref={dashboardHref ?? "/register"}
            />
            <EstudianteCard
              pasos={pasosEstudiante}
              titulo={hw("estudiante")}
              ctaLabel={dashboardHref ? "Continuar" : hw("ctaEstudiante")}
              ctaHref={dashboardHref ?? "/register-estudiante"}
            />
          </div>
        </div>
      </section>

      {/* ── PROYECTOS RECIENTES ───────────────────── */}
      <section className="bg-[#0e1628] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-14">
            <p className="text-[#20BEC7] text-xs font-semibold uppercase tracking-widest mb-2">
              Proyectos en el marketplace
            </p>
            <AnimatedProjectsTitle text="Proyectos más recientes en el marketplace" />
          </div>

          <ProyectosRecientes proyectos={proyectosRecientes} />

          {/* Botón Ver todos */}
          <div className="flex justify-center mt-14">
            <Link
              href="/marketplace"
              className="group relative overflow-hidden inline-flex items-center font-black text-base uppercase tracking-widest px-12 py-5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(0,143,213,0.45)] active:scale-95"
              style={{ background: "linear-gradient(90deg, #008FD5, #20BEC6)", color: "white" }}
            >
              <span className="relative z-10">Ver todos</span>
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/25 skew-x-[-20deg] transition-transform duration-700" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ──────────────────────── */}
      <section className="bg-surface-2 py-16">
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

      {/* ── VIDEO ESTUDIANTES ────────────────────── */}
      <StudentCarousel />

      {/* ── RANKING ESTUDIANTES ──────────────────── */}
      <section className="bg-[#0e1628] py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#FFD700] text-xs font-semibold uppercase tracking-widest mb-2">
              Talento FWD
            </p>
            <h2 className="font-heading font-black text-white text-4xl md:text-5xl leading-tight">
              Ranking de Estudiantes FWD
            </h2>
            <p className="text-white/50 text-base mt-4 max-w-lg mx-auto">
              Los estudiantes mejor calificados por empresarios reales, en proyectos reales.
            </p>
          </div>
          <RankingSeccion estudiantes={rankingEstudiantes} showVerMas={hayMasRanking} />
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
